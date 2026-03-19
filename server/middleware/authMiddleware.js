const jwt = require("jsonwebtoken");

// 🔐 Middleware to protect routes
const protect = (req, res, next) => {
  try {
    // 📥 Authorization header lo
    const authHeader = req.headers.authorization;

    // ❌ agar header hi nahi hai
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        message: "Not authorized, no token ❌"
      });
    }

    // ✅ "Bearer TOKEN" me se sirf TOKEN nikaal rahe hain
    const token = authHeader.split(" ")[1];

    // 🎟️ token verify
    const decoded = jwt.verify(token, "secretkey");

    // 🧠 user id store
    req.user = decoded.id;

    next(); // aage jao

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token ❌"
    });
  }
};

module.exports = protect;