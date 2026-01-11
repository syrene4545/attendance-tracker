const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  userAnswer: mongoose.Schema.Types.Mixed, // String or Array
  correctAnswer: mongoose.Schema.Types.Mixed,
  correct: Boolean,
  pointsEarned: Number,
  pointsPossible: Number
});

const assessmentAttemptSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  assessmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assessment', 
    required: true,
    index: true
  },
  sopId: { type: String, required: true, index: true },
  startedAt: { type: Date, required: true },
  completedAt: Date,
  answers: [answerSchema],
  score: Number, // Percentage (0-100)
  pointsEarned: Number,
  totalPoints: Number,
  passed: Boolean,
  timeTaken: Number, // seconds
  attemptNumber: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  }
}, { 
  timestamps: true 
});

// Compound index for user + SOP
assessmentAttemptSchema.index({ userId: 1, sopId: 1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);