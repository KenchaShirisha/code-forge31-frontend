const router = require('express').Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/enroll/:courseId
router.post('/enroll/:courseId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { courseId } = req.params;
    if (!user.enrolledCourses.map(String).includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
      await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    }
    res.json({ message: 'Enrolled successfully', enrolledCourses: user.enrolledCourses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/enroll/:courseId
router.delete('/enroll/:courseId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.enrolledCourses = user.enrolledCourses.filter(id => String(id) !== req.params.courseId);
    await user.save();
    res.json({ message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
