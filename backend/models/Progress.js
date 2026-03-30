const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  completedTopics: [String],
  quizScores: [{ topicId: String, score: Number, total: Number, date: Date }],
  solvedProblems: [String],
  percentage: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
