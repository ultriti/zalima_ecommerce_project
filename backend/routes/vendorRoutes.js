const express = require('express');
const { getMyVendorActivities } = require('../controllers/vendorController');

const router = express.Router();
const { protect, admin, superadmin } = require('../middleware/authMiddleware');
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

// Admin routes
router.get('/requests', protect, admin, getVendorRequests);
router.get('/requests/:id', protect, admin, getVendorRequestDetails);

// Superadmin routes
router.put('/requests/:id', protect, superadmin, processVendorRequest);

// router.get('/my-activities', protect, getMyVendorActivities);

module.exports = router;