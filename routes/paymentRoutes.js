const express = require('express');
const router = express.Router();
const { processStripePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/stripe').post(protect, processStripePayment);

module.exports = router;