const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const pin = document.getElementById('pin').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    if (!/^\d{4}$/.test(pin)) {
        showError('PIN must be 4 digits');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    errorMessage.classList.remove('show');
    
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
            submitBtn.textContent = 'ACCESS GRANTED!';
            submitBtn.style.background = '#FAA307';
            
            setTimeout(() => {
                window.location.href = '/';
            }, 800);
        } else {
            showError(data.message || 'Login failed');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Try again.');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

document.getElementById('pin').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});