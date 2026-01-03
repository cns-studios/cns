require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http'); // Using the native http module
const compression = require('compression');
const expressStaticGzip = require('express-static-gzip');

const app = express();
const port = process.env.PORT || 3000;

// The URL for the central authentication service
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';


app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Enable Gzip compression
app.use(compression());

// Serve static files with caching headers
app.use('/public', expressStaticGzip(path.join(__dirname, 'public'), {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));

// --- API Routes ---

app.get('/api/config', (req, res) => {
    res.json({ authServiceUrl: AUTH_SERVICE_URL });
});

app.get('/api/auth/status', (req, res) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.json({ authenticated: false });
    }

    try {
        const authUrl = new URL(AUTH_SERVICE_URL);
        const isHttps = authUrl.protocol === 'https:';
        const client = isHttps ? require('https') : require('http');
        const options = {
            hostname: authUrl.hostname,
            port: authUrl.port || (isHttps ? 443 : 80),
            path: '/api/me',
            method: 'GET',
            headers: {
                'Cookie': `auth_token=${token}`,
                'Accept': 'application/json'
            },
            timeout: 5000
        };

        const authReq = client.request(options, (authRes) => {
            let data = '';
            authRes.on('data', (chunk) => {
                data += chunk;
            });
            authRes.on('end', () => {
                try {
                    if (authRes.statusCode === 200) {
                        const userData = JSON.parse(data || '{}');
                        res.json({ authenticated: true, username: userData.username });
                    } else {
                        res.json({ authenticated: false });
                    }
                } catch (err) {
                    console.error('Error parsing auth response:', err);
                    res.status(502).json({ error: 'Invalid response from auth service' });
                }
            });
        });

        authReq.on('timeout', () => {
            authReq.destroy();
            res.status(504).json({ error: 'Auth service timeout' });
        });

        authReq.on('error', (error) => {
            console.error('Error calling auth service:', error);
            res.status(502).json({ error: 'Bad gateway' });
        });

        authReq.end();
    } catch (err) {
        console.error('Invalid AUTH_SERVICE_URL:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Static Page Routes ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
