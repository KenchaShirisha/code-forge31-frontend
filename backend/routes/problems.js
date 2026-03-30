const router = require('express').Router();
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// GET /api/problems?difficulty=easy&language=python
router.get('/', protect, async (req, res) => {
  try {
    const { difficulty, language } = req.query;
    const courses = await Course.find(language ? { language } : {});
    let problems = [];
    courses.forEach(course => {
      course.levels.forEach(level => {
        level.problems.forEach(p => {
          if (!difficulty || p.difficulty === difficulty) {
            problems.push({ ...p.toObject(), courseId: course._id, language: course.language });
          }
        });
      });
    });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
