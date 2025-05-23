const { body, param, query, validationResult } = require('express-validator');

// User validation
const validateRegisterUser = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
  validateResults
];

const validateLoginUser = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateResults
];

// Product validation
const validateCreateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than 0'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('countInStock')
    .isInt({ min: 0 })
    .withMessage('Count in stock must be a positive integer'),
  validateResults
];

const validateUpdateProduct = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional()
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price must be greater than 0'),
  body('countInStock').optional()
    .isInt({ min: 0 }).withMessage('Count in stock must be a positive integer'),
  validateResults
];

// Order validation
const validateCreateOrder = [
  body('orderItems').isArray().withMessage('Order items must be an array'),
  body('orderItems.*.product').notEmpty().withMessage('Product ID is required'),
  body('orderItems.*.qty')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  validateResults
];

// Review validation
const validateCreateReview = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
  validateResults
];

// ID parameter validation (reusable)
const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validateResults
];

// Helper function to validate results
function validateResults(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = {
  validateRegisterUser,
  validateLoginUser,
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateOrder,
  validateCreateReview,
  validateMongoId,
  validateResults
};