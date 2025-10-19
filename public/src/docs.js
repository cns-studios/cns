document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        link.classList.add('active');
        
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

let ticking = false;

function updateActiveNav() {
    const sections = document.querySelectorAll('.doc-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateActiveNav();
        });
        ticking = true;
    }
});

document.querySelectorAll('.code-block').forEach(block => {
    block.style.cursor = 'pointer';
    block.title = 'Click to copy';
    
    block.addEventListener('click', () => {
        const code = block.querySelector('code');
        const text = code.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            const originalBorder = block.style.borderColor;
            block.style.borderColor = '#FAA307';
            block.style.transition = 'border-color 0.3s';
            
            setTimeout(() => {
                block.style.borderColor = originalBorder;
            }, 500);
        });
    });
});