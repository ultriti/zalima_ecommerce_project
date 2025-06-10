const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

// @desc    Process Stripe payment
// @route   POST /api/payments/stripe
// @access  Private
module.exports.processStripePayment = asyncHandler(async (req, res) => {
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

const getAxcessToken = async (req, res) => {
    try {
        const clientId = process.env.PAY_PAL_CLINET_ID;
        const clientSecret = process.env.PAL_PAL_SECRETKEY;


        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
            method: 'post',
            data: 'grant_type=client_credentials',
            auth: {
                username: clientId,
                password: clientSecret,
            }
        });


        const newAxcessTOken = response.data.access_token;

        return newAxcessTOken
    } catch (err) {
        console.log(err);

    }

}
module.exports.createOrder = async (req, res) => {
  const {value} = req.body;
  console.log('--->',value);
  
   try {
        const accessToken = await getAxcessToken();
        console.log('AccessToken:', accessToken);

        const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                "intent": "CAPTURE",
                "payment_source": { "paypal": {} },
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": value
                    }
                }]
            })
        });

        const orderData = await orderResponse.json();
        console.log('Order Response:', orderData);

        if (!orderResponse.ok) {
            throw new Error(`PayPal Error: ${orderData.message || 'Unknown error'}`);
        }

        return res.status(200).json({orderData,redirect_url:orderData.links[1].href||orderData.links[0].href});
    } catch (error) {
        console.error('Error creating order:', error.message);
        return res.status(500).json({ error: 'Failed to create order' });
    }
}


