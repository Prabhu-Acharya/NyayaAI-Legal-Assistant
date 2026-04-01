const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =============================================================
// 👤 USER CONTROLLER — handles registration and login
// =============================================================
// FUTURE ADDITIONS TO ADD HERE:
//   - getProfile()    → GET /api/users/profile (protected)
//   - updateProfile() → PUT /api/users/profile (protected)
//   - deleteAccount() → DELETE /api/users/:id  (protected)
// =============================================================


// =============================================================
// 📝 REGISTER USER
// Route:  POST /api/users/register
// Access: Public (no token needed)
// Body:   { name, email, password }
// =============================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ─────────────────────────────────────────────────────────
    // VALIDATION: Basic required field checks
    // TODO: Add stronger validation (e.g. Joi or express-validator)
    //       for production — check email format, password length etc.
    // ─────────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required ❌",
      });
    }

    // ─────────────────────────────────────────────────────────
    // CHECK: Prevent duplicate accounts with same email
    // ─────────────────────────────────────────────────────────
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists ❌",
      });
    }

    // ─────────────────────────────────────────────────────────
    // SECURITY: Hash the password before saving to DB
    // bcrypt salt rounds = 10 (good balance of speed vs security)
    // NEVER store plain text passwords
    // ─────────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ─────────────────────────────────────────────────────────
    // CREATE: Save new user to MongoDB
    // isPremium defaults to false (for future billing/plan feature)
    // ─────────────────────────────────────────────────────────
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isPremium: false,
      // TODO: Add company, industry, jurisdiction fields here
      //       when Company Profile feature is built
    });

    // Return user without password field for security
    res.status(201).json({
      message: "User created successfully ✅",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Server Error ❌",
      error: error.message,
    });
  }
};


// =============================================================
// 🔑 LOGIN USER
// Route:  POST /api/users/login
// Access: Public (no token needed)
// Body:   { email, password }
// Returns: { token, user } — token is used for all protected requests
// =============================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ─────────────────────────────────────────────────────────
    // VALIDATION: Ensure both fields are provided
    // ─────────────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required ❌",
      });
    }

    // ─────────────────────────────────────────────────────────
    // FIND: Look up user by email in MongoDB
    // ─────────────────────────────────────────────────────────
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found ❌",
      });
    }

    // ─────────────────────────────────────────────────────────
    // VERIFY: Compare entered password against stored hash
    // bcrypt.compare handles all hashing internally
    // ─────────────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials ❌",
      });
    }

    // ─────────────────────────────────────────────────────────
    // TOKEN: Generate JWT for this session
    //
    // ✅ FIX: Was hardcoded as "secretkey" — now uses env variable
    //
    // Payload: { id: user._id }
    //   → This is what gets decoded in authMiddleware as req.user
    //
    // .env must have:  JWT_SECRET=your_strong_random_secret
    // ─────────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: user._id },            // payload — only store minimal data
      process.env.JWT_SECRET,      // secret from .env (never hardcode!)
      { expiresIn: "7d" }          // token expires in 7 days
      // TODO: When refresh tokens are added, reduce this to "1d"
      //       and issue a separate refresh token with longer expiry
    );

    // ─────────────────────────────────────────────────────────
    // RESPONSE: Send token + user info (exclude password)
    // Frontend should store this token in localStorage
    // ─────────────────────────────────────────────────────────
    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server Error ❌",
      error: error.message,
    });
  }
};


// Export both functions for use in userRoutes.js
module.exports = { registerUser, loginUser };