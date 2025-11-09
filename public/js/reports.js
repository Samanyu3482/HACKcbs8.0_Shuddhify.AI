let map;
let marker;
let selectedLat = null;
let selectedLng = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupFormListeners();
  loadMyReports();
});

// Initialize Leaflet map for location picker
function initMap() {
  // Default to India center
  map = L.map('locationMap').setView([20.5937, 78.9629], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add click event to place marker
  map.on('click', (e) => {
    placeMarker(e.latlng.lat, e.latlng.lng);
  });

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
      },
      (error) => {
        console.log('Geolocation error:', error);
      }
    );
  }
}

// Place marker on map
function placeMarker(lat, lng) {
  // Remove existing marker
  if (marker) {
    map.removeLayer(marker);
  }

  // Add new marker
  marker = L.marker([lat, lng], {
    draggable: true
  }).addTo(map);

  // Update coordinates
  selectedLat = lat;
  selectedLng = lng;
  document.getElementById('lat').value = lat;
  document.getElementById('lng').value = lng;

  // Make marker draggable
  marker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    selectedLat = pos.lat;
    selectedLng = pos.lng;
    document.getElementById('lat').value = pos.lat;
    document.getElementById('lng').value = pos.lng;
  });

  marker.bindPopup('Report Location').openPopup();
}

// Setup form event listeners
function setupFormListeners() {
  // Character counter for description
  const description = document.getElementById('description');
  const charCount = document.querySelector('.char-count');
  
  description.addEventListener('input', () => {
    const count = description.value.length;
    charCount.textContent = `${count} / 500 characters`;
  });

  // Get current location button
  document.getElementById('getCurrentLocation').addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    const btn = document.getElementById('getCurrentLocation');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15);
        placeMarker(latitude, longitude);
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-crosshairs"></i> Use My Current Location';
      },
      (error) => {
        alert('Could not get your location: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-crosshairs"></i> Use My Current Location';
      }
    );
  });

  // Form submission
  document.getElementById('reportForm').addEventListener('submit', handleSubmit);

  // Reset form button
  document.getElementById('reportForm').addEventListener('reset', () => {
    // Clear character count
    const charCount = document.querySelector('.char-count');
    charCount.textContent = '0 / 500 characters';
    
    // Remove marker from map
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    
    // Clear coordinates
    selectedLat = null;
    selectedLng = null;
    document.getElementById('lat').value = '';
    document.getElementById('lng').value = '';
    
    // Hide messages
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
  });
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  // Validate coordinates
  if (!selectedLat || !selectedLng) {
    alert('Please select a location on the map');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

  // Gather form data
  const formData = {
    foodItem: document.getElementById('foodItem').value.trim(),
    adulterationType: document.getElementById('adulterationType').value,
    severity: document.getElementById('severity').value,
    description: document.getElementById('description').value.trim(),
    shopName: document.getElementById('shopName').value.trim(),
    address: document.getElementById('address').value.trim(),
    area: document.getElementById('area').value.trim(),
    city: document.getElementById('city').value.trim(),
    lat: selectedLat,
    lng: selectedLng
  };

  try {
    const response = await fetch('/api/adulteration/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      showSuccess();
      document.getElementById('reportForm').reset();
      
      // Remove marker
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
      selectedLat = null;
      selectedLng = null;
      
      // Reset character count
      document.querySelector('.char-count').textContent = '0 / 500 characters';
      
      // Reload reports list
      loadMyReports();
    } else {
      showError(data.error || 'Failed to submit report');
    }
  } catch (error) {
    console.error('Submission error:', error);
    showError('Network error. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
  }
}

// Show success message
function showSuccess() {
  document.getElementById('successMessage').style.display = 'flex';
  document.getElementById('errorMessage').style.display = 'none';
  
  // Scroll to success message
  document.getElementById('successMessage').scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
  
  // Hide after 5 seconds
  setTimeout(() => {
    document.getElementById('successMessage').style.display = 'none';
  }, 5000);
}

// Show error message
function showError(message) {
  document.getElementById('errorText').textContent = message;
  document.getElementById('errorMessage').style.display = 'flex';
  document.getElementById('successMessage').style.display = 'none';
  
  // Scroll to error message
  document.getElementById('errorMessage').scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
  
  // Hide after 5 seconds
  setTimeout(() => {
    document.getElementById('errorMessage').style.display = 'none';
  }, 5000);
}

// Load user's previous reports
async function loadMyReports() {
  const container = document.getElementById('myReportsList');
  
  try {
    const response = await fetch('/api/adulteration/my-reports');
    const data = await response.json();

    if (data.success && data.reports.length > 0) {
      container.innerHTML = data.reports.map(report => createReportCard(report)).join('');
      
      // Add delete listeners
      document.querySelectorAll('.btn-delete-report').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const reportId = e.target.closest('.btn-delete-report').dataset.reportId;
          deleteReport(reportId);
        });
      });
    } else {
      container.innerHTML = '<p class="no-reports">No reports yet. Submit your first report above!</p>';
    }
  } catch (error) {
    console.error('Error loading reports:', error);
    container.innerHTML = '<p class="error">Failed to load reports</p>';
  }
}

