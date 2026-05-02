const ChatSession = require('../models/ChatSession');
const Groq = require('groq-sdk');
const { searchIndianKanoon, buildKanoonKeyword } = require('../services/indianKanoon');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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
      user: req.user,
      title: 'New Chat',
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

    // auto-title
    if (session.messages.length === 0 && role === 'user') {
      session.title = text.length > 50 ? text.slice(0, 50) + '…' : text;
    }

    // push user message
    session.messages.push({ role: 'user', text });

    // ── AI reply (only when user sends) ──────────────────────────────────────
    let aiReply = '';
    let citations = [];
    let cases = [];

    if (role === 'user') {
      // RAG context from middleware
      const { systemPrompt, citations: ragCitations } = req.ragContext;
      citations = ragCitations;

      // build history for Groq (last 10 msgs to stay within context)
      const history = session.messages.slice(-10).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const groqRes = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...history],
        max_tokens: 1024,
        temperature: 0.3,
      });

      aiReply = groqRes.choices[0]?.message?.content || 'No response.';

      // IndianKanoon scrape — non-blocking best-effort
      try {
        const keyword = buildKanoonKeyword(text, citations);
        cases = await searchIndianKanoon(keyword);
      } catch (_) { }

      // push AI message
      session.messages.push({ role: 'ai', text: aiReply });

    }

    await session.save();

    res.json({ success: true, reply: aiReply, citations, cases });
  } catch (err) {
    console.error("addMessage error:", err.message, err.stack);
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