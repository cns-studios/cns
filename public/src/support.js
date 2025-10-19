document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isVisible = answer.style.display === 'block';
        
        document.querySelectorAll('.faq-answer').forEach(a => {
            a.style.display = 'none';
        });
        
        if (!isVisible) {
            answer.style.display = 'block';
            answer.style.animation = 'fadeIn 0.3s';
        }
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

document.querySelectorAll('.faq-answer').forEach(answer => {
    answer.style.display = 'none';
});