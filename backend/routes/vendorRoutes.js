const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  submitVendorRequest,
  getVendorRequests,
  getVendorRequestDetails,
  processVendorRequest,
  getMyVendorRequestStatus
} = require('../controllers/vendorController');

// User routes
router.post('/request', protect, submitVendorRequest);
router.get('/my-request', protect, getMyVendorRequestStatus);

// Admin and Superadmin routes
router.get('/requests', protect, authorize('admin', 'superadmin'), getVendorRequests);
router.get('/requests/:id', protect, authorize('admin', 'superadmin'), getVendorRequestDetails);
router.put('/requests/:id', protect, authorize('admin', 'superadmin'), processVendorRequest);

module.exports = router;