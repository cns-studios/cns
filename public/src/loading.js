(function() {
    setTimeout(() => {
        const loader = document.querySelector('.loading-line-container');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 1500);
})();
