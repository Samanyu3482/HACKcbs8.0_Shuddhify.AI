 // Add click handlers for Try Model buttons
        document.querySelectorAll('.try-model-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modelCard = this.closest('.model-card');
                const modelName = modelCard.querySelector('h3').textContent;
                alert(`Launching ${modelName}...`);
                // Add your navigation logic here
            });
        });

        // Add smooth scroll animation on page load
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.model-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 150);
            });
        });