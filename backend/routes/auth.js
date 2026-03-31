const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = 'habittracker_secret_key_2024';

router.post('/signup', async function(req, res) {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields!' });
    }
    const existing = await User.findOne({ $or: [{ email: email }, { username: username }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email already exists!' });
    }
    const newUser = new User({ username: username, email: email, password: password });
    newUser.subscription.trialStarted = new Date();
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token: token, user: { id: newUser._id, username: newUser.username, email: newUser.email, subscription: newUser.subscription } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async function(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields!' });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password!' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password!' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token: token, user: { id: user._id, username: user.username, email: user.email, subscription: user.subscription } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/profile', async function(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token!' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    res.json({ success: true, user: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;