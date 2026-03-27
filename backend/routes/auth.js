// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'habittracker_secret_key_2024';

// ═══════════════════════════════════
// SIGNUP
// URL: POST http://localhost:5000/api/auth/signup
// ═══════════════════════════════════
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password!'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists!'
      });
    }

    // Create new user
    const newUser = new User({ username, email, password });

    // Start free trial
    newUser.subscription.trialStarted = new Date();

    await newUser.save();

    // Create JWT token
    const authToken = jwt.sign(
      { userId: newUser._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token: authToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        subscription: newUser.subscription
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ═══════════════════════════════════
// LOGIN
// URL: POST http://localhost:5000/api/auth/login
// ═══════════════════════════════════
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password!'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password!'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password!'
      });
    }

    // Create JWT token
    const authToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        subscription: user.subscription
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ═══════════════════════════════════
// GET PROFILE
// URL: GET http://localhost:5000/api/auth/profile
// ═══════════════════════════════════
router.get('/profile', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided!'
      });
    }

    const authToken = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(authToken, JWT_SECRET);

    // Find user (exclude password from result)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found!'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ═══════════════════════════════════
// UPDATE PROFILE
// URL: PUT http://localhost:5000/api/auth/profile
// ═══════════════════════════════════
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided!'
      });
    }

    const authToken = authHeader.split(' ')[1];
    const decoded = jwt.verify(authToken, JWT_SECRET);

    const { bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { bio, avatar },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;