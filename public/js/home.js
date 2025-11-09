document.addEventListener('DOMContentLoaded', function() {
    const taglines = [
        "Detect Karo, Eat Shuddh!",
        "Detect. Trust. Eat Shuddh",
        "Pehchano Asli, Chuno Shuddh",
        "No Milawat, Only Shuddh!",
        "Eat Safe, Eat Shuddh",
        "Milawat Se Azadi Chahiye!"
    ];
    
    let currentTaglineIndex = 0;
    const heroTitle = document.getElementById('heroTitle');
    
    function typeWords(text) {
        const words = text.split(' ');
        heroTitle.innerHTML = '';
        
        words.forEach((word, index) => {
            setTimeout(() => {
                const span = document.createElement('span');
                span.className = 'word';
                span.textContent = word;
                heroTitle.appendChild(span);
            }, index * 300);
        });
        
        setTimeout(() => {
            currentTaglineIndex = (currentTaglineIndex + 1) % taglines.length;
            typeWords(taglines[currentTaglineIndex]);
        }, (words.length * 300) + 2000);
    }
    
    typeWords(taglines[0]);

    // Animate Services Title on Scroll
const servicesTitle = document.querySelector('.services-title');

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

if (servicesTitle) {
    observer.observe(servicesTitle);
}

    // Particles.js Configuration
particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#10b981'
        },
        shape: {
            type: 'circle',
            stroke: {
                width: 0,
                color: '#000000'
            }
        },
        opacity: {
            value: 0.3,
            random: true,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
    enable: true,
    distance: 150,
    color: '#059669',
    opacity: 0.4,
    width: 2.5
},
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'grab'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                line_linked: {
                    opacity: 0.5
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
});
});