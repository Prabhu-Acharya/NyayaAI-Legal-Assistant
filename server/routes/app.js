const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Route files
const userRoutes = require("./routes/userRoutes");
const queryRoutes = require("./routes/queryRoutes");
const contractRoutes = require("./routes/contractRoutes"); // ← NEW
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,             // 100 requests per window
  message: { message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,              // 10 login/register attempts per window
  message: { message: "Too many auth attempts. Please try again in 15 minutes." },
});

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,              // 20 contract generations per hour
  message: { message: "Generation limit reached. Please try again in an hour." },
});

app.use( generalLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/contracts/generate", generateLimiter);

app.use("/api/users", userRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/contracts", contractRoutes); // ← NEW
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);

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