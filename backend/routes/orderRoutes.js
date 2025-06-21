const { getVendorOrders } = require('../controllers/orderController');
const { vendor } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const { 
  addOrderItems, 
  getOrderById, 
  updateOrderToPaid, 
  updateOrderToDelivered, 
  getMyOrders, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems);

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/vendor/my-orders').get(protect, vendor, getVendorOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/deliver')
  .put(protect, admin, updateOrderToDelivered);

// Add this route
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/CashOndelivery').put(protect, updateOrderStatus);

module.exports = router;