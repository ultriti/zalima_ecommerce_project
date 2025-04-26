const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin, superadmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { check } = require('express-validator');

// Flexible role-based middleware
const restrictTo = (...roles) => (req, res, next) => {
  // Convert both the required roles and user role to lowercase for case-insensitive comparison
  if (req.user && roles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())) {
    next();
  } else {
    res.status(403);
    throw new Error(`Not authorized. Required roles: ${roles.join(', ')}`);
  }
};

// Validation middleware
const validateProfileImage = [check('profileImage').notEmpty().withMessage('Profile image is required')];
const validateOTP = [
  check('email').isEmail().withMessage('Valid email is required'),
  check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

router.get('/', protect, superadmin, userController.getUsers);

router.get('/search', protect, restrictTo('admin', 'superAdmin'), userController.searchUsers);

router.put(
  '/upload-profile-image',
  protect,
  upload.single('profileImage'),
  validateProfileImage,
  userController.uploadProfileImage
);

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.authUser);
router.post('/logout', userController.logoutUser);
router.post('/google', userController.googleAuth);
router.post('/facebook', userController.facebookAuth);
router.post('/otp/send', userController.sendOTP);
router.post('/otp/verify', validateOTP, userController.verifyOTP);

// Google callback route
router.get('/google/callback', userController.googleAuth);

// Protected routes
router
  .route('/profile')
  .get(protect, userController.getUserProfile)
  .put(protect, userController.updateUserProfile);

// Wishlist routes
router
  .route('/wishlist')
  .get(protect, userController.getWishlist)
  .post(protect, userController.addToWishlist);
router.route('/wishlist/:id').delete(protect, userController.removeFromWishlist);
router.route('/wishlist/decrement/:id').put(protect, userController.decrementWishlistItem);

// Order history
router.route('/orders').get(protect, userController.getUserOrders);

router.post('/forgot-password', userController.forgotUserPassword);
router.post('/reset-password/:token', userController.resetUserPassword);

// Admin routes
router
  .route('/:id')
  .delete(protect, restrictTo('admin', 'superAdmin'), userController.deleteUser)
  .get(protect, restrictTo('admin', 'superAdmin'), userController.getUserById)
  .put(protect, restrictTo('admin', 'superAdmin'), userController.updateUser);

router.route('/makeadmin/:id').put(protect, superadmin, userController.makeUserAdmin);

router.post('/admin-login', userController.adminLogin);

router.put('/:id/promote', protect, superadmin, userController.promoteUser);

router.get('/vendors/requests', protect, restrictTo('admin', 'superAdmin'), userController.getVendorRequests);
router.get('/vendors/requests/count', protect, restrictTo('admin', 'superAdmin'), userController.getVendorRequestsCount);
router.put('/vendors/requests/:id', protect, restrictTo('superAdmin'), userController.handleVendorRequest);
router.get('/vendors/my-request', protect, userController.getMyVendorRequest);
router.post('/vendors/request', protect, userController.submitVendorRequest);

router.put('/:id/role', protect, restrictTo('admin', 'superadmin'), userController.changeUserRole);

module.exports = router;