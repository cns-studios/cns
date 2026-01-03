const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameEl = document.getElementById('username');
        const pinEl = document.getElementById('pin');
        const rememberMeEl = document.getElementById('rememberMe');

        const username = usernameEl ? usernameEl.value.trim() : '';
        const pin = pinEl ? pinEl.value : '';
        const rememberMe = rememberMeEl ? rememberMeEl.checked : false;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        if (!/^\d{4}$/.test(pin)) {
            showError('PIN must be 4 digits');
            return;
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        }
        if (errorMessage) errorMessage.classList.remove('show');
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, pin, rememberMe }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (submitBtn) {
                    submitBtn.textContent = 'ACCESS GRANTED!';
                    submitBtn.style.background = '#FAA307';
                }
                setTimeout(() => {
                    window.location.href = '/';
                }, 800);
            } else {
                showError(data.message || 'Login failed');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        }
    });
} else {
    console.warn('Login form not present on this page.');
}

function showError(message) {
    if (!errorMessage) {
        console.warn('Error element missing:', message);
        return;
    }
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

const pinField = document.getElementById('pin');
if (pinField) {
    pinField.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}