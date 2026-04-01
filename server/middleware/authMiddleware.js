const jwt = require("jsonwebtoken");

// =============================================================
// 🔐 AUTH MIDDLEWARE — protects private routes
// =============================================================
// HOW IT WORKS:
//   1. Reads the "Authorization" header from the incoming request
//   2. Extracts the JWT token (format: "Bearer <token>")
//   3. Verifies it using JWT_SECRET from .env
//   4. If valid → attaches user ID to req.user and calls next()
//   5. If invalid/missing → returns 401 Unauthorized
//
// HOW TO USE ON ANY ROUTE:
//   const protect = require("../middleware/authMiddleware");
//   router.get("/profile", protect, yourController);
// =============================================================

const protect = (req, res, next) => {
  try {
    let token;

    // ─────────────────────────────────────────────────────────
    // STEP 1: Check if Authorization header exists and starts
    //         with "Bearer" (standard JWT format)
    // ─────────────────────────────────────────────────────────
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Split "Bearer eyJhbGci..." → take index [1] (the token part)
      token = req.headers.authorization.split(" ")[1];
    }

    // ─────────────────────────────────────────────────────────
    // STEP 2: If no token found, block the request immediately
    // ─────────────────────────────────────────────────────────
    if (!token) {
      return res.status(401).json({
        message: "Not authorized — no token provided ❌",
      });
    }

    // ─────────────────────────────────────────────────────────
    // STEP 3: Verify the token using the secret from .env
    //
    // ✅ FIX: Was hardcoded as "secretkey" — now uses env variable
    //
    // Make sure your .env file has:
    //   JWT_SECRET=your_strong_random_secret_here
    //
    // Generate a strong secret by running in terminal:
    //   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    // ─────────────────────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user ID to req object so controllers can use it
    // Example usage in any controller: const userId = req.user;
    req.user = decoded.id;

    // ─────────────────────────────────────────────────────────
    // STEP 4: Token is valid → pass control to the next handler
    // ─────────────────────────────────────────────────────────
    next();

  } catch (error) {
    // Token is expired, tampered with, or completely invalid
    return res.status(401).json({
      message: "Not authorized — invalid or expired token ❌",
    });
  }
};

module.exports = protect;