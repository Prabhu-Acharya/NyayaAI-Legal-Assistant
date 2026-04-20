const User     = require("../models/User");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// ── Validation rules — exported and used in userRoutes.js ────────────────────
const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required."),
];

// ── REGISTER ─────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password:  hashedPassword,
      isPremium: false,
    });

    res.status(201).json({
      message: "User created successfully ✅",
      user: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error ❌", error: error.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found ❌" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials ❌" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message:          "Login successful ✅",
      token,
      hasAcceptedTerms: user.hasAcceptedTerms, // ← top-level read by Login.jsx
      user: {
        _id:             user._id,
        name:            user.name,
        email:           user.email,
        isPremium:       user.isPremium,
        hasAcceptedTerms: user.hasAcceptedTerms,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error ❌", error: error.message });
  }
};

// ── GET PROFILE ──────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('name email isPremium');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ name: user.name, email: user.email, isPremium: user.isPremium });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = { registerUser, loginUser, registerValidation, loginValidation, getProfile };