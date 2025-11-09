document.addEventListener('DOMContentLoaded', function() {
    // Brand Tagline Animation
    const brandTagline = document.getElementById('brandTagline');
    const taglineText = "Purity_Meets_Intelligence.";
    
    if (brandTagline) {
        brandTagline.textContent = '';
        
        taglineText.split('').forEach((char, index) => {
            setTimeout(() => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                brandTagline.appendChild(span);
            }, index * 80); // 80ms between each character
        });
    }
    
});
    