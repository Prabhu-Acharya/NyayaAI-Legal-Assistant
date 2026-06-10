const mongoose = require('mongoose');

// Week 9: added citations[] to messageSchema
const citationSchema = new mongoose.Schema({
  section:      { type: String },
  topic:        { type: String },
  contractType: { type: String },
  score:        { type: Number },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'ai'], required: true },
  text:      { type: String, required: true },
  citations: { type: [citationSchema], default: [] },   // ← NEW
  createdAt: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, default: 'New Chat' },
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
