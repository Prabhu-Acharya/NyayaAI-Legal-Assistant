// =============================================================
// 🚀 SERVER ENTRY POINT
// =============================================================
// This file is responsible for:
//   1. Loading environment variables from .env
//   2. Importing the configured Express app from app.js
//   3. Connecting to MongoDB
//   4. Starting the HTTP server on the specified PORT
//
// NOTE: All routes and middleware are defined in app.js
//       This file only bootstraps the server — keep it clean.
// =============================================================

require("dotenv").config(); // Must be first — loads .env before anything else

// ── Env validation — crash fast if required vars are missing ─────────────────
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "GROQ_API_KEY"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
  console.error("Check your .env file against .env.example");
  process.exit(1);
}

const app = require("./app");
const connectDB = require("./config/db");

// ─────────────────────────────────────────────────────────────
// ✅ FIX: queryRoutes was being mounted AGAIN here as /api
//         This caused duplicate route registration:
//           /api/query/ask  (from app.js — correct)
//           /api/ask        (from here — duplicate, wrong path)
//         Removed the duplicate. All routes live in app.js only.
// ─────────────────────────────────────────────────────────────

// Connect to MongoDB Atlas (URI comes from .env → MONGO_URI)
connectDB();

// Read PORT from .env, fallback to 5000 for local development
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});

// =============================================================
// TODO — FUTURE: Add graceful shutdown handling
//   process.on("SIGTERM", () => { server.close(); mongoose.disconnect(); })
// =============================================================