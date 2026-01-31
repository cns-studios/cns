const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const expressStaticGzip = require('express-static-gzip');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'https://auth.cns-studios.com';

app.set('trust proxy', 1);

app.use(compression());
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).send('Maintenance');
  }
  next();
});

app.use('/', expressStaticGzip(path.join(__dirname, 'public'), {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

app.get('/health', (req, res) => {
    res.json({ status: 'up' });
});

app.get('/api/config', (req, res) => {
    res.json({ authServiceUrl: AUTH_SERVICE_URL });
});

app.get('/api/auth/status', async (req, res) => {
    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/api/status`, {
            headers: {
                Cookie: req.headers.cookie || ''
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ authenticated: false, error: 'Auth service unreachable' });
    }
});

app.get('/login', (req, res) => {
    res.redirect(`${AUTH_SERVICE_URL}/login?redirect_uri=${encodeURIComponent(req.protocol + '://' + req.get('host'))}`);
});

app.get('/signup', (req, res) => {
    res.redirect(`${AUTH_SERVICE_URL}/signup?redirect_uri=${encodeURIComponent(req.protocol + '://' + req.get('host'))}`);
});

app.get('/logout', (req, res) => {
    res.redirect(`${AUTH_SERVICE_URL}/logout?redirect_uri=${encodeURIComponent(req.protocol + '://' + req.get('host'))}`);
});

app.get('/github', (req, res) => {
    res.redirect('https://github.com/cns-studios');
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/docs.html'));
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

app.listen(port, () => {
    console.log(`✓ CNS Main App running on port ${port}`);
});
