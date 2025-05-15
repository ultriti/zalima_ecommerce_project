const express = require('express');
const router = express.Router();
const { processStripePayment, createOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/stripe').post(protect, processStripePayment);
router.route('/paypal_').post(createOrder);

module.exports = router;