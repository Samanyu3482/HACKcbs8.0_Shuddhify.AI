document.addEventListener('DOMContentLoaded', function() {
    // Particles.js Configuration
     particlesJS('particles-js',
    {
      "particles": {
        "number": {
          "value": 60,
          "density": {
            "enable": true,
            "value_area": 1200
          }
        },
        "color": {
          "value": "#22c55e"  // soft green color to match the theme
        },
        "shape": {
          "type": "circle"
        },
        "opacity": {
          "value": 0.5,
          "random": true
        },
        "size": {
          "value": 7,
          "random": true
        },
        "line_linked": {
          "enable": true,
          "distance": 130,
          "color": "#22c55e",
          "opacity": 0.15,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 1.5,
          "direction": "none",
          "random": true,
          "straight": false,
          "out_mode": "bounce",
          "bounce": true
        }
      },
      "interactivity": {
        "events": {
          "onhover": {
            "enable": true,
            "mode": "repulse"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          }
        },
        "modes": {
          "repulse": {
            "distance": 120,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          }
        }
      },
      "retina_detect": true
    }
  );

});
 





// Add this script to your EJS template before the closing </body> tag

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[type="text"]');
    const categoryButtons = document.querySelectorAll('.btn-outline-success');
    const foodCards = document.querySelectorAll('.col-12.col-sm-6.col-lg-4');
    const itemCount = document.querySelector('small');
    const totalItems = foodCards.length;
    
    let currentCategory = 'All';
    let currentSearch = '';

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase().trim();
        filterItems();
    });

    // Category filter functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            currentCategory = this.textContent.trim();
            filterItems();
        });
    });

    function filterItems() {
        let visibleCount = 0;

        foodCards.forEach(card => {
            const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
            const cardCategory = card.querySelector('.card-text.text-muted').textContent.trim();
            const adultrationTypes = Array.from(card.querySelectorAll('.badge.bg-success'))
                .map(badge => badge.textContent.toLowerCase())
                .join(' ');

            // Check if item matches search query
            const matchesSearch = currentSearch === '' || 
                cardTitle.includes(currentSearch) || 
                adultrationTypes.includes(currentSearch);

            // Check if item matches category
            const matchesCategory = currentCategory === 'All' || 
                cardCategory === currentCategory;

            // Show or hide card based on filters
            if (matchesSearch && matchesCategory) {
                card.classList.remove('d-none');
                card.style.display = '';
                visibleCount++;
            } else {
                card.classList.add('d-none');
                card.style.display = 'none';
            }
        });

        // Update item count
        itemCount.textContent = `Showing ${visibleCount} of ${totalItems} items`;
    }
});

// Add this script to your EJS template before the closing </body> tag

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[type="text"]');
    const categoryButtons = document.querySelectorAll('.btn-outline-success');
    const foodCards = document.querySelectorAll('.col-12.col-sm-6.col-lg-4');
    const itemCount = document.querySelector('small');
    const totalItems = foodCards.length;
    
    let currentCategory = 'All';
    let currentSearch = '';

    // Create autocomplete dropdown
    const autocompleteDiv = document.createElement('div');
    autocompleteDiv.className = 'autocomplete-dropdown';
    autocompleteDiv.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        max-height: 300px;
        overflow-y: auto;
        width: 100%;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: none;
    `;
    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(autocompleteDiv);

    // Search functionality with autocomplete
    searchInput.addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase().trim();
        
        if (currentSearch.length > 0) {
            showAutocomplete();
        } else {
            hideAutocomplete();
        }
        
        filterItems();
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !autocompleteDiv.contains(e.target)) {
            hideAutocomplete();
        }
    });

    function showAutocomplete() {
        autocompleteDiv.innerHTML = '';
        const matches = [];

        foodCards.forEach(card => {
            const cardTitle = card.querySelector('.card-title').textContent.trim();
            const cardCategory = card.querySelector('.card-text.text-muted').textContent.trim();
            
            if (cardTitle.toLowerCase().includes(currentSearch)) {
                matches.push({ name: cardTitle, category: cardCategory });
            }
        });

        if (matches.length > 0) {
            matches.forEach(item => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'autocomplete-item';
                suggestionItem.style.cssText = `
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    transition: background-color 0.2s;
                `;
                suggestionItem.innerHTML = `
                    <div style="font-weight: 600; color: #333;">${item.name}</div>
                    <small style="color: #666;">${item.category}</small>
                `;
                
                suggestionItem.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f8f9fa';
                });
                
                suggestionItem.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'white';
                });
                
                suggestionItem.addEventListener('click', function() {
                    searchInput.value = item.name;
                    currentSearch = item.name.toLowerCase();
                    filterItems();
                    hideAutocomplete();
                });
                
                autocompleteDiv.appendChild(suggestionItem);
            });
            autocompleteDiv.style.display = 'block';
        } else {
            const noResults = document.createElement('div');
            noResults.style.cssText = 'padding: 12px 16px; color: #999; text-align: center;';
            noResults.textContent = 'No matching items found';
            autocompleteDiv.appendChild(noResults);
            autocompleteDiv.style.display = 'block';
        }
    }

    function hideAutocomplete() {
        autocompleteDiv.style.display = 'none';
    }

    // Category filter functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            currentCategory = this.textContent.trim();
            filterItems();
        });
    });

    function filterItems() {
        let visibleCount = 0;

        foodCards.forEach(card => {
            const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
            const cardCategory = card.querySelector('.card-text.text-muted').textContent.trim();
            const adultrationTypes = Array.from(card.querySelectorAll('.badge.bg-success'))
                .map(badge => badge.textContent.toLowerCase())
                .join(' ');

            // Check if item matches search query
            const matchesSearch = currentSearch === '' || 
                cardTitle.includes(currentSearch) || 
                adultrationTypes.includes(currentSearch);

            // Check if item matches category
            const matchesCategory = currentCategory === 'All' || 
                cardCategory === currentCategory;

            // Show or hide card based on filters
            if (matchesSearch && matchesCategory) {
                card.classList.remove('d-none');
                card.style.display = '';
                visibleCount++;
            } else {
                card.classList.add('d-none');
                card.style.display = 'none';
            }
        });

        // Update item count
        itemCount.textContent = `Showing ${visibleCount} of ${totalItems} items`;
    }
});