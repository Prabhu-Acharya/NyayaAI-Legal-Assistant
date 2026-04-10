const crypto   = require('crypto');
const razorpay = require('../config/razorpay');
const User     = require('../models/User');

const createOrder = async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount:   49900,
      currency: 'INR',
      receipt: `r_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay createOrder error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

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

module.exports = { createOrder, verifyPayment };