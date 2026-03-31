// backend/routes/subscription.js
const express = require('express');
const router = express.Router();
const User = require('../models/User_fixed');
const auth = require('../middleware/auth');

// CHECK TRIAL STATUS
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const now = new Date();
    const trialStart = new Date(user.subscription.trialStarted);
    const trialDays = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    const trialActive = trialDays <= 7 && !user.subscription.trialEnded;

    res.json({
      success: true,
      plan: user.subscription.plan,
      trialActive,
      trialDaysLeft: Math.max(0, 7 - trialDays)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPGRADE TO PREMIUM (after payment)
router.post('/upgrade', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.subscription.plan = 'premium';
    user.subscription.subscribedAt = new Date();
    await user.save();
    res.json({ success: true, message: 'Upgraded to Premium! ⚡' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;