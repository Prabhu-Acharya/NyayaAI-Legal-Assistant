const crypto   = require('crypto');
const razorpay = require('../config/razorpay');
const User     = require('../models/User');

// ── Create Razorpay order ─────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount:   49900,          // ₹499 in paise
      currency: 'INR',
      receipt: `r_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay createOrder error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// ── Client-side payment verify (HMAC) ────────────────────────────────────────
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body     = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
  }

  try {
    await User.findByIdAndUpdate(req.user, { isPremium: true });
    res.json({ success: true, message: 'Payment verified. You are now Premium! 🎉' });
  } catch (err) {
    res.status(500).json({ message: 'DB update failed', error: err.message });
  }
};

// ── Week 9: Razorpay Webhook → auto isPremium flip ────────────────────────────
// Mount at POST /api/payment/webhook  (raw body — see paymentRoutes.js)
const paymentWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not set');
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  const body      = req.rawBody;           // populated in paymentRoutes.js

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (expected !== signature) {
    console.warn('Webhook signature mismatch');
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  // Only handle successful payment capture
  if (event.event === 'payment.captured') {
    const notes = event.payload?.payment?.entity?.notes || {};
    const email  = notes.email  || event.payload?.payment?.entity?.email;
    const userId = notes.userId;

    try {
      if (userId) {
        await User.findByIdAndUpdate(userId, { isPremium: true });
        console.log(`[Webhook] isPremium=true for userId=${userId}`);
      } else if (email) {
        await User.findOneAndUpdate({ email }, { isPremium: true });
        console.log(`[Webhook] isPremium=true for email=${email}`);
      } else {
        console.warn('[Webhook] payment.captured — no userId or email in notes');
      }
    } catch (err) {
      console.error('[Webhook] DB update error:', err.message);
      // Still return 200 so Razorpay doesn't retry indefinitely
    }
  }

  res.json({ status: 'ok' });
};

module.exports = { createOrder, verifyPayment, paymentWebhook };
