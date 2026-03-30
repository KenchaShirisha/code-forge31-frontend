const router = require('express').Router();
const Discussion = require('../models/Discussion');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/discuss/:courseId/:problemId
router.get('/:courseId/:problemId', protect, async (req, res) => {
  try {
    const discussions = await Discussion.find({
      courseId: req.params.courseId,
      problemId: req.params.problemId,
    }).populate('user', 'name').populate('replies.user', 'name').sort({ pinned: -1, createdAt: -1 });
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/discuss
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, problemId, content } = req.body;
    const discussion = await Discussion.create({ courseId, problemId, user: req.user._id, content });
    await discussion.populate('user', 'name');
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/discuss/:id/upvote
router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    const uid = req.user._id.toString();
    const idx = discussion.upvotes.map(String).indexOf(uid);
    if (idx > -1) discussion.upvotes.splice(idx, 1);
    else {
      discussion.upvotes.push(req.user._id);
      if (discussion.user.toString() !== uid) {
        await Notification.create({ user: discussion.user, type: 'upvote', title: 'Your post was upvoted!', message: `Someone upvoted your discussion post.`, icon: '👍', link: '' });
      }
    }
    await discussion.save();
    res.json({ upvotes: discussion.upvotes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/discuss/:id/reply
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);
    discussion.replies.push({ user: req.user._id, content });
    await discussion.save();
    await discussion.populate('replies.user', 'name');
    if (discussion.user.toString() !== req.user._id.toString()) {
      await Notification.create({ user: discussion.user, type: 'reply', title: 'New reply on your post', message: `${req.user.name} replied to your discussion.`, icon: '💬', link: '' });
    }
    res.json(discussion.replies[discussion.replies.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/discuss/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (discussion.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await discussion.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
