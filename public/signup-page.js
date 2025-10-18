const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const pin = document.getElementById('pin').value;
    const confirmPin = document.getElementById('confirmPin').value;
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    
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
    
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
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
            submitBtn.textContent = 'SUCCESS!';
            submitBtn.style.background = '#FAA307';
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showError(data.message || 'Signup failed');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('Connection error. Try again.');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('show');
}

document.getElementById('pin').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

document.getElementById('confirmPin').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});