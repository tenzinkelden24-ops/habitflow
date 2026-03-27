// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const auth = require('../middleware/auth');

// Replace with your actual Razorpay keys from razorpay.com
const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_SECRET'
});

// CREATE ORDER
router.post('/create-order', auth, async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 29900, // ₹299 in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;