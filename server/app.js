const express = require("express");
const cors = require("cors");

// Route files
const userRoutes     = require("./routes/userRoutes");
const queryRoutes    = require("./routes/queryRoutes");
const contractRoutes = require("./routes/contractRoutes"); // ← NEW
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users",     userRoutes);
app.use("/api/query",     queryRoutes);
app.use("/api/contracts", contractRoutes); // ← NEW
app.use('/api/payment', paymentRoutes);

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