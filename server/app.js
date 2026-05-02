const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Route files
const userRoutes = require("./routes/userRoutes");
const queryRoutes = require("./routes/queryRoutes");
const contractRoutes = require("./routes/contractRoutes");
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes'); // ← NEW

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "https://nyaya-ai-legal-assistant.vercel.app",
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many auth attempts. Please try again in 15 minutes." },
});

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { message: "Generation limit reached. Please try again in an hour." },
});

const uploadLimiter = rateLimit({           // ← NEW: 10 uploads/hour per IP
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: "Upload limit reached. Please try again in an hour." },
});

app.use(generalLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/contracts/generate", generateLimiter);
app.use("/api/documents/upload", uploadLimiter); // ← NEW

app.use("/api/users", userRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/contracts", contractRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes); // ← NEW

app.get("/", (req, res) => {
  res.send("NyayaAI API Running ✅");
});

// Global error handler — must be AFTER all routes
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;