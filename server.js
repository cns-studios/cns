require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { initDatabase } = require('./database');

const app = express();
const port = process.env.PORT || 3000;

// The URL for the central authentication service
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

initDatabase();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Middleware to check for the authentication token.
 * If the token is not present, it redirects the user to the central login page.
 * This is a simple example of how a sub-service would protect its routes.
 */
const requireAuth = (req, res, next) => {
    if (!req.cookies.auth_token) {
        // Encode the original URL to be used as the redirect URI
        const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        // Redirect to the auth service's login page
        return res.redirect(`${AUTH_SERVICE_URL}/login?redirect_uri=${redirectUri}`);
    }
    // In a real application, you would typically verify the token by calling the auth service's /api/me endpoint here.
    // For this example, we'll assume the presence of the cookie is sufficient for basic access.
    next();
};

// --- Static Page Routes ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example of a protected route
app.get('/dashboard', requireAuth, (req, res) => {
    // This page is only accessible if the user is logged in
    res.send('Welcome to your protected dashboard!');
});

app.get('/login', (req, res) => {
    // This route now simply redirects to the central auth service
    const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/dashboard`);
    res.redirect(`${AUTH_SERVICE_URL}/login?redirect_uri=${redirectUri}`);
});

app.get('/signup', (req, res) => {
    // This route now simply redirects to the central auth service
    res.redirect(`${AUTH_SERVICE_URL}/signup`);
});

app.get('/logout', (req, res) => {
    const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/`);
    res.redirect(`${AUTH_SERVICE_URL}/logout?redirect_uri=${redirectUri}`);
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

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).send('Address not found');
});

// --- Server Initialization ---
app.listen(port, () => {
    console.log(`✓ CNS Main App running on http://localhost:${port}`);
});
