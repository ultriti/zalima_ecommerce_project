const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
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

// Validation middleware
const validateSearch = [check('query').trim().notEmpty().withMessage('Search query is required')];
const validateReview = [
  check('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  check('comment').trim().notEmpty().withMessage('Comment is required'),
];

router.route('/category/:category').get(getProductsByCategory);
router.route('/:id/reviews').post(protect, restrictToUser, validateReview, createProductReview);
router.route('/search').get(validateSearch, searchProducts);

router
  .route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;