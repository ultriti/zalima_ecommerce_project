const express = require('express');
const router = express.Router();
// Import the entire controller instead of destructuring
const userController = require('../controllers/userController');
const { protect, admin, vendor, superAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // memory storage multer

// Create a custom middleware that allows either admin OR superAdmin
const adminOrSuperAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superAdmin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin or super admin');
  }
};

// Use the custom middleware - Keep restricted to superAdmin only
router.get('/', protect, superAdmin, userController.getUsers);

router.put('/upload-profile-image', protect, upload.single('profileImage'), userController.uploadProfileImage);

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.authUser);
router.post('/logout', userController.logoutUser);
router.post('/google', userController.googleAuth);
router.post('/facebook', userController.facebookAuth);
router.post('/otp/send', userController.sendOTP);
router.post('/otp/verify', userController.verifyOTP);

// Use the inline function approach for the Google callback
// router.route('/google/callback').get((req, res) => {
//   console.log('Google callback route hit');
//   if (typeof userController.googleAuth === 'function') {
//     userController.googleAuth(req, res);
//   } else {
//     console.error('googleAuth is not a function:', typeof userController.googleAuth);
//     res.status(500).json({ error: 'Google auth handler not properly configured' });
//   }
// });

// Protected routes
router.route('/profile')
  .get(protect, userController.getUserProfile)
  .put(protect, userController.updateUserProfile);

// Wishlist routes
router.route('/wishlist')
  .get(protect, userController.getWishlist)
  .post(protect, userController.addToWishlist);
router.route('/wishlist/:id').delete(protect, userController.removeFromWishlist);

// Order history
router.route('/orders').get(protect, userController.getUserOrders);

router.post('/forgot-password', userController.forgotUserPassword);
router.post('/reset-password/:token', userController.resetUserPassword);

// Admin routes - Updated for better security
router.route('/:id')
  .delete(protect, adminOrSuperAdmin, userController.deleteUser)
  .get(protect, adminOrSuperAdmin, userController.getUserById)
  .put(protect, adminOrSuperAdmin, userController.updateUser);  // Changed to adminOrSuperAdmin

// This route is already correctly restricted to superAdmin
router.route('/makeadmin/:id').put(protect, superAdmin, userController.makeUserAdmin);

module.exports = router;