const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { initDatabase, userOps } = require('./database');
const url = require('url');

const app = express();
const port = process.env.PORT || 3001;

// --- Critical Configuration ---
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE, 10);

if (!JWT_SECRET || !COOKIE_DOMAIN) {
    console.error('FATAL ERROR: JWT_SECRET and COOKIE_DOMAIN env variables are required.');
    process.exit(1);
}

// Whitelist of allowed domains for redirection to prevent open redirect vulnerabilities
const ALLOWED_REDIRECT_DOMAINS = [
    'cns-studios.com',
    // Add other main-level domains if necessary, e.g., 'localhost' for development
];

const SALT_ROUNDS = 10;

initDatabase();

// --- Middleware Setup ---
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1); // Trust first proxy for IP address
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));


// --- Security Middleware ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.clearCookie('auth_token', { domain: COOKIE_DOMAIN, path: '/' });
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};


// --- Validation Rules ---
const validateSignup = [
    body('username')
        .trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: letters, numbers, underscore only'),
    body('pin').matches(/^\d{4}$/).withMessage('PIN must be exactly 4 digits'),
    body('tos').equals('on').withMessage('You must accept the Terms of Service and Privacy Policy')
];

const validateLogin = [
    body('username').trim().notEmpty().withMessage('Username required'),
    body('pin').matches(/^\d{4}$/).withMessage('PIN must be 4 digits')
];


// --- Core Authentication Routes ---

app.post('/api/auth/signup', authLimiter, validateSignup, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, pin } = req.body;
    try {
        if (userOps.findByUsername(username)) {
            return res.status(409).json({ message: 'Username already taken' });
        }
        const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);
        userOps.create(username, pinHash);
        res.status(201).json({ message: 'Account created successfully', username });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

app.post('/api/auth/login', authLimiter, validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, pin } = req.body;
    try {
        const user = userOps.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or PIN' });
        }

        const pinMatch = await bcrypt.compare(pin, user.pin_hash);
        if (!pinMatch) {
            return res.status(401).json({ message: 'Invalid username or PIN' });
        }

        userOps.updateLastLogin(user.id, req.ip);

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            domain: COOKIE_DOMAIN,
            maxAge: COOKIE_MAX_AGE,
            path: '/'
        });

        res.json({ success: true, message: 'Login successful', username: user.username });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('auth_token', { domain: COOKIE_DOMAIN, path: '/' });
    const redirectUri = req.query.redirect_uri;
     if (redirectUri) {
        try {
            const parsedUrl = new url.URL(redirectUri);
            const isAllowed = ALLOWED_REDIRECT_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain));
            if (isAllowed) {
                return res.redirect(redirectUri);
            }
        } catch (e) {
            // Invalid URL, fall through
        }
    }
    res.status(200).send('Logged out successfully');
});

// --- Secure API for Sub-Services ---

app.get('/api/me', authenticateToken, (req, res) => {
    try {
        const userData = userOps.getUserData(req.user.userId);
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(userData);
    } catch (error) {
        console.error('API /api/me error:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

app.get('/api/data/:service', authenticateToken, (req, res) => {
    try {
        const { service } = req.params;
        const serviceData = userOps.getServiceData(req.user.userId, service);
        if (serviceData) {
            res.json(serviceData);
        } else {
            res.status(404).json({ message: `No data found for service: ${service}` });
        }
    } catch (error) {
        console.error(`API /api/data/${req.params.service} GET error:`, error);
        res.status(500).json({ message: 'Error fetching service data' });
    }
});

app.post('/api/data/:service', authenticateToken, (req, res) => {
    try {
        const { service } = req.params;
        const data = req.body;
        if (!data) {
            return res.status(400).json({ message: 'Request body cannot be empty.' });
        }
        userOps.updateServiceData(req.user.userId, service, data);
        res.status(200).json({ message: `Data for ${service} updated successfully.` });
    } catch (error) {
        console.error(`API /api/data/${req.params.service} POST error:`, error);
        res.status(500).json({ message: 'Error updating service data' });
    }
});


// --- UI Serving Routes ---
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});


// --- Server Initialization ---
app.listen(port, () => {
    console.log(`✓ CNS Auth Service running on http://localhost:${port}`);
});
