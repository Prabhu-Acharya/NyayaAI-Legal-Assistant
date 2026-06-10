const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const { createOrder, verifyPayment, paymentWebhook } = require('../controllers/paymentController');

// Week 9: webhook needs raw body for HMAC verification.
// express.json() has already run globally, so we capture raw bytes here.
const rawBodyCapture = (req, res, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
};

router.post('/create-order', protect, createOrder);
router.post('/verify',       protect, verifyPayment);

// Webhook — NO auth middleware, raw body capture
router.post('/webhook', rawBodyCapture, paymentWebhook);

module.exports = router;
