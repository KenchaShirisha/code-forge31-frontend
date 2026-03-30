const router = require('express').Router();
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// GET /api/quiz/:courseId/:level
router.get('/:courseId/:level', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const level = course.levels.find(l => l.name === req.params.level);
    if (!level) return res.status(404).json({ message: 'Level not found' });
    // Return quiz without correct answers for security
    const quiz = level.quiz.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/quiz/submit
router.post('/submit', protect, async (req, res) => {
  try {
    const { courseId, level, answers } = req.body;
    const course = await Course.findById(courseId);
    const lvl = course.levels.find(l => l.name === level);
    let score = 0;
    const results = lvl.quiz.map((q, i) => {
      const correct = answers[i] === q.correctIndex;
      if (correct) score++;
      return { question: q.question, correct, correctIndex: q.correctIndex, explanation: q.explanation };
    });
    res.json({ score, total: lvl.quiz.length, percentage: Math.round((score / lvl.quiz.length) * 100), results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
