const router = require('express').Router();
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const { language, search } = req.query;
    let query = {};
    if (language) query.language = language;
    if (search) query.title = { $regex: search, $options: 'i' };
    const courses = await Course.find(query).select('-levels');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/level/:level
router.get('/:id/level/:level', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const level = course.levels.find(l => l.name === req.params.level);
    if (!level) return res.status(404).json({ message: 'Level not found' });
    res.json(level);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
