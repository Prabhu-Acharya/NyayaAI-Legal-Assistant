const express = require('express');
const router = express.Router();

// ✅ controller import
const { registerUser, loginUser } = require('../controllers/userController');

// ✅ route controller ko call karega
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;