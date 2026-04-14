const ChatSession = require('../models/ChatSession');

// ── GET /api/chat — list all sessions for user ────────────────────────────────
const listSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user })
      .sort({ updatedAt: -1 })
      .select('_id title updatedAt');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/chat — create new session ───────────────────────────────────────
const createSession = async (req, res) => {
  try {
    const session = await ChatSession.create({
      user:     req.user,
      title:    'New Chat',
      messages: [],
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/chat/:id — load a session with messages ─────────────────────────
const getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user });
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/chat/:id/message — append a message + update title ──────────────
const addMessage = async (req, res) => {
  try {
    const { role, text } = req.body;

    if (!role || !text)
      return res.status(400).json({ message: 'role and text are required.' });

    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user });
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    // Auto-title from first user message
    if (session.messages.length === 0 && role === 'user') {
      session.title = text.length > 50 ? text.slice(0, 50) + '…' : text;
    }

    session.messages.push({ role, text });
    await session.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/chat/:id — delete a session ───────────────────────────────────
const deleteSession = async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listSessions, createSession, getSession, addMessage, deleteSession };