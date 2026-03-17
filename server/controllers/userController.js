const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 🟢 REGISTER USER FUNCTION
const registerUser = async (req, res) => {
  try {
    // 📥 frontend se data le rahe hain
    const { name, email, password } = req.body;

    // 🔍 check karo user already exist karta hai ya nahi
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists ❌"
      });
    }

    // 🔐 password ko secure banane ke liye hash kar rahe hain
    const salt = await bcrypt.genSalt(10); 
    // salt ek random string hoti hai jo security badhati hai

    const hashedPassword = await bcrypt.hash(password, salt);
    // actual password ko encrypted form me convert kar diya

    // 🧱 database me new user create kar rahe hain
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // plain password nahi store karte
      isPremium: false
    });

    // ✅ success response bhej rahe hain
    res.status(201).json({
      message: "User created successfully ✅",
      user
    });

  } catch (error) {
    // ❌ agar koi error aaye to handle karo
    res.status(500).json({
      message: "Server Error",
      error
    });
  }
};

module.exports = { registerUser };