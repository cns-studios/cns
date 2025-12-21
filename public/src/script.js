let authServiceUrl;

async function checkAuthStatus() {
    if (!authServiceUrl) {
        console.error('Auth service URL is not set. Cannot check status.');
        return;
    }
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        const loginBtn = document.getElementById('login-btn');
        
        if (data.authenticated) {
            loginBtn.textContent = data.username.toUpperCase();
            
            loginBtn.onclick = () => {
                if (confirm('LOGOUT?')) {
                    const redirectUri = encodeURIComponent(window.location.origin);
                    window.location.href = `${authServiceUrl}/logout?redirect_uri=${redirectUri}`;
                }
            };
        } else {
            loginBtn.textContent = 'LOGIN';
            loginBtn.onclick = () => {
                const redirectUri = encodeURIComponent(window.location.origin);
                window.location.href = `${authServiceUrl}/login?redirect_uri=${redirectUri}`;
            };
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback for login button if the API fails
        const loginBtn = document.getElementById('login-btn');
        loginBtn.textContent = 'LOGIN';
        loginBtn.onclick = () => {
            const redirectUri = encodeURIComponent(window.location.origin);
            window.location.href = `${authServiceUrl}/login?redirect_uri=${redirectUri}`;
        };
    }
}

async function initializeApp() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        authServiceUrl = config.authServiceUrl;
        await checkAuthStatus();
    } catch (error) {
        console.error('Failed to initialize application configuration:', error);
    }
}

initializeApp();

// --- Draggable Card ---
document.querySelectorAll('.card, .small-card').forEach(card => {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    card.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === card || card.contains(e.target)) {
            isDragging = true;
            card.classList.add('dragging');
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            
            card.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }

    function dragEnd() {
        if (isDragging) {
            card.classList.remove('dragging');
            card.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            card.style.transform = 'translate(0, 0)';
            
            setTimeout(() => {
                card.style.transition = '';
            }, 500);
            
            xOffset = 0;
            yOffset = 0;
            isDragging = false;
        }
    }
});

// --- Button Hover Effect ---
document.querySelectorAll('button, a').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            element.style.filter = '';
        }, 100);
    });
});
