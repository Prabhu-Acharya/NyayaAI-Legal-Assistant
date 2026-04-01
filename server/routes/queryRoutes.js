const express = require("express");
const router = express.Router();

// =============================================================
// 🧠 QUERY ROUTES — AI legal assistant endpoints
// =============================================================
// Base path (set in app.js): /api/query
// Full endpoint:             POST /api/query/ask
//
// FUTURE ROUTES TO ADD HERE:
//   POST   /history          → save a chat session to MongoDB
//   GET    /history          → get all past sessions for a user
//   GET    /history/:id      → get one specific session
//   DELETE /history/:id      → delete a session
// =============================================================

// Auth middleware — verifies JWT token on protected routes
const protect = require("../middleware/authMiddleware");

// Query controller — contains the AI call logic
const { askQuery } = require("../controllers/queryController");

// =============================================================
// POST /api/query/ask
// Access: 🔒 Protected (valid JWT required)
// Body:   { question: "your legal question here" }
//
// ✅ FIX: protect middleware was imported but NOT applied before.
//         Added protect as the second argument so unauthenticated
//         users cannot call the AI endpoint.
// =============================================================
router.post("/ask", protect, askQuery);

module.exports = router;