require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const { initDatabase, userOps } = require('./database');

const app = express();
const port = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-CHANGE-THIS';
if (JWT_SECRET === 'default-secret-key-CHANGE-THIS') {
    console.warn('WARNING: Using default JWT secret. Create a .env file with JWT_SECRET!');
}

const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE) || 604800000;
const SALT_ROUNDS = 10;

initDatabase();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        req.user = null;
        return next();
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
            res.clearCookie('auth_token')
        } else {
            req.user = user;
        }
        next();
    });
};

const validateSignup = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be 3-20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username: letters, numbers, underscore only'),
    body('pin')
        .matches(/^\d{4}$/)
        .withMessage('PIN must be exactly 4 digits')
];

const validateLogin = [
    body('username').trim().notEmpty().withMessage('Username required'),
    body('pin').matches(/^\d{4}$/).withMessage('PIN must be 4 digits')
];


app.post('/api/auth/signup', validateSignup, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: errors.array()[0].msg 
        });
    }
    
    const { username, pin } = req.body;
    
    try {
        const existingUser = userOps.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ 
                message: 'Username already taken' 
            });
        }
        
        const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);
        const result = userOps.create(username, pinHash);
        
        console.log(`✓ New user: ${username}`);
        
        res.status(201).json({
            message: 'Account created successfully',
            username: username
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: errors.array()[0].msg 
        });
    }
    
    const { username, pin, rememberMe } = req.body;
    
    try {
        const user = userOps.findByUsername(username);
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid username or PIN' 
            });
        }
        
        const pinMatch = await bcrypt.compare(pin, user.pin_hash);
        if (!pinMatch) {
            return res.status(401).json({ 
                message: 'Invalid username or PIN' 
            });
        }
        
        userOps.updateLastLogin(user.id);
        
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        const cookieOptions = {
            httpOnly: true,
            maxAge: rememberMe ? COOKIE_MAX_AGE : 3600000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        };
        
        res.cookie('auth_token', token, cookieOptions);
        
        console.log(`✓ Login: ${username}`);
        
        res.json({
            message: 'Login successful',
            username: user.username,
            userId: user.id
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/status', authenticateToken, (req, res) => {
    if (req.user) {
        res.json({ 
            authenticated: true,
            username: req.user.username,
            userId: req.user.userId
        });
    } else {
        res.json({ authenticated: false });
    }
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
        const userData = userOps.getUserData(req.user.userId);
        
        res.json({
            username: req.user.username,
            profile: userData.profile,
            settings: userData.settings
        });
        
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/discord', (req, res) => {
    res.redirect('https://discord.gg/akYFtsSH3j');
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'policy.html'));
});

app.get('/tos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tos.html'));
});

app.get('/support', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'support.html'));
});

app.get('/github', (req, res) => {
    res.redirect('https://github.com/cns-studios');
});

app.use((req, res) => {
    res.status(404).send('File not found');
});

app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`); 
});