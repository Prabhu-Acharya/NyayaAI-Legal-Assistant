const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // 🔥 token ke liye

// 🟢 REGISTER USER FUNCTION
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists ❌"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isPremium: false
    });

    res.status(201).json({
      message: "User created successfully ✅",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error
    });
  }
};


// 🟢 LOGIN USER FUNCTION (NEW)
const loginUser = async (req, res) => {
  try {
    // 📥 email & password frontend se aa raha hai
    const { email, password } = req.body;

    // 🔍 user find karo DB me
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found ❌"
      });
    }

    // 🔐 password compare (entered vs hashed)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials ❌"
      });
    }

    // 🎟️ JWT token generate
    const token = jwt.sign(
      { id: user._id },   // payload
      "secretkey",        // ⚠️ later .env me dalenge
      { expiresIn: "1d" }
    );

    // ✅ success response
    res.status(200).json({
      message: "Login successful ✅",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error
    });
  }
};


// 🔥 IMPORTANT → dono export karo
module.exports = { registerUser, loginUser };