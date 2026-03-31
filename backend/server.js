const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitdb')
  .then(function() { console.log('Connected to MongoDB!'); })
  .catch(function(err) { console.log('MongoDB Error:', err); });

app.use('/api/habits', require('./routes/habits'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/payment', require('./routes/payment'));

app.post('/api/chat', async function(req, res) {
  try {
    const message = req.body.message;
    const history = req.body.history;

    if (!message) {
      return res.status(400).json({ success: false, reply: 'Message required!' });
    }

    const messages = [];
    if (history && history.length > 0) {
      history.forEach(function(msg) {
        messages.push({ role: msg.role, content: msg.content });
      });
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: 'You are HabitBot, a friendly AI assistant for HabitFlow habit tracker. Talk about anything - habits, life, general chat. Be friendly and use emojis.',
        messages: messages
      })
    });

    const data = await response.json();

    if (data.content && data.content[0]) {
      res.json({ success: true, reply: data.content[0].text });
    } else {
      res.json({ success: false, reply: 'Sorry, try again!' });
    }
  } catch (error) {
    console.log('Chat error:', error.message);
    res.status(500).json({ success: false, reply: 'Server error!' });
  }
});

app.get('/', function(req, res) {
  res.json({
    message: 'HabitFlow API is running!',
    apiKey: process.env.ANTHROPIC_API_KEY ? 'Set' : 'Missing'
  });
});

app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});