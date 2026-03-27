// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'habittracker_secret_key_2024';

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ 
      success: false, 
      message: 'Access denied! Please login.' 
    });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token!' });
  }
};