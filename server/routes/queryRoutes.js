const express = require("express");
const router = express.Router();

// 🔐 middleware import
const protect = require("../middleware/authMiddleware");

// 🧠 controller import
const { askQuery } = require("../controllers/queryController");

// 🟢 protected route (login ke bina access nahi milega)
router.post("/ask", askQuery);

module.exports = router;