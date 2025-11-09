const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },

  adulteration_types: [String],
  health_issues: [String],

  home_remedies: {
    type: Map,       
    
    of: String
  },

  lab_tests: {
    type: Map,
    of: String
  },

  youtube_links: [String],
  youtube_shorts_links: [String],
  self_video_link: [String],

  prevention_tips: { type: String },

  related_articles: [String],
  image_url: { type: String },

  tags: [String],

  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FoodItem", foodItemSchema);
