const express = require('express');
const router  = express.Router();

const { registerUser, loginUser } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const User    = require('../models/User');

const FREE_CONTRACT_LIMIT = 3;

router.post('/register', registerUser);
router.post('/login',    loginUser);

// Protected profile route
router.get('/profile', protect, (req, res) => {
  res.json({ message: "Protected route accessed ✅", userId: req.user });
});

// Usage endpoint — called by PlanUsageBar on mount
router.get('/usage', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('isPremium contractsUsed');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({
      isPremium:    user.isPremium,
      used:         user.contractsUsed,
      limit:        FREE_CONTRACT_LIMIT,
      limitReached: !user.isPremium && user.contractsUsed >= FREE_CONTRACT_LIMIT,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;