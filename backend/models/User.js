const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  xp: { type: Number, default: 0 },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  completedTopics: [{ type: String }],
  bookmarks: [{ type: String }],
  certificates: [{ courseId: String, issuedAt: Date }],
  badges: [{ id: String, name: String, icon: String, desc: String, earnedAt: Date }],
  dailyChallengeStreak: { type: Number, default: 0 },
  lastDailyChallenge: { type: Date },
  activityLog: [{ date: String, xp: Number, problems: Number, quizzes: Number }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
