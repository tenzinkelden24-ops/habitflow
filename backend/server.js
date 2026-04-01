const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitdb')
  .then(function() { console.log('Connected to MongoDB!'); })
  .catch(function(err) { console.log('Error:', err); });
app.use('/api/habits', require('./routes/habits'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/payment', require('./routes/payment'));

app.post('/api/chat', function(req, res) {
  const message = (req.body.message || '').toLowerCase();
  let reply = '';

  if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
    reply = 'Hey there! Welcome to HabitFlow! I am HabitBot. How can I help you today?';
  } else if (message.includes('what is habitflow') || message.includes('about')) {
    reply = 'HabitFlow is a habit tracking app made in India! Track streaks, earn badges, add friends and build better habits every day!';
  } else if (message.includes('habit')) {
    reply = 'Great question about habits! Start small, just 5 minutes a day. Consistency beats intensity every time!';
  } else if (message.includes('streak')) {
    reply = 'Streaks are powerful! Even missing one day resets your streak, so try to complete your habits every single day!';
  } else if (message.includes('badge')) {
    reply = 'You can earn badges at 3, 7, 14, 30 and 100 day streaks! Keep going to unlock them all!';
  } else if (message.includes('premium')) {
    reply = 'Premium plan is Rs 299 per month with a 7-day free trial! You get unlimited habits and advanced features!';
  } else if (message.includes('friend')) {
    reply = 'Add friends by their username in the Friends tab! Compete on streaks together and stay motivated!';
  } else if (message.includes('how are you') || message.includes('how r u')) {
    reply = 'I am doing great, thanks for asking! Ready to help you build better habits today!';
  } else if (message.includes('tip') || message.includes('advice')) {
    reply = 'Top habit tip: Link your new habit to an existing one. For example, after brushing teeth, meditate for 2 minutes!';
  } else if (message.includes('motivat')) {
    reply = 'You are doing amazing! Every day you show up is a win. Small steps lead to big changes. Keep going!';
  } else if (message.includes('morning')) {
    reply = 'Morning routines are powerful! Try waking up at the same time, drink water, and do 5 minutes of movement to start strong!';
  } else if (message.includes('sleep')) {
    reply = 'Good sleep is the foundation of all habits! Try sleeping at the same time every night. Your future self will thank you!';
  } else if (message.includes('exercise') || message.includes('workout')) {
    reply = 'Exercise is one of the best habits you can build! Start with just 10 minutes a day and build from there!';
  } else if (message.includes('thank')) {
    reply = 'You are welcome! Keep building those habits, you are doing great!';
  } else if (message.includes('bye') || message.includes('goodbye')) {
    reply = 'Goodbye! Keep up your habits and come back tomorrow to maintain your streak!';
  } else if (message.includes('goal')) {
    reply = 'Setting clear goals is the first step! Break big goals into small daily habits and track them here on HabitFlow!';
  } else if (message.includes('water') || message.includes('drink')) {
    reply = 'Drinking water is a great habit to track! Aim for 8 glasses a day and add it as a daily habit on HabitFlow!';
  } else if (message.includes('read')) {
    reply = 'Reading is an amazing habit! Even 10 pages a day adds up to over 12 books a year. Add it to your habits today!';
  } else if (message.includes('meditat')) {
    reply = 'Meditation is one of the highest impact habits you can build! Start with just 5 minutes a day and increase gradually!';
  } else {
    reply = 'That is interesting! I am HabitBot, here to help you build better habits and use HabitFlow. Ask me about habits, streaks, badges or the app!';
  }

  res.json({ success: true, reply: reply });
});

app.get('/', function(req, res) {
  res.json({ message: 'HabitFlow running!', apiKey: process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING' });
});

app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});