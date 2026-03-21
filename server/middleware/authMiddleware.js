const jwt = require("jsonwebtoken");

// 🔐 Middleware to protect routes
const protect = (req, res, next) => {
  try {
    let token;

    // 🔍 check header exists
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      
      // 🪄 "Bearer TOKEN" se sirf token nikaal rahe hain
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token ❌"
      });
    }

    // 🎟️ verify token
    const decoded = jwt.verify(token, "secretkey");

    req.user = decoded.id;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token ❌"
    });
  }
};

module.exports = protect;