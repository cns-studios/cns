// Check authentication status on page load
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        const loginBtn = document.getElementById('login-btn');
        
        if (data.authenticated) {
            // User is logged in
            loginBtn.textContent = data.username.toUpperCase();
            loginBtn.style.background = '#FAA307';
            loginBtn.style.cursor = 'default';
            
            // Add logout on click
            loginBtn.onclick = async () => {
                if (confirm('LOGOUT?')) {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.reload();
                }
            };
        } else {
            // User is not logged in
            loginBtn.textContent = 'LOGIN';
            loginBtn.onclick = () => {
                window.location.href = '/login';
            };
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

// Run on page load
checkAuthStatus();

// Existing drag functionality
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

// Existing button effects
document.querySelectorAll('button, a').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            element.style.filter = '';
        }, 100);
    });
});