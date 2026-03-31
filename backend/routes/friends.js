// backend/routes/friends.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ADD FRIEND
router.post('/add', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const friend = await User.findOne({ username });
    if (!friend) return res.status(404).json({ success: false, message: 'User not found!' });

    const user = await User.findById(req.userId);
    if (user.friends.includes(friend._id)) {
      return res.json({ success: false, message: 'Already friends!' });
    }

    user.friends.push(friend._id);
    await user.save();
    res.json({ success: true, message: `${username} added as friend!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET FRIENDS LIST
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends', 'username email');
    res.json({ success: true, friends: user.friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;