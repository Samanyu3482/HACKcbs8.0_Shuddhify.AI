let map;
let userLocation = null;
let currentRadius = 5000;
let nearbyReports = [];
let userMarker = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  showLocationModal();
  setupEventListeners();
});

// Show location modal on page load
function showLocationModal() {
  const modal = document.getElementById('locationModal');
  modal.style.display = 'flex';
}

// Setup all event listeners
function setupEventListeners() {
  // Allow Location button
  document.getElementById('allowLocation').addEventListener('click', () => {
    const radius = parseInt(document.getElementById('radiusSelect').value);
    currentRadius = radius;
    getUserLocation();
  });

  // Manual Location button
  document.getElementById('manualLocation').addEventListener('click', () => {
    document.getElementById('locationModal').style.display = 'none';
    document.getElementById('manualModal').style.display = 'flex';
  });

  // Submit Manual Location
  document.getElementById('submitManual').addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('manualLat').value);
    const lng = parseFloat(document.getElementById('manualLng').value);
    const radius = parseInt(document.getElementById('manualRadius').value);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude');
      return;
    }

    currentRadius = radius;
    userLocation = { lat, lng };
    document.getElementById('manualModal').style.display = 'none';
    initializePage();
  });

  // Cancel Manual
  document.getElementById('cancelManual').addEventListener('click', () => {
    document.getElementById('manualModal').style.display = 'none';
    showLocationModal();
  });

  // Change Location button
  document.getElementById('changeLocation').addEventListener('click', () => {
    showLocationModal();
  });

  // View toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const view = e.target.dataset.view;
      const wrapper = document.querySelector('.content-wrapper');
      
      wrapper.classList.remove('map-only', 'cards-only');
      if (view === 'map') {
        wrapper.classList.add('map-only');
      } else if (view === 'cards') {
        wrapper.classList.add('cards-only');
      }
    });
  });
}

// Get user's current location
function getUserLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  const btn = document.getElementById('allowLocation');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      document.getElementById('locationModal').style.display = 'none';
      initializePage();
    },
    (error) => {
      alert('Could not get your location: ' + error.message);
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check"></i> Allow Location';
    }
  );
}

// Initialize the page with map and load reports
function initializePage() {
  initMap();
  loadNearbyReports();
  updateLocationInfo();
}

// Initialize Leaflet map
function initMap() {
  if (map) {
    map.remove();
  }

  map = L.map('nearbyMap').setView([userLocation.lat, userLocation.lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Add user location marker
  addUserMarker();

  // Add radius circle
  L.circle([userLocation.lat, userLocation.lng], {
    radius: currentRadius,
    color: '#2196F3',
    fillColor: '#2196F3',
    fillOpacity: 0.1,
    weight: 2
  }).addTo(map);
}

// Add user location marker
function addUserMarker() {
  const icon = L.divIcon({
    className: 'user-marker',
    html: '<div class="user-marker"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  userMarker = L.marker([userLocation.lat, userLocation.lng], { icon })
    .addTo(map)
    .bindPopup('📍 Your Location')
    .openPopup();
}

// Load nearby reports from API
async function loadNearbyReports() {
  try {
    showLoadingState();

    const response = await fetch(
      `/api/adulteration/reports/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${currentRadius}`
    );
    const data = await response.json();

    if (data.success) {
      nearbyReports = data.reports;
      displayReports();
      updateStats();
    } else {
      showError(data.error);
    }
  } catch (error) {
    console.error('Error loading reports:', error);
    showError('Failed to load nearby reports');
  }
}

// Display reports on map and cards
function displayReports() {
  if (nearbyReports.length === 0) {
    showNoReports();
    return;
  }

  // Display on map
  displayOnMap();

  // Display as cards
  displayAsCards();
}

// Display reports on map
function displayOnMap() {
  nearbyReports.forEach(report => {
    const marker = createMapMarker(report);
    if (marker) {
      marker.addTo(map);
    }
  });
}

// Create map marker for a report
function createMapMarker(report) {
  let lat, lng;

  // Handle both coordinate formats
  if (report.location.coordinates.coordinates) {
    lng = report.location.coordinates.coordinates[0];
    lat = report.location.coordinates.coordinates[1];
  } else if (report.location.coordinates.lat) {
    lat = report.location.coordinates.lat;
    lng = report.location.coordinates.lng;
  } else {
    return null;
  }

  // Calculate distance
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    lat,
    lng
  );

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${getSeverityColor(report.severity)};
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12]
  });

  const marker = L.marker([lat, lng], { icon });
  
  const popupContent = createPopupContent(report, distance);
  marker.bindPopup(popupContent, { maxWidth: 300 });

  return marker;
}

