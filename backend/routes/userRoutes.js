const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController'); // Added for product approval
const { protect, admin, superadmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { check } = require('express-validator');
const mongoose = require('mongoose');

// Validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }
  next();
};

// Flexible role-based middleware
const restrictTo = (...roles) => (req, res, next) => {
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

// Cart validation middleware
const validateCartItem = [
  check('productId').isMongoId().withMessage('Valid product ID is required'),
  check('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// Validate product approval
const validateProductApproval = [
  check('vendorApproved').isBoolean().withMessage('vendorApproved must be a boolean'),
  check('status')
    .isIn(['active', 'rejected'])
    .withMessage('Status must be either active or rejected')
];

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

router.put(
  '/upload-profile-image',
  protect,
  upload.single('profileImage'),
  userController.uploadProfileImage
);

// Wishlist routes
router
  .route('/wishlist')
  .get(protect, userController.getWishlist)
  .post(protect, userController.addToWishlist);
router.route('/wishlist/:id').delete(protect, userController.removeFromWishlist);
router.route('/wishlist/decrement/:id').put(protect, userController.decrementWishlistItem);

// Cart routes
router
  .route('/cart')
  .get(protect, userController.getCart)
  .post(protect, validateCartItem, userController.addToCart)
  .delete(protect, userController.clearCart);

router.route('/cart/:productId')
  .put(protect, userController.updateCartItem)
  .delete(protect, userController.removeFromCart);

router.route('/cart/increment/:productId').put(protect, userController.incrementCartItem);
router.route('/cart/decrement/:productId').put(protect, userController.decrementCartItem);

// Order history
router.route('/orders').get(protect, userController.getUserOrders);

// Address route
router.get('/:id/addresses', protect, validateObjectId, userController.getUserAddresses);

router.post('/forgot-password', userController.forgotUserPassword);
router.post('/reset-password/:token', userController.resetUserPassword);
router.post('/reset-password-otp', userController.resetPasswordWithOtp);

// Admin routes
router.get('/', protect, restrictTo('admin', 'superadmin'), userController.getUsers);
router.get('/search', protect, restrictTo('admin', 'superadmin'), userController.searchUsers);

router
  .route('/:id')
  .delete(protect, restrictTo('admin', 'superadmin'), validateObjectId, userController.deleteUser)
  .get(protect, validateObjectId, userController.getUserById)
  .put(protect, restrictTo('admin', 'superadmin','user'), validateObjectId, userController.updateUser);

router.route('/makeadmin/:id').put(protect, superadmin, validateObjectId, userController.makeUserAdmin);

router.put('/:id/promote', protect, restrictTo('admin', 'superadmin'), validateObjectId, userController.promoteUser);
router.put('/:id/role', protect, restrictTo('admin', 'superadmin'), validateObjectId, userController.changeUserRole);
router.put('/:id/password', protect, validateObjectId, userController.changeUserPassword);

router.post('/admin-login', userController.adminLogin);

router.get('/products/pending', protect, restrictTo('admin', 'superadmin'), productController.getPendingProducts);

router.put(
  '/products/:productId/approve',
  protect,
  restrictTo('admin', 'superadmin'),
  validateObjectId,
  validateProductApproval,
  productController.updateProduct
);

module.exports = router;