// Create report card HTML
function createReportCard(report) {
  const date = new Date(report.reportDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const statusClass = `status-${report.status}`;
  const severityClass = `severity-${report.severity}`;
  
  return `
    <div class="report-card-item">
      <div class="report-card-header">
        <div>
          <h4>${escapeHtml(report.foodItem)}</h4>
          <span class="report-date"><i class="fas fa-calendar"></i> ${date}</span>
        </div>
        <span class="badge ${statusClass}">${report.status.toUpperCase()}</span>
      </div>
      
      <div class="report-card-body">
        <div class="report-info-grid">
          <div class="report-info-item">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <span class="label">Type</span>
              <span class="value">${formatAdulterationType(report.adulterationType)}</span>
            </div>
          </div>
          
          <div class="report-info-item">
            <i class="fas fa-thermometer-half"></i>
            <div>
              <span class="label">Severity</span>
              <span class="badge ${severityClass}">${report.severity.toUpperCase()}</span>
            </div>
          </div>
          
          <div class="report-info-item">
            <i class="fas fa-map-marker-alt"></i>
            <div>
              <span class="label">Location</span>
              <span class="value">${escapeHtml(report.location.address)}, ${escapeHtml(report.location.city)}</span>
            </div>
          </div>
          
          ${report.shopName ? `
          <div class="report-info-item">
            <i class="fas fa-store"></i>
            <div>
              <span class="label">Shop Name</span>
              <span class="value">${escapeHtml(report.shopName)}</span>
            </div>
          </div>
          ` : ''}
          
          <div class="report-info-item full-width">
            <i class="fas fa-align-left"></i>
            <div>
              <span class="label">Description</span>
              <span class="value">${escapeHtml(report.description)}</span>
            </div>
          </div>
          
          <div class="report-info-item">
            <i class="fas fa-check-circle"></i>
            <div>
              <span class="label">Verifications</span>
              <span class="value">${report.verificationCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="report-card-actions">
        <button class="btn-view-location" onclick="viewOnMap(${report.location.coordinates[1]}, ${report.location.coordinates[0]})">
          <i class="fas fa-map"></i> View on Map
        </button>
        <button class="btn-delete-report" data-report-id="${report._id}">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `;
}

// Format adulteration type
function formatAdulterationType(type) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// View location on map
function viewOnMap(lat, lng) {
  // Scroll to map
  document.getElementById('locationMap').scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
  
  // Center map on location
  setTimeout(() => {
    map.setView([lat, lng], 15);
    placeMarker(lat, lng);
  }, 500);
}

// Delete report
async function deleteReport(reportId) {
  if (!confirm('Are you sure you want to delete this report?')) {
    return;
  }

  try {
    const response = await fetch(`/api/adulteration/report/${reportId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showSuccess();
      loadMyReports();
    } else {
      showError('Failed to delete report: ' + data.error);
    }
  } catch (error) {
    console.error('Delete error:', error);
    showError('Failed to delete report. Please try again.');
  }
}