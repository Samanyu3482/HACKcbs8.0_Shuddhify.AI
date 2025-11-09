const mongoose = require('mongoose');

const adulterationReportSchema = new mongoose.Schema({
  foodItem: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    shopName: String,
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - ORDER MATTERS!
        required: true
      }
    },
    area: String,
    city: String
  },
  adulterationType: {
    type: String,
    required: true,
    enum: ['color_adulteration', 'chemical_contamination', 'foreign_substance', 
           'expired_product', 'mislabeling', 'other']
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'resolved'],
    default: 'pending'
  },
  images: [String],
  verificationCount: {
    type: Number,
    default: 0
  },
  verifiedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date
  }],
  reportDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// CRITICAL: GeoJSON 2dsphere index for location queries
adulterationReportSchema.index({ 'location.coordinates': '2dsphere' });

// Additional useful indexes
adulterationReportSchema.index({ 'location.city': 1 });
adulterationReportSchema.index({ status: 1 });
adulterationReportSchema.index({ reportDate: -1 });
adulterationReportSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('AdulterationReport', adulterationReportSchema);