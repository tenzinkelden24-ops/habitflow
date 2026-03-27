// backend/routes/habits.js
const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// ═══════════════════════════════════
// GET ALL HABITS (only for logged in user)
// ═══════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId });
    res.json({ success: true, habits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════
// CREATE A HABIT (linked to logged in user)
// ═══════════════════════════════════
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, frequency } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required!' });
    }

    const habit = new Habit({
      title,
      description,
      frequency,
      user: req.userId  // Link habit to logged in user!
    });

    await habit.save();
    res.json({ success: true, habit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════
// COMPLETE A HABIT (Track Streak)
// ═══════════════════════════════════
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found!' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
    if (lastCompleted) lastCompleted.setHours(0, 0, 0, 0);

    // Already completed today?
    if (lastCompleted && lastCompleted.getTime() === today.getTime()) {
      return res.json({ success: false, message: 'Already completed today! Come back tomorrow 🌙' });
    }

    // Check if yesterday was completed (streak continues)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastCompleted && lastCompleted.getTime() === yesterday.getTime()) {
      habit.streak += 1;
    } else {
      habit.streak = 1; // Reset streak
    }

    habit.lastCompleted = today;
    habit.completedDates.push(today);
    await habit.save();

    res.json({
      success: true,
      habit,
      message: `🔥 ${habit.streak} day streak! Keep going!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════
// UPDATE A HABIT
// ═══════════════════════════════════
router.put('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found!' });
    res.json({ success: true, habit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════
// DELETE A HABIT
// ═══════════════════════════════════
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found!' });
    res.json({ success: true, message: 'Habit deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════
// GET HABIT STATS
// ═══════════════════════════════════
router.get('/stats', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId });
    const totalHabits = habits.length;
    const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
    const bestStreak = Math.max(...habits.map(h => h.streak), 0);
    const completedToday = habits.filter(h => {
      if (!h.lastCompleted) return false;
      const today = new Date();
      const last = new Date(h.lastCompleted);
      return last.toDateString() === today.toDateString();
    }).length;

    res.json({
      success: true,
      stats: { totalHabits, totalStreaks, bestStreak, completedToday }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;