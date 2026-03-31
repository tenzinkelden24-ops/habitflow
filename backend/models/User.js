cat > /mnt/user-data/outputs/User_fixed.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  badges: [{ name: String, image: String, earnedAt: Date }],
  subscription: {
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    trialStarted: { type: Date, default: null },
    trialEnded: { type: Boolean, default: false },
    subscribedAt: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
EOF