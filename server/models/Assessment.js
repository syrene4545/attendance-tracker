const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['multiple-choice', 'true-false', 'scenario']
  },
  question: { type: String, required: true },
  options: [String], // For multiple-choice and scenario
  correctAnswer: mongoose.Schema.Types.Mixed, // String or Array
  explanation: String,
  points: { type: Number, default: 1 },
  category: String // e.g., "Till Operations", "Fraud Prevention"
});

const assessmentSchema = new mongoose.Schema({
  sopId: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  title: { type: String, required: true },
  description: String,
  passingScore: { type: Number, default: 80 },
  timeLimit: Number, // minutes, null if no limit
  questions: [questionSchema],
  totalPoints: Number,
  active: { type: Boolean, default: true },
  mandatory: { type: Boolean, default: false },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  }
}, { 
  timestamps: true 
});

// Calculate total points before saving
assessmentSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);