// Display reports as cards
function displayAsCards() {
  const container = document.getElementById('reportCards');

  // Sort by distance
  const sortedReports = nearbyReports.map(report => {
    let lat, lng;
    if (report.location.coordinates.coordinates) {
      lng = report.location.coordinates.coordinates[0];
      lat = report.location.coordinates.coordinates[1];
    } else {
      lat = report.location.coordinates.lat;
      lng = report.location.coordinates.lng;
    }

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      lat,
      lng
    );

    return { ...report, distance };
  }).sort((a, b) => a.distance - b.distance);

  container.innerHTML = sortedReports.map(report => createReportCard(report)).join('');

  // Add click listeners to scroll to marker
  document.querySelectorAll('.report-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      const report = sortedReports[index];
      let lat, lng;
      
      if (report.location.coordinates.coordinates) {
        lng = report.location.coordinates.coordinates[0];
        lat = report.location.coordinates.coordinates[1];
      } else {
        lat = report.location.coordinates.lat;
        lng = report.location.coordinates.lng;
      }

      map.setView([lat, lng], 15);
      
      // Find and open popup
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
          layer.openPopup();
        }
      });
    });
  });
}

// Create report card HTML
function createReportCard(report) {
  const date = new Date(report.reportDate).toLocaleDateString();
  
  return `
    <div class="report-card severity-${report.severity}">
      <div class="card-header">
        <h3>${report.foodItem}</h3>
        <span class="distance-badge">${report.distance}</span>
      </div>
      
      <div class="card-body">
        <div class="card-info">
          <i class="fas fa-store"></i>
          <span>${report.location.shopName || 'Unknown Shop'}</span>
        </div>
        
        <div class="card-info">
          <i class="fas fa-map-marker-alt"></i>
          <span>${report.location.address}, ${report.location.city || ''}</span>
        </div>
        
        <div class="card-info">
          <i class="fas fa-exclamation-triangle"></i>
          <span>${formatAdulterationType(report.adulterationType)}</span>
        </div>
        
        <div class="card-description">
          ${report.description}
        </div>
        
        <div class="card-info">
          <i class="fas fa-calendar"></i>
          <span>${date}</span>
        </div>
      </div>
      
      <div class="card-footer">
        <div>
          <span class="badge severity-${report.severity}">
            ${report.severity}
          </span>
          <span class="badge status-${report.status}">
            ${report.status}
          </span>
        </div>
        <div class="verification-count">
          <i class="fas fa-check-circle"></i>
          <span>${report.verificationCount} verified</span>
        </div>
      </div>
    </div>
  `;
}

// Create popup content for map marker
function createPopupContent(report, distance) {
  const date = new Date(report.reportDate).toLocaleDateString();
  
  return `
    <div class="report-popup">
      <h3>${report.foodItem}</h3>
      <p><strong>Distance:</strong> ${distance}</p>
      <p><strong>Location:</strong> ${report.location.shopName || 'N/A'}</p>
      <p><strong>Address:</strong> ${report.location.address}</p>
      <p><strong>Type:</strong> ${formatAdulterationType(report.adulterationType)}</p>
      <p><strong>Description:</strong> ${report.description}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p>
        <span class="severity-badge severity-${report.severity}">
          ${report.severity.toUpperCase()}
        </span>
        <span class="status-badge status-${report.status}">
          ${report.status.toUpperCase()}
        </span>
      </p>
      <p><strong>Verifications:</strong> ${report.verificationCount}</p>
    </div>
  `;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  if (distance < 1) {
    return Math.round(distance * 1000) + ' m';
  } else {
    return distance.toFixed(1) + ' km';
  }
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Get severity color
function getSeverityColor(severity) {
  const colors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336'
  };
  return colors[severity] || '#9E9E9E';
}

// Format adulteration type
function formatAdulterationType(type) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Update statistics
function updateStats() {
  const total = nearbyReports.length;
  const high = nearbyReports.filter(r => r.severity === 'high').length;
  const medium = nearbyReports.filter(r => r.severity === 'medium').length;
  const low = nearbyReports.filter(r => r.severity === 'low').length;

  document.getElementById('totalReports').textContent = total;
  document.getElementById('highSeverity').textContent = high;
  document.getElementById('mediumSeverity').textContent = medium;
  document.getElementById('lowSeverity').textContent = low;
}

// Update location info
function updateLocationInfo() {
  const radiusKm = (currentRadius / 1000).toFixed(1);
  document.getElementById('locationInfo').textContent = 
    `Showing reports within ${radiusKm} km of your location`;
}

// Show loading state
function showLoadingState() {
  document.getElementById('reportCards').innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading nearby reports...</p>
    </div>
  `;
}

// Show no reports state
function showNoReports() {
  document.getElementById('reportCards').innerHTML = `
    <div class="no-reports">
      <i class="fas fa-info-circle"></i>
      <h3>No Reports Found</h3>
      <p>There are no food adulteration reports within ${(currentRadius/1000).toFixed(1)} km of your location.</p>
      <button class="btn btn-primary" onclick="document.getElementById('changeLocation').click()">
        Try Different Location
      </button>
    </div>
  `;
  
  updateStats();
}

// Show error state
function showError(message) {
  document.getElementById('reportCards').innerHTML = `
    <div class="no-reports">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Error</h3>
      <p>${message}</p>
      <button class="btn btn-primary" onclick="location.reload()">
        Reload Page
      </button>
    </div>
  `;
}