const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductsByCategory, // Add this import
  searchProducts, // Make sure this is also imported
  createProductReview // Make sure this is also imported
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes
router.route('/category/:category').get(getProductsByCategory);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/search').get(searchProducts);

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;