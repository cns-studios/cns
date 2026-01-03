const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameEl = document.getElementById('username');
        const pinEl = document.getElementById('pin');
        const confirmPinEl = document.getElementById('confirmPin');

        const username = usernameEl ? usernameEl.value.trim() : '';
        const pin = pinEl ? pinEl.value : '';
        const confirmPin = confirmPinEl ? confirmPinEl.value : '';
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        
        if (errorMessage) errorMessage.classList.remove('show');
        if (successMessage) successMessage.classList.remove('show');
        
        if (username.length < 3 || username.length > 20) {
            showError('Username must be 3-20 characters');
            return;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError('Username: letters, numbers, underscore only');
            return;
        }
        
        if (!/^\d{4}$/.test(pin)) {
            showError('PIN must be 4 digits');
            return;
        }
        
        if (pin !== confirmPin) {
            showError('PINs do not match');
            return;
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        }
        
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, pin }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('Account created! Redirecting...');
                if (submitBtn) {
                    submitBtn.textContent = 'SUCCESS!';
                    submitBtn.style.background = '#FAA307';
                }
                
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            } else {
                showError(data.message || 'Signup failed');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('Connection error. Try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        }
    });
} else {
    console.warn('Signup form not present on this page.');
}

function showError(message) {
    if (!errorMessage) {
        console.warn('Error element missing:', message);
        return;
    }
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function showSuccess(message) {
    if (!successMessage) {
        console.warn('Success element missing:', message);
        return;
    }
    successMessage.textContent = message;
    successMessage.classList.add('show');
}

const pinInput = document.getElementById('pin');
if (pinInput) {
    pinInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

const confirmPinInput = document.getElementById('confirmPin');
if (confirmPinInput) {
    confirmPinInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}