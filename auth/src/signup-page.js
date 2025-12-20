document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('form');
    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    signupForm.appendChild(errorMessage);

    console.log('Signup page script loaded and DOM content is ready.');

    if (!signupForm) {
        console.error('Could not find the signup form on the page.');
        return;
    }

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Signup form submission initiated.');
        errorMessage.textContent = '';

        const tosCheckbox = signupForm.querySelector('input[name="tos"]');
        if (!tosCheckbox.checked) {
            const msg = 'You must agree to the Terms of Service to create an account.';
            console.warn(msg);
            errorMessage.textContent = msg;
            return;
        }

        const username = signupForm.username.value;
        const pin = signupForm.pin.value;
        const confirmPin = signupForm.confirmPin.value;

        if (pin !== confirmPin) {
            const msg = 'PINs do not match.';
            console.warn(msg);
            errorMessage.textContent = msg;
            return;
        }

        console.log(`Collected form data: username=${username}, pin=${pin.substring(0,1)}...`);

        const urlParams = new URLSearchParams(window.location.search);
        const redirectUri = urlParams.get('redirect_uri');
        console.log(`Target redirect URI: ${redirectUri}`);

        try {
            console.log('Sending POST request to /api/auth/signup...');
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, pin, tos: 'on' }), // Added tos to match server validation
            });

            console.log(`Received response with status: ${response.status}`);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                console.log('Signup successful. Redirecting...');
                if (redirectUri) {
                    window.location.href = redirectUri;
                } else {
                    console.warn('No redirect_uri found, redirecting to fallback /');
                    window.location.href = '/';
                }
            } else {
                console.error(`Signup failed: ${data.message}`);
                errorMessage.textContent = data.message || 'Signup failed. Please try again.';
            }
        } catch (error) {
            console.error('An exception occurred during the signup fetch call:', error);
            errorMessage.textContent = 'An error occurred during signup. Please check the console.';
        }
    });
});
