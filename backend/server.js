cat > /mnt/user-data/outputs/server.js << 'EOF'
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitdb')
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch((err) => console.log('❌ MongoDB Error:', err));

app.use('/api/habits', require('./routes/habits'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/payment', require('./routes/payment'));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log('Chat received:', message);
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);

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
        system: 'You are HabitBot, a friendly AI assistant for HabitFlow habit tracker app made in India. You can talk about ANYTHING. Be friendly, warm, use emojis, keep responses short.',
        messages: messages
      })
    });

    const data = await response.json();
    console.log('Claude status:', response.status);

    if (data.content && data.content[0]) {
      res.json({ success: true, reply: data.content[0].text });
    } else {
      console.log('Bad response:', JSON.stringify(data));
      res.json({ success: false, reply: 'Sorry, try again!' });
    }
  } catch (error) {
    console.log('Chat error:', error.message);
    res.status(500).json({ success: false, reply: 'Server error! Try again.' });
  }
});

app.get('/', function(req, res) {
  res.json({
    message: 'HabitFlow API is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected',
    apiKey: process.env.ANTHROPIC_API_KEY ? 'Set' : 'Missing'
  });
});

app.listen(PORT, function() {
  console.log('Server running at port ' + PORT);
});
EOF