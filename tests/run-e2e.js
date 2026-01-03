const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');

function waitForServer(url, timeout = 5000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      http.get(url, (res) => {
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('Server did not start in time'));
        setTimeout(check, 200);
      });
    })();
  });
}

(async () => {
  console.log('Starting server...');
  const server = spawn('node', ['server.js'], { stdio: ['ignore', 'pipe', 'pipe'] });

  server.stdout.on('data', (d) => process.stdout.write(`[server] ${d.toString()}`));
  server.stderr.on('data', (d) => process.stderr.write(`[server:err] ${d.toString()}`));

  try {
    await waitForServer('http://localhost:3000/', 8000);
    console.log('Server is up, launching browser...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Check home page
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    if (!/CNS Studios/i.test(title)) throw new Error('Home title mismatch');
    const loginExists = await page.$('#login-btn');
    if (!loginExists) throw new Error('Login button missing on home page');

    // Check docs page
    await page.goto('http://localhost:3000/docs', { waitUntil: 'domcontentloaded' });
    const docsNav = await page.$('.docs-nav');
    if (!docsNav) throw new Error('Docs navigation missing');

    // Check contact page
    await page.goto('http://localhost:3000/contact', { waitUntil: 'domcontentloaded' });
    const contactForm = await page.$('#contactForm');
    if (!contactForm) throw new Error('Contact form missing');

    await browser.close();
    console.log('All smoke checks passed ✅');
  } catch (err) {
    console.error('E2E tests failed:', err);
    process.exitCode = 2;
  } finally {
    console.log('Shutting down server...');
    server.kill();
  }
})();