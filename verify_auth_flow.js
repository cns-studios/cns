const { chromium } = require('playwright');
const os = require('os');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const uniqueId = Date.now();
    const username = `testuser_${uniqueId}`;
    const pin = '1234';

    page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));

    const redirectTargetUrl = 'http://localhost:3001/success.html';
    const encodedRedirectUri = encodeURIComponent(redirectTargetUrl);

    // --- 1. Test Signup Flow ---
    console.log('--- Testing Signup ---');
    const signupUrl = `http://localhost:3001/signup?redirect_uri=${encodedRedirectUri}`;
    console.log(`Navigating to signup URL: ${signupUrl}`);
    await page.goto(signupUrl);

    await page.click('input[name="username"]');
    await page.keyboard.type(username);
    await page.click('input[name="pin"]');
    await page.keyboard.type(pin);
    await page.click('input[name="confirmPin"]');
    await page.keyboard.type(pin);
    await page.check('input[name="tos"]');

    console.log('Submitting signup form...');
    await page.click('button[type="submit"]');

    await page.waitForURL(redirectTargetUrl);
    console.log(`Successfully redirected to: ${page.url()}`);

    // --- 2. Test Login Flow ---
    console.log('\\n--- Testing Login ---');
    const loginUrl = `http://localhost:3001/login?redirect_uri=${encodedRedirectUri}`;
    console.log(`Navigating to login URL: ${loginUrl}`);
    await page.goto(loginUrl);

    await page.click('input[name="username"]');
    await page.keyboard.type(username);
    await page.click('input[name="pin"]');
    await page.keyboard.type(pin);

    console.log('Submitting login form...');
    await page.click('button[type="submit"]');

    await page.waitForURL(redirectTargetUrl);
    console.log(`Successfully redirected to: ${page.url()}`);

    // --- 3. Final Verification ---
    console.log('\\n--- Verification ---');
    console.log('Taking screenshot of the final success page...');
    const screenshotPath = path.join(os.homedir(), 'verification', 'success_page.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

    await browser.close();
    console.log('\\nAuthentication flow verified successfully!');
})();
