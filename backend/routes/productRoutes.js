const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  createProductReview,
  createVendorProduct,
  getVendorProducts,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorProductById
} = require('../controllers/productController');
const { protect, admin, vendor, authorize } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Middleware to restrict to user role
const restrictToUser = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized. Only users can perform this action.');
  }
};

// Validation middleware for products
const validateProduct = [
  check('name').trim().notEmpty().withMessage('Product name is required'),
  check('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  check('description').trim().notEmpty().withMessage('Description is required'),
  check('brand').trim().notEmpty().withMessage('Brand is required'),
  check('category').trim().notEmpty().withMessage('Category is required'),
  check('countInStock').isInt({ min: 0 }).withMessage('Stock count must be a non-negative integer'),
  // Clothing-specific validations
  check('sizes').optional().isArray().withMessage('Sizes must be an array'),
  check('colors').optional().isArray().withMessage('Colors must be an array'),
  check('material').optional().trim().notEmpty().withMessage('Material cannot be empty if provided'),
];

// Validation middleware for search and reviews
const validateSearch = [check('query').trim().notEmpty().withMessage('Search query is required')];
const validateReview = [
  check('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  check('comment').trim().notEmpty().withMessage('Comment is required'),
];

// VENDOR ROUTES - New routes for vendors to manage their products
router.route('/vendor/my-products')
  .get(protect, vendor, getVendorProducts)
  .post(protect, vendor, validateProduct, createVendorProduct);

router.route('/vendor/my-products/:id')
  .put(protect, vendor, validateProduct, updateVendorProduct)
  .delete(protect, vendor, deleteVendorProduct);

// PUBLIC ROUTES
router.route('/search').get(validateSearch, searchProducts);
router.route('/:id/reviews').post(protect, restrictToUser, validateReview, createProductReview);

// GENERAL PRODUCT ROUTES
router
  .route('/')
  .get(protect, admin, getProducts)
  .post(protect, admin, validateProduct, createProduct); // Only admins can create general products

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin', 'vendor'), validateProduct, updateProduct) // Allow vendors to update their own products
  .delete(protect, authorize('admin', 'vendor'), deleteProduct); // Allow vendors to delete their own products

  router.route('/vendor/my-products/:id')
  .get(protect, vendor, getVendorProductById) // <-- Add this line
  .put(protect, vendor, validateProduct, updateVendorProduct)
  .delete(protect, vendor, deleteVendorProduct);

module.exports = router;