const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: String,
  explanation: String,
  codeExample: String,
  language: String,
  order: Number,
});

const quizQuestionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctIndex: Number,
  explanation: String,
});

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  starterCode: String,
  testCases: [{ input: String, expectedOutput: String }],
  language: String,
});

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  instructions: String,
  hints: [String],
  starterCode: String,
  solution: String,
  language: String,
});

const levelSchema = new mongoose.Schema({
  name: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  topics: [topicSchema],
  quiz: [quizQuestionSchema],
  problems: [problemSchema],
  assignments: [assignmentSchema],
});

const courseSchema = new mongoose.Schema({
  title: String,
  language: { type: String, enum: ['c', 'cpp', 'java', 'python', 'javascript'] },
  description: String,
  icon: String,
  color: String,
  levels: [levelSchema],
  enrolledCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
