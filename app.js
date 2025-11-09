const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const path = require('path');
const Items = require('./models/items');
const User = require('./models/User');
const AdulterationReport = require('./models/AdulterationReport');
const { auth } = require('express-openid-connect');

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

app.use(auth(config));

// Middleware to provide default variables to all views
app.use((req, res, next) => {
  res.locals.user = req.oidc.user || null;
  res.locals.isAuthenticated = req.oidc.isAuthenticated();
  res.locals.title = 'Shuddhify.AI - Food Safety';
  res.locals.styles = '';
  res.locals.scripts = '';
  res.locals.currentYear = new Date().getFullYear();
  res.locals.siteName = 'Shuddhify.AI';
  next();
});

// Attach User from MongoDB
const attachUser = async (req, res, next) => {
  if (req.oidc.isAuthenticated()) {
    try {
      let user = await User.findOne({ auth0Id: req.oidc.user.sub });
      
      if (!user) {
        user = await User.create({
          auth0Id: req.oidc.user.sub,
          email: req.oidc.user.email,
          name: req.oidc.user.name,
          picture: req.oidc.user.picture
        });
      }
      
      req.user = user;
    } catch (error) {
      console.error('Error attaching user:', error);
    }
  }
  next();
};

app.use(attachUser);

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required',
      redirectTo: '/login'
    });
  }
  next();
};

// MongoDB Connection
main()
  .then(() => { console.log("Connected to MongoDB"); })
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/shuddhify');
}

// ============================================
// PAGE ROUTES
// ============================================

app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    return res.redirect('/home');
  }
  res.render('pages/home', {
    title: 'Home - Shuddhify.AI',
    styles: '<link rel="stylesheet" href="/css/style_home.css">',
    scripts: `
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <script src="/js/home.js"></script>
    `
  });
});

app.get('/profile', (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('pages/profile', {
    title: 'Profile - Shuddhify.AI',
    user: req.oidc.user
  });
});

app.get('/home', (req, res) => {
  const user= req.oidc.user;
  console.log(user);
  res.render('pages/home', {
    title: 'Home - Shuddhify.AI',
    styles: '<link rel="stylesheet" href="/css/style_home.css">',
    scripts: `
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <script src="/js/home.js"></script>
    `,
    user,
     isAuthenticated: req.oidc.isAuthenticated(),
    
  });
});

