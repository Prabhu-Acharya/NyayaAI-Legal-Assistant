const express = require('express');
const router = express.Router();

// ✅ controller import
const { registerUser, loginUser } = require('../controllers/userController');

// 🔐 middleware import
const protect = require('../middleware/authMiddleware');

// ✅ route controller ko call karega
router.post('/register', registerUser);
router.post('/login', loginUser);

// 🔒 PROTECTED ROUTE (NEW ADDITION)
router.get('/profile', protect, (req, res) => {
  res.json({
    message: "Protected route accessed ✅",
    userId: req.user
  });
});


module.exports = router;