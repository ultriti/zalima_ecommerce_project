const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createSupportRequest,
  getSupportRequests,
  getMyRequests,
  getSupportRequestById,
  updateSupportRequest
} = require('../controllers/supportController');

// User routes
router.post('/', protect, createSupportRequest);
router.get('/my-requests', protect, getMyRequests);

// Shared routes (with different access levels)
router.get('/:id', protect, getSupportRequestById);

// Admin routes
router.get('/', protect, admin, getSupportRequests);
router.put('/:id', protect, admin, updateSupportRequest);

module.exports = router;