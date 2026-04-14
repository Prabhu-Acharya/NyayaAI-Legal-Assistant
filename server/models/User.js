const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPremium: { type: Boolean, default: false },

  // Free-plan usage counter — incremented on each successful generation
  contractsUsed: { type: Number, default: 0 },
  usageResetDate: { type: Date, default: () => new Date() },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);