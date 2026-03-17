const express = require('express');
const router = express.Router();

// ✅ controller import
const { registerUser } = require('../controllers/userController');

// ✅ route controller ko call karega
router.post('/register', registerUser);

module.exports = router;