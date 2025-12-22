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
    const cardLink = card.closest('.card-link');
    let isDragging = false;
    let hasDragged = false; // Flag to distinguish a click from a drag

    let startX, startY; // Mouse position at the start of a drag

    // The rest of the variables from the original code
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    card.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    if (cardLink) {
        cardLink.addEventListener('click', function(e) {
            if (hasDragged) {
                e.preventDefault();
            }
        });
    }

    function dragStart(e) {
        // Reset hasDragged flag on every mousedown
        hasDragged = false;

        // Store initial mouse position
        startX = e.clientX;
        startY = e.clientY;

        // Original logic for smooth dragging
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === card || card.contains(e.target)) {
            isDragging = true;
            card.classList.add('dragging');
        }
    }

    function drag(e) {
        if (isDragging) {
            // Check if the mouse has moved significantly to be considered a drag
            if (!hasDragged) {
                if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
                    hasDragged = true;
                }
            }

            // If it is a drag, prevent default to avoid text selection, etc.
            if (hasDragged) {
                e.preventDefault();
            }

            // Original positioning logic
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
            // Only play the snap-back animation if the card was actually dragged
            if (hasDragged) {
                card.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                card.style.transform = 'translate(0, 0)';

                setTimeout(() => {
                    card.style.transition = '';
                }, 500);
            }
            
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
