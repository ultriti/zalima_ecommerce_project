const express = require('express');
const router = express.Router();
const { processStripePayment, createOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/stripe').post(protect, processStripePayment);
router.route('/paypal_').post(createOrder);


router.get('/verify/:orderID', async (req, res) => {
    try {
        const { orderID } = req.params;

        // Get PayPal Access Token
        const accessToken = await getAccessToken(); // Implement your function to get token

        // Call PayPal API to check order status
        const response = await axios.get(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`, {
            headers: { 'Authorization': `Bearer ${accessToken}`}
        });

        console.log("Order Status Response:", response.data);

        // Return payment status to frontend
        res.json({ status: response.data.status });

    } catch (error) {
        console.error("Error verifying order:", error);
        res.status(500).json({ error: "Failed to verify order." });
    }
});


module.exports = router;