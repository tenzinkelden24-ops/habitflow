const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Save new message
router.post('/', async function(req, res) {
  try {
    const msg = new Message({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
    });
    await msg.save();
    res.json({ success: true, message: 'Message sent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all messages (admin)
router.get('/', async function(req, res) {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, messages: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark as read
router.put('/:id/read', async function(req, res) {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete message
router.delete('/:id', async function(req, res) {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;