app.get('/items', async (req, res) => {
  try {
    const items = await Items.find();
    res.render('pages/items', {
      title: 'Items - Shuddhify.AI',
      styles: '<link rel="stylesheet" href="/css/items.css">',
      scripts: `
        <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
        <script src="/js/items.js"></script>
      `,
      items
    });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid item ID');
    }

    const item = await Items.findById(id);

    if (!item) {
      return res.status(404).send('Item not found');
    }

    res.render('pages/item', {
      title: `${item.name} - Shuddhify.AI`,
      styles: '<link rel="stylesheet" href="/css/item.css">',
      scripts: `
        <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
        <script src="/js/item.js"></script>
      `,
      item,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading item page');
  }
});

app.get('/news', (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('pages/news', {
    title: 'News - Shuddhify.AI',
    styles: '<link rel="stylesheet" href="/css/news.css">',
    scripts: `
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <script src="/js/news.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    `
  });
});

app.get('/report', (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('pages/report', {
    title: 'Report - Shuddhify.AI',
    styles: '<link rel="stylesheet" href="/css/report.css"> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">',
    scripts: `
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <script src="/js/report.js"></script>
    `
  });
});

// NEW: Adulteration Map Page
app.get('/map', (req, res) => {
  res.render('pages/map', {
    title: 'Adulteration Hotspot Map - Shuddhify.AI',
    styles: `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
      <link rel="stylesheet" href="/css/map.css">
    `,
    scripts: `
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
      <script src="/js/map.js"></script>
    `
  });
});

// ============================================
// API ROUTES - ADULTERATION REPORTS
// ============================================

/// ============================================
// API ROUTES - ADULTERATION REPORTS
// ============================================

// Submit new report
app.get('/reports',(req,res)=>{
  res.render('pages/reports',{
    title:'Report - Shuddhify.AI',
    styles:'<link rel="stylesheet" href="/css/reports.css"> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />',
    scripts:'<script src="/js/reports.js"></script>  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'
  });
});

app.get('/nearby', (req, res) => {
  res.render('pages/nearby', {
    title: 'Nearby Reports - Shuddhify.AI',
    styles: `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="/css/nearby.css">
    `,
    scripts: `
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="/js/nearby.js"></script>
    `
  });
});

app.post('/api/adulteration/report', isAuthenticated, async (req, res) => {
  try {
    const report = new AdulterationReport({
      foodItem: req.body.foodItem,
      location: {
        shopName: req.body.shopName,
        address: req.body.address,
        coordinates: {
          type: 'Point',
          // IMPORTANT: GeoJSON uses [longitude, latitude] order!
          coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
        },
        area: req.body.area,
        city: req.body.city
      },
      adulterationType: req.body.adulterationType,
      description: req.body.description,
      severity: req.body.severity,
      reportedBy: req.user._id
    });

    await report.save();

    // Update user's report count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { reportsSubmitted: 1 }
    });

    res.json({ success: true, reportId: report._id });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all reports (public)
app.get('/api/adulteration/reports', async (req, res) => {
  try {
    const { city, foodItem, severity, status } = req.query;
    
    let query = { status: { $ne: 'rejected' } };
    
    if (city) query['location.city'] = new RegExp(city, 'i'); // Case-insensitive
    if (foodItem) query.foodItem = new RegExp(foodItem, 'i');
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const reports = await AdulterationReport.find(query)
      .populate('reportedBy', 'name picture')
      .sort({ reportDate: -1 })
      .limit(500);

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});




// Verify a report
app.post('/api/adulteration/verify/:reportId', isAuthenticated, async (req, res) => {
  try {
    const report = await AdulterationReport.findById(req.params.reportId);
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Check if user already verified
    const alreadyVerified = report.verifiedBy.some(
      v => v.user.toString() === req.user._id.toString()
    );

    if (alreadyVerified) {
      return res.status(400).json({ success: false, error: 'You already verified this report' });
    }

    // Check if user is verifying their own report
    if (report.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot verify your own report' });
    }

    report.verifiedBy.push({ user: req.user._id, timestamp: new Date() });
    report.verificationCount += 1;

    // Auto-verify if enough verifications
    if (report.verificationCount >= 3 && report.status === 'pending') {
      report.status = 'verified';
    }

    await report.save();

    // Update user's verification count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { verificationsProvided: 1, verificationScore: 1 }
    });

    res.json({ 
      success: true, 
      verificationCount: report.verificationCount,
      status: report.status
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get hotspot statistics
app.get('/api/adulteration/hotspots', async (req, res) => {
  try {
    const hotspots = await AdulterationReport.aggregate([
      { $match: { status: { $in: ['pending', 'verified'] } } },
      {
        $group: {
          _id: {
            area: '$location.area',
            city: '$location.city'
          },
          count: { $sum: 1 },
          highSeverityCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          },
          // GeoJSON coordinates are [lng, lat]
          avgLng: { $avg: { $arrayElemAt: ['$location.coordinates.coordinates', 0] } },
          avgLat: { $avg: { $arrayElemAt: ['$location.coordinates.coordinates', 1] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ success: true, hotspots });
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's own reports
app.get('/api/adulteration/my-reports', isAuthenticated, async (req, res) => {
  try {
    const reports = await AdulterationReport.find({ reportedBy: req.user._id })
      .sort({ reportDate: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete own report
app.delete('/api/adulteration/report/:reportId', isAuthenticated, async (req, res) => {
  try {
    const report = await AdulterationReport.findOne({
      _id: req.params.reportId,
      reportedBy: req.user._id
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found or unauthorized' });
    }

    await report.deleteOne();
    
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { reportsSubmitted: -1 }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auth status endpoint
app.get('/api/auth/status', (req, res) => {
  res.json({
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.isAuthenticated() ? {
      name: req.oidc.user.name,
      email: req.oidc.user.email,
      picture: req.oidc.user.picture
    } : null
  });
});







app.get('/models', (req, res) => {
  res.render('pages/models', {
    title: 'AI Models - Shuddhify.AI',
    styles: '<link rel="stylesheet" href="/css/models.css">',
    scripts: `
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <script src="/js/models.js"></script>
    `
  });
});


// ============================================
// N8N WORKFLOW INTEGRATION
// ============================================

const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");

// Multer setup to handle file uploads (temporary folder)
const upload = multer({ dest: "uploads/" });

app.get("/analyze-ingrid", isAuthenticated, (req, res) => {
  res.render("pages/analyze", {
    title: "Analyze Food Adulteration - Shuddhify.AI",
    styles: '<link rel="stylesheet" href="/css/analyze.css">',
    scripts: `
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <script src="/js/analyze.js"></script>
    `
  });
});

app.get("/analyze-img", isAuthenticated, (req, res) => {
  res.render("pages/analyze1", {
    title: "Analyze Food Adulteration - Shuddhify.AI",
    styles: '<link rel="stylesheet" href="/css/analyze.css">',
    scripts: `
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <script src="/js/analyze.js"></script>
    `
  });
});

// Example: analyze food adulteration via n8n workflow
app.post("/api/analyze-ingrid", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    // Replace with your actual n8n webhook URL
    const n8nWebhookURL = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook-test/9f6cf92f-2ece-42e4-abec-104ec751be81";

    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path));
    form.append("userEmail", req.user.email);
    form.append("foodItem", req.body.foodItem || "Unknown");

    // Send file to n8n webhook
    const response = await axios.post(n8nWebhookURL, form, {
      headers: form.getHeaders(),
      timeout: 30000, // 30s timeout
    });

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    // Return AI result to frontend
    res.json({
      success: true,
      message: "Analysis complete",
      result: response.data,
    });
  } catch (err) {
    console.error("n8n integration error:", err.message);
    res.status(500).json({
      success: false,
      error: "Error connecting to n8n workflow",
      details: err.message,
    });
  }
});

// Example: analyze food adulteration via n8n workflow
app.post("/api/analyze-img", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    // Replace with your actual n8n webhook URL
    const n8nWebhookURL = "http://localhost:5678/webhook-test/8fb1215a-c450-43f9-891b-33937c1a968b/analyze-food";


    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path));
    form.append("userEmail", req.user.email);
    form.append("foodItem", req.body.foodItem || "Unknown");

    // Send file to n8n webhook
    const response = await axios.post(n8nWebhookURL, form, {
      headers: form.getHeaders(),
      timeout: 30000, // 30s timeout
    });

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    // Return AI result to frontend
    res.json({
      success: true,
      message: "Analysis complete",
      result: response.data,
    });
  } catch (err) {
    console.error("n8n integration error:", err.message);
    res.status(500).json({
      success: false,
      error: "Error connecting to n8n workflow",
      details: err.message,
    });
  }
});

// ============================================
// START SERVER
// ============================================


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// npx n8n start --tunnel 