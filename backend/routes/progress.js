const router = require('express').Router();
const Progress = require('../models/Progress');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const BADGES = [
  { id: 'first_blood', name: 'First Blood', icon: '🩸', desc: 'Solved your first problem' },
  { id: 'quiz_master', name: 'Quiz Master', icon: '🎯', desc: 'Scored 100% on a quiz' },
  { id: 'streak_3', name: 'On Fire', icon: '🔥', desc: 'Maintained a 3-day streak' },
  { id: 'streak_7', name: 'Week Warrior', icon: '⚔️', desc: 'Maintained a 7-day streak' },
  { id: 'streak_30', name: 'Monthly Legend', icon: '🏆', desc: 'Maintained a 30-day streak' },
  { id: 'xp_100', name: 'XP Hunter', icon: '⭐', desc: 'Earned 100 XP' },
  { id: 'xp_500', name: 'XP Collector', icon: '💫', desc: 'Earned 500 XP' },
  { id: 'xp_1000', name: 'XP Master', icon: '🌟', desc: 'Earned 1000 XP' },
  { id: 'course_complete', name: 'Graduate', icon: '🎓', desc: 'Completed a full course' },
  { id: 'daily_5', name: 'Daily Grinder', icon: '📅', desc: 'Completed 5 daily challenges' },
  { id: 'problems_10', name: 'Problem Solver', icon: '🧩', desc: 'Solved 10 problems' },
  { id: 'problems_50', name: 'Code Ninja', icon: '🥷', desc: 'Solved 50 problems' },
];

async function awardBadges(userId, context = {}) {
  const user = await User.findById(userId);
  const earned = user.badges.map(b => b.id);
  const toAward = [];

  const allProgress = await Progress.find({ user: userId });
  const totalSolved = allProgress.reduce((s, p) => s + (p.solvedProblems?.length || 0), 0);
  const totalQuizzes = allProgress.reduce((a, p) => a + (p.quizScores?.length || 0), 0);

  const checks = [
    { id: 'first_blood', cond: totalSolved >= 1 },
    { id: 'problems_10', cond: totalSolved >= 10 },
    { id: 'problems_50', cond: totalSolved >= 50 },
    { id: 'quiz_master', cond: context.quizPerfect === true },
    { id: 'streak_3', cond: user.streak >= 3 },
    { id: 'streak_7', cond: user.streak >= 7 },
    { id: 'streak_30', cond: user.streak >= 30 },
    { id: 'xp_100', cond: user.xp >= 100 },
    { id: 'xp_500', cond: user.xp >= 500 },
    { id: 'xp_1000', cond: user.xp >= 1000 },
    { id: 'course_complete', cond: user.certificates?.length > 0 },
    { id: 'daily_5', cond: user.dailyChallengeStreak >= 5 },
  ];

  for (const check of checks) {
    if (check.cond && !earned.includes(check.id)) {
      const badge = BADGES.find(b => b.id === check.id);
      if (badge) toAward.push({ ...badge, earnedAt: new Date() });
    }
  }

  if (toAward.length > 0) {
    await User.findByIdAndUpdate(userId, { $push: { badges: { $each: toAward } } });
  }
  return toAward;
}

async function logActivity(userId, type) {
  const today = new Date().toISOString().split('T')[0];
  const user = await User.findById(userId);
  const existing = user.activityLog?.find(a => a.date === today);
  if (existing) {
    await User.updateOne(
      { _id: userId, 'activityLog.date': today },
      { $inc: { [`activityLog.$.${type}`]: 1 } }
    );
  } else {
    const entry = { date: today, xp: 0, problems: 0, quizzes: 0 };
    entry[type] = 1;
    await User.findByIdAndUpdate(userId, { $push: { activityLog: entry } });
  }
}

// GET /api/progress/:courseId
router.get('/:courseId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
    res.json(progress || { completedTopics: [], percentage: 0, quizScores: [], solvedProblems: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/progress/topic
router.post('/topic', protect, async (req, res) => {
  try {
    const { courseId, topicId, level, totalTopics } = req.body;
    let progress = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!progress) progress = new Progress({ user: req.user._id, course: courseId, level, completedTopics: [], solvedProblems: [] });

    let newBadges = [];
    if (!progress.completedTopics.includes(topicId)) {
      progress.completedTopics.push(topicId);
      if (!progress.solvedProblems) progress.solvedProblems = [];
      if (!progress.solvedProblems.includes(topicId)) progress.solvedProblems.push(topicId);
      progress.percentage = Math.round((progress.completedTopics.length / totalTopics) * 100);
      if (progress.percentage >= 100) {
        progress.completed = true;
        progress.completedAt = new Date();
        await User.findByIdAndUpdate(req.user._id, { $push: { certificates: { courseId, issuedAt: new Date() } }, $inc: { xp: 500 } });
      }
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10 } });
      await logActivity(req.user._id, 'problems');
      newBadges = await awardBadges(req.user._id);
    }
    await progress.save();
    res.json({ progress, newBadges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/progress/quiz
router.post('/quiz', protect, async (req, res) => {
  try {
    const { courseId, topicId, score, total, level } = req.body;
    let progress = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!progress) progress = new Progress({ user: req.user._id, course: courseId, level });
    progress.quizScores.push({ topicId, score, total, date: new Date() });
    await progress.save();
    const xpEarned = score * 5;
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });
    await logActivity(req.user._id, 'quizzes');
    const newBadges = await awardBadges(req.user._id, { quizPerfect: score === total });
    res.json({ progress, newBadges, xpEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/progress/all/me
router.get('/all/me', protect, async (req, res) => {
  try {
    const all = await Progress.find({ user: req.user._id }).populate('course', 'title language icon color');
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/progress/daily/challenge
router.get('/daily/challenge', protect, async (req, res) => {
  try {
    const Course = require('../models/Course');
    const courses = await Course.find({});
    const allProblems = [];
    courses.forEach(c => c.levels.forEach(l => l.problems.forEach(p => allProblems.push({ ...p.toObject(), courseId: c._id, language: c.language, courseName: c.title }))));
    // Pick deterministic daily problem based on date
    const dayIndex = Math.floor(Date.now() / 86400000);
    const problem = allProblems[dayIndex % allProblems.length];
    const user = await User.findById(req.user._id);
    const today = new Date().toDateString();
    const alreadyDone = user.lastDailyChallenge && new Date(user.lastDailyChallenge).toDateString() === today;
    res.json({ problem, alreadyDone, dailyChallengeStreak: user.dailyChallengeStreak || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/progress/daily/complete
router.post('/daily/complete', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date().toDateString();
    if (user.lastDailyChallenge && new Date(user.lastDailyChallenge).toDateString() === today) {
      return res.json({ message: 'Already completed today', alreadyDone: true });
    }
    user.dailyChallengeStreak = (user.dailyChallengeStreak || 0) + 1;
    user.lastDailyChallenge = new Date();
    user.xp += 50;
    await user.save();
    const newBadges = await awardBadges(req.user._id);
    res.json({ message: 'Daily challenge completed!', xpEarned: 50, dailyChallengeStreak: user.dailyChallengeStreak, newBadges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
