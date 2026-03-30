const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/leaderboard
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('name xp streak avatar')
      .sort({ xp: -1 })
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
