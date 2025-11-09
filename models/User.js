// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  picture: String,
  role: {
    type: String,
    enum: ['user', 'verified_user', 'admin'],
    default: 'user'
  },
  verificationScore: {
    type: Number,
    default: 0
  },
  reportsSubmitted: {
    type: Number,
    default: 0
  },
  verificationsProvided: {
    type: Number,
    default: 0
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);