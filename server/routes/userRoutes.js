const express = require('express');
const router  = express.Router();

const {
  registerUser,
  loginUser,
  registerValidation,
  loginValidation,
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const User    = require('../models/User');

const FREE_CONTRACT_LIMIT = 3;

router.post('/register', registerValidation, registerUser);
router.post('/login',    loginValidation,    loginUser);

router.get('/profile', protect, (req, res) => {
  res.json({ message: "Protected route accessed ✅", userId: req.user });
});

router.get('/usage', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('isPremium contractsUsed usageResetDate');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({
      isPremium:    user.isPremium,
      used:         user.contractsUsed,
      limit:        FREE_CONTRACT_LIMIT,
      limitReached: !user.isPremium && user.contractsUsed >= FREE_CONTRACT_LIMIT,
      resetDate:    user.usageResetDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── NEW ──────────────────────────────────────────────────────────────────────
router.post('/accept-terms', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user,
      { hasAcceptedTerms: true },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ message: 'Terms accepted.', hasAcceptedTerms: user.hasAcceptedTerms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

module.exports = router;