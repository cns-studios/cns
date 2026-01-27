let authServiceUrl;

async function checkAuthStatus() {
    if (!authServiceUrl) {
        return;
    }
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        const loginBtn = document.getElementById('login-btn');

        if (loginBtn) {
            if (data.authenticated && data.user) {
                loginBtn.textContent = data.user.username.toUpperCase();

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
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.textContent = 'LOGIN';
            loginBtn.onclick = () => {
                const redirectUri = encodeURIComponent(window.location.origin);
                window.location.href = `${authServiceUrl}/login?redirect_uri=${redirectUri}`;
            };
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
    }
}

initializeApp();

(function () {
    'use strict';

    const cardLinks = document.querySelectorAll('.card-link');
    const DRAG_THRESHOLD = 10;

    cardLinks.forEach(cardLink => {
        let isMouseDown = false;
        let isDragging = false;
        let startX = 0, startY = 0;

        cardLink.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        cardLink.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            isMouseDown = true;
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
        });

        cardLink.addEventListener('mousemove', (e) => {
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
                requestAnimationFrame(() => {
                    isDragging = false;
                });
            }
        });

        cardLink.addEventListener('mouseleave', () => {
            if (isMouseDown) {
                isMouseDown = false;
                cardLink.style.transform = '';
                isDragging = false;
            }
        });

        cardLink.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });
})();
