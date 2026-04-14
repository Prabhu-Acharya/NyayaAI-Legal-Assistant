const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const { askQuery } = require('../controllers/queryController');

router.post('/ask', protect, askQuery);

module.exports = router;