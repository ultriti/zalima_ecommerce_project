const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
  getDashboardStats,
  getSalesReport,
  getRevenueByCategory,
  getTopSellingProducts,
  getCustomerStats
} = require('../controllers/dashboardController');

// All dashboard routes require admin access
router.use(protect, admin);

// Dashboard overview stats
router.get('/stats', getDashboardStats);

// Sales reports
router.get('/sales', getSalesReport);

// Revenue by category - Temporarily commented out until controller function is implemented
router.get('/revenue-by-category', getRevenueByCategory);

// Top selling products
router.get('/top-products', getTopSellingProducts);

// Customer statistics
router.get('/customer-stats', getCustomerStats);

module.exports = router;