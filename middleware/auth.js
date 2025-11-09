// middleware/auth.js

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};

// Middleware to check if user is already authenticated
const isAuthenticated = (req, res, next) => {
  if (req.oidc.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
};

module.exports = { requireAuth, isAuthenticated };