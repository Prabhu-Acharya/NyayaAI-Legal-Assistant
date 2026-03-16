const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            message: "User created successfully ✅",
            user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;