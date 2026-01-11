const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  badgeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Badge', 
    required: true 
  },
  earnedAt: { type: Date, default: Date.now },
  assessmentId: mongoose.Schema.Types.ObjectId,
  attemptId: mongoose.Schema.Types.ObjectId
}, { 
  timestamps: true 
});

// Compound unique index to prevent duplicate badges
userBadgeSchema.index(
  { userId: 1, badgeId: 1 }, 
  { unique: true }
);

module.exports = mongoose.model('UserBadge', userBadgeSchema);