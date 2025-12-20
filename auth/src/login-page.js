document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    loginForm.appendChild(errorMessage);

    console.log('Login page script loaded.');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Login form submitted.');
        errorMessage.textContent = '';

        const username = loginForm.username.value;
        const pin = loginForm.pin.value;
        console.log(`Attempting login for user: ${username}`);

        const urlParams = new URLSearchParams(window.location.search);
        const redirectUri = urlParams.get('redirect_uri');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, pin }),
            });

            console.log(`Login API response status: ${response.status}`);
            const data = await response.json();
            console.log('Login API response data:', data);

            if (response.ok) {
                console.log('Login successful, redirecting...');
                if (redirectUri) {
                    window.location.href = redirectUri;
                } else {
                    window.location.href = '/';
                }
            } else {
                errorMessage.textContent = data.message || 'Login failed.';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred during login.';
        }
    });
});
