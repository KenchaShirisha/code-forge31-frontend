const router = require('express').Router();
const Course = require('../models/Course');

// GET /api/search?q=query
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ courses: [], problems: [], topics: [] });

    const regex = new RegExp(q, 'i');
    const courses = await Course.find({ title: regex }).select('title language icon color').limit(5);

    const allCourses = await Course.find({});
    const problems = [];
    const topics = [];

    allCourses.forEach(course => {
      course.levels.forEach(level => {
        level.problems.forEach(p => {
          if (regex.test(p.title) || regex.test(p.description)) {
            problems.push({ _id: p._id, title: p.title, difficulty: p.difficulty, language: course.language, courseId: course._id, courseName: course.title, level: level.name });
          }
        });
        level.topics.forEach(t => {
          if (regex.test(t.title) || regex.test(t.explanation)) {
            topics.push({ _id: t._id, title: t.title, language: course.language, courseId: course._id, courseName: course.title, level: level.name });
          }
        });
      });
    });

    res.json({ courses, problems: problems.slice(0, 8), topics: topics.slice(0, 8) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
