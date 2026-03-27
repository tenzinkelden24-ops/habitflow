// backend/routes/badges.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

const BADGES = [
  { name: 'Starter', icon: '🥉', streakRequired: 3 },
  { name: 'Week Warrior', icon: '🥈', streakRequired: 7 },
  { name: 'Month Master', icon: '🥇', streakRequired: 30 },
  { name: 'Legend', icon: '💎', streakRequired: 100 }
];

// CHECK AND AWARD BADGES
router.post('/check', auth, async (req, res) => {
  try {
    const { streak } = req.body;
    const user = await User.findById(req.userId);
    const newBadges = [];

    for (const badge of BADGES) {
      if (streak >= badge.streakRequired) {
        const alreadyHas = user.badges.some(b => b.name === badge.name);
        if (!alreadyHas) {
          user.badges.push({ name: badge.name, image: badge.icon, earnedAt: new Date() });
          newBadges.push(badge);
        }
      }
    }

    await user.save();
    res.json({ success: true, newBadges, allBadges: user.badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET USER BADGES
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, badges: user.badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;