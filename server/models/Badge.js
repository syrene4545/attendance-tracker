const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String, // emoji or icon name
  type: { 
    type: String, 
    enum: ['achievement', 'milestone', 'special'],
    default: 'achievement'
  },
  criteria: {
    type: { type: String }, // e.g., 'perfect-score', 'first-attempt', 'all-sops'
    value: mongoose.Schema.Types.Mixed
  },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: { type: Number, default: 10 }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Badge', badgeSchema);