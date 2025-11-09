// Function to open Bootstrap modals
function openModal(modalId) {
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Optional: Add smooth scroll behavior
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation on scroll for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    // Log modal interactions for analytics (optional)
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            console.log('Modal opened:', this.id);
            // You can add analytics tracking here
        });
    });
});

// Optional: Handle "Report Now" button clicks
document.addEventListener('DOMContentLoaded', function() {
    const reportButtons = document.querySelectorAll('.report-now-btn, .btn-success');
    reportButtons.forEach(button => {
        if (button.textContent.includes('Report Now')) {
            button.addEventListener('click', function() {
                alert('This would redirect to FSSAI reporting system.');
                // In production, redirect to actual FSSAI reporting page
                // window.location.href = 'https://fssai.gov.in/report';
            });
        }
    });
});

// Optional: Handle "Book Now" button clicks in lab test modals
document.addEventListener('DOMContentLoaded', function() {
    const bookButtons = document.querySelectorAll('.modal-body .btn-success');
    bookButtons.forEach(button => {
        if (button.textContent.includes('Book Now')) {
            button.addEventListener('click', function() {
                const modalTitle = this.closest('.modal-content').querySelector('.modal-title').textContent;
                alert(`Booking appointment for: ${modalTitle}\nThis would redirect to booking system.`);
                // In production, redirect to booking system
                // window.location.href = '/book?test=' + encodeURIComponent(modalTitle);
            });
        }
    });
});



document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#10b981"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                }
            },
            "opacity": {
                "value": 0.8,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 7,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#10b981",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                }
            }
        },
        "retina_detect": true
    });
});







// Optional: Add hover effect sounds (commented out by default)

// document.addEventListener('DOMContentLoaded', function() {
//     const hoverSound = new Audio('path/to/hover-sound.mp3');
//     const clickSound = new Audio('path/to/click-sound.mp3');
    
//     const interactiveItems = document.querySelectorAll('.test-item, .video-item, .shorts-item');
    
//     interactiveItems.forEach(item => {
//         item.addEventListener('mouseenter', function() {
//             hoverSound.currentTime = 0;
//             hoverSound.play();
//         });
        
//         item.addEventListener('click', function() {
//             clickSound.currentTime = 0;
//             clickSound.play();
//         });
//     });
// });
