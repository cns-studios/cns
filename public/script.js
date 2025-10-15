// Interactive card animations
function animateCard(card) {
    card.style.animation = 'shake 0.5s';
    setTimeout(() => {
        card.style.animation = '';
    }, 500);
}

function animateSmallCard(card) {
    card.style.animation = 'spin 0.5s';
    setTimeout(() => {
        card.style.animation = '';
    }, 500);
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px) rotate(-2deg); }
        75% { transform: translateX(10px) rotate(2deg); }
    }
    
    @keyframes spin {
        0% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.1) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Add floating pixel decorations
function createPixelDecoration() {
    const colors = ['#FFBA08', '#FAA307', '#F48C06', '#E85D04', '#DC2F02'];
    const decoration = document.createElement('div');
    decoration.className = 'pixel-decoration';
    decoration.style.left = Math.random() * window.innerWidth + 'px';
    decoration.style.top = Math.random() * window.innerHeight + 'px';
    decoration.style.background = colors[Math.floor(Math.random() * colors.length)];
    decoration.style.animationDelay = Math.random() * 6 + 's';
    document.body.appendChild(decoration);
    
    setTimeout(() => {
        decoration.remove();
    }, 12000);
}

// Create decorations periodically
setInterval(createPixelDecoration, 3000);

// Initial decorations
for(let i = 0; i < 5; i++) {
    setTimeout(createPixelDecoration, i * 500);
}

// Glitch effect on scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (Math.abs(currentScroll - lastScroll) > 50) {
        document.body.style.filter = 'hue-rotate(10deg)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 100);
        lastScroll = currentScroll;
    }
});

// Interactive hover sound effect (visual feedback)
document.querySelectorAll('.card, .small-card, button, a').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            element.style.filter = '';
        }, 100);
    });
});