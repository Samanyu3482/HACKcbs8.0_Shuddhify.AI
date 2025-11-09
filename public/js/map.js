let map;
let markerClusterGroup;
let allReports = [];

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadReports();
  setupEventListeners();
});

// Initialize Leaflet map
function initMap() {
  // Create map centered on India
  map = L.map('map').setView([20.5937, 78.9629], 5);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Initialize marker cluster group
  markerClusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  map.addLayer(markerClusterGroup);

  // Add user location button
  addLocateControl();
}

// Add locate control to find user's location
function addLocateControl() {
  const locateControl = L.control({ position: 'topleft' });
  
  locateControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = '<a href="#" title="Find my location" style="font-size: 18px; line-height: 30px;">📍</a>';
    
    div.onclick = function(e) {
      e.preventDefault();
      findMyLocation();
    };
    
    return div;
  };
  
  locateControl.addTo(map);
}

// Get user's current location
function findMyLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  map.locate({ setView: true, maxZoom: 13 });

  map.on('locationfound', (e) => {
    const radius = e.accuracy / 2;
    L.marker(e.latlng).addTo(map)
      .bindPopup(`You are within ${Math.round(radius)} meters from this point`)
      .openPopup();
    L.circle(e.latlng, radius).addTo(map);
  });

  map.on('locationerror', (e) => {
    alert('Could not find your location: ' + e.message);
  });
}

// Load all reports from API
async function loadReports() {
  try {
    showLoading(true);
    const response = await fetch('/api/adulteration/reports');
    const data = await response.json();

    if (data.success) {
      allReports = data.reports;
      displayReports(allReports);
    } else {
      console.error('Failed to load reports');
    }
  } catch (error) {
    console.error('Error loading reports:', error);
    alert('Failed to load reports. Please try again.');
  } finally {
    showLoading(false);
  }
}

// Display reports on map
function displayReports(reports) {
  // Clear existing markers
  markerClusterGroup.clearLayers();

  if (reports.length === 0) {
    alert('No reports found matching your filters');
    return;
  }

  reports.forEach(report => {
    const marker = createMarker(report);
    if (marker) {
      markerClusterGroup.addLayer(marker);
    }
  });

  // Fit map bounds to show all markers
  if (reports.length > 0) {
    const bounds = markerClusterGroup.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}

// Create marker for a report
function createMarker(report) {
  // Handle both old schema (lat/lng) and new schema (GeoJSON)
  let lat, lng;
  
  if (report.location.coordinates.coordinates) {
    // New GeoJSON format: [longitude, latitude]
    lng = report.location.coordinates.coordinates[0];
    lat = report.location.coordinates.coordinates[1];
  } else if (report.location.coordinates.lat && report.location.coordinates.lng) {
    // Old format: {lat, lng}
    lat = report.location.coordinates.lat;
    lng = report.location.coordinates.lng;
  } else {
    console.warn('Invalid coordinates for report:', report._id);
    return null;
  }

  // Validate coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    console.warn('Invalid lat/lng values for report:', report._id);
    return null;
  }
  
  // Custom icon based on severity
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

  // Create popup content
  const popupContent = createPopupContent(report);
  marker.bindPopup(popupContent, { maxWidth: 300 });

  return marker;
}

// Get color based on severity
function getSeverityColor(severity) {
  const colors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336'
  };
  return colors[severity] || '#9E9E9E';
}

// Create popup content HTML
function createPopupContent(report) {
  const date = new Date(report.reportDate).toLocaleDateString();
  const reporterName = report.reportedBy?.name || 'Anonymous';

  return `
    <div class="report-popup">
      <h3>${report.foodItem}</h3>
      <p><strong>Location:</strong> ${report.location.shopName || 'N/A'}</p>
      <p><strong>Address:</strong> ${report.location.address}</p>
      <p><strong>Area:</strong> ${report.location.area || 'N/A'}, ${report.location.city || 'N/A'}</p>
      <p><strong>Type:</strong> ${formatAdulterationType(report.adulterationType)}</p>
      <p><strong>Description:</strong> ${report.description}</p>
      <p><strong>Reported by:</strong> ${reporterName}</p>
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

// Format adulteration type
function formatAdulterationType(type) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

// Apply filters
async function applyFilters() {
  const city = document.getElementById('filterCity').value.trim();
  const foodItem = document.getElementById('filterFoodItem').value.trim();
  const severity = document.getElementById('filterSeverity').value;
  const status = document.getElementById('filterStatus').value;

  try {
    showLoading(true);
    
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (foodItem) params.append('foodItem', foodItem);
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);

    const response = await fetch(`/api/adulteration/reports?${params.toString()}`);
    const data = await response.json();

    if (data.success) {
      allReports = data.reports;
      displayReports(allReports);
    }
  } catch (error) {
    console.error('Error applying filters:', error);
    alert('Failed to apply filters');
  } finally {
    showLoading(false);
  }
}

// Reset filters
function resetFilters() {
  document.getElementById('filterCity').value = '';
  document.getElementById('filterFoodItem').value = '';
  document.getElementById('filterSeverity').value = '';
  document.getElementById('filterStatus').value = '';
  
  loadReports();
}

// Show/hide loading overlay
function showLoading(show) {
  let overlay = document.getElementById('loadingOverlay');
  
  if (show && !overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.querySelector('.map-wrapper').style.position = 'relative';
    document.querySelector('.map-wrapper').appendChild(overlay);
  } else if (!show && overlay) {
    overlay.remove();
  }
}