// backend/server.js — FINAL COMPLETE VERSION
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// ═══════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════
app.use(express.json());
app.use(cors({
  origin: [
    'https://gorgeous-sunshine-67014a.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ═══════════════════════════════════
// CONNECT TO MONGODB
// ═══════════════════════════════════
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitdb')
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch((err) => console.log('❌ MongoDB Error:', err));

// ═══════════════════════════════════
// ALL ROUTES
// ═══════════════════════════════════
app.use('/api/habits', require('./routes/habits'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/payment', require('./routes/payment'));

// ═══════════════════════════════════
// AI CHAT ROUTE
// ═══════════════════════════════════
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required!' });
    }

    // Build conversation history for context
    const messages = [];

    // Add previous messages if they exist
    if (history && history.length > 0) {
      history.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || 'YOUR_API_KEY_HERE',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system:  `You are HabitBot, a friendly and intelligent AI assistant for HabitFlow - a habit tracking app made in India.

You can talk about ANYTHING including:
- General conversation and chitchat
- Habit building tips and advice
- Productivity and wellness advice
- Life advice and motivation
- Questions about science, history, technology
- Math problems and explanations
- Career advice
- Health and fitness tips
- Anything the user wants to talk about!

About HabitFlow app:
- It is a habit tracker where users can create habits
- Track daily streaks (consecutive days completing a habit)
- Earn badges (Starter 3days, Week Warrior 7days, Month Master 30days, Legend 100days)
- Add friends and compare streaks
- Premium plan available for Rs 299/month with 7 day free trial
- Made in India, supports UPI payments
- Built by a passionate developer

Your personality:
- Friendly, warm and conversational
- Encouraging and motivating
- Helpful with ANY topic
- Use emojis occasionally
- Keep responses clear and concise
- If someone is sad or stressed, be empathetic
- If someone asks about HabitFlow, explain it clearly

Always be helpful regardless of the topic!`,
        messages: messages
      })
    });

    const data = await response.json();

    if (data.content && data.content[0]) {
      res.json({
        success: true,
        reply: data.content[0].text
      });
    } else {
      res.json({
        success: false,
        reply: 'Sorry, I could not process that. Try again!'
      });
    }

  } catch (error) {
    console.log('Chat error:', error);
    res.status(500).json({
      success: false,
      reply: 'Server error! Please try again.'
    });
  }
});

// ═══════════════════════════════════
// HOME ROUTE
// ═══════════════════════════════════
app.get('/', (req, res) => {
  res.json({
    message: '🚀 HabitFlow API is running!',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET  /api/auth/profile',
      'GET  /api/habits',
      'POST /api/habits',
      'PUT  /api/habits/:id/complete',
      'DELETE /api/habits/:id',
      'POST /api/chat'
    ]
  });
});

// ═══════════════════════════════════
// START SERVER
// ═══════════════════════════════════
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📡 API ready at http://localhost:${PORT}/api`);
});