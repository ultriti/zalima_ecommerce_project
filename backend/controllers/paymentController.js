const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Process Stripe payment
// @route   POST /api/payments/stripe
// @access  Private
const processStripePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethodId } = req.body;
  
  const order = await Order.findById(orderId);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Stripe requires amount in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Order ${order._id}`
    });
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: Date.now(),
      email_address: req.user.email
    };
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  processStripePayment
};