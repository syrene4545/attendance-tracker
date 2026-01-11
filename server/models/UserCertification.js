const mongoose = require('mongoose');

const userCertificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  sopId: { type: String, required: true, index: true },
  assessmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assessment', 
    required: true 
  },
  attemptId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AssessmentAttempt', 
    required: true 
  },
  score: { type: Number, required: true },
  certifiedAt: { type: Date, default: Date.now },
  expiresAt: Date, // Optional: for annual recertification
  certificateNumber: { type: String, unique: true },
  certificateUrl: String,
  valid: { type: Boolean, default: true }
}, { 
  timestamps: true 
});

// Generate certificate number before saving
userCertificationSchema.pre('save', function(next) {
  if (!this.certificateNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.certificateNumber = `CERT-${year}-${random}`;
  }
  next();
});

// Compound unique index to prevent duplicate certifications
userCertificationSchema.index(
  { userId: 1, sopId: 1 }, 
  { unique: true }
);

module.exports = mongoose.model('UserCertification', userCertificationSchema);