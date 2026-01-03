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

        if (!loginBtn) {
            // It's normal for some pages to not have a login button (e.g., docs/contact pages)
            console.warn('Login button not found on this page. Skipping auth UI update.');
        } else {
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
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback for login button if the API fails
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.textContent = 'LOGIN';
            loginBtn.onclick = () => {
                const redirectUri = encodeURIComponent(window.location.origin);
                window.location.href = `${authServiceUrl}/login?redirect_uri=${redirectUri}`;
            };
        } else {
            console.warn('Auth check failed and no login button is available on this page.');
        }
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

// --- Draggable Card Logic (refined for link-wrapped cards) ---
(function () {
    'use strict';

    const cardLinks = document.querySelectorAll('.card-link');
    const DRAG_THRESHOLD = 10; // Threshold to distinguish click from drag

    cardLinks.forEach(cardLink => {
        let isMouseDown = false;
        let isDragging = false;
        let startX = 0, startY = 0;

        // Prevent browser's default link drag behavior
        cardLink.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        cardLink.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault(); // Prevent text selection and default link behavior
            isMouseDown = true;
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
        });

        cardLink.addEventListener('mousemove', (e) => {
            // Only process drag if mouse button is held down
            if (!isMouseDown) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
                isDragging = true;
                cardLink.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            }
        });

        cardLink.addEventListener('mouseup', () => {
            isMouseDown = false;
            if (isDragging) {
                cardLink.style.transform = '';
                // Delay resetting isDragging so click handler can check it
                requestAnimationFrame(() => {
                    isDragging = false;
                });
            }
        });

        // Handle case where mouse leaves the element while dragging
        cardLink.addEventListener('mouseleave', () => {
            if (isMouseDown) {
                isMouseDown = false;
                cardLink.style.transform = '';
                isDragging = false;
            }
        });

        // Prevent link navigation when dragging
        cardLink.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });
})();

