const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const subjectEl = document.getElementById('subject');
        const messageEl = document.getElementById('message');

        const name = nameEl ? nameEl.value : '';
        const email = emailEl ? emailEl.value : '';
        const subject = subjectEl ? subjectEl.value : 'general';
        const message = messageEl ? messageEl.value : '';
        
        const recipient = 'aaron.gerkens@proton.me';
        const emailSubject = `[${subject.toUpperCase()}] Message from ${name}`;
        const emailBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        
        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        window.location.href = mailtoLink;
    });
} else {
    console.warn('Contact form not found on this page.');
}