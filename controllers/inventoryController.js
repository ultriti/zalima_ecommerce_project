const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const InventoryLog = require('../models/inventoryModel');
const logger = require('../utils/logger');

// @desc    Update inventory for a product
// @route   POST /api/inventory/update
// @access  Private/Admin
const updateInventory = asyncHandler(async (req, res) => {
  const { productId, action, quantity, reason, notes } = req.body;

  // Validate input
  if (!productId || !action || !quantity || !reason) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Find product
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Store previous count
  const previousCount = product.countInStock;
  let newCount;

  // Update inventory based on action
  switch (action) {
    case 'add':
      newCount = previousCount + Number(quantity);
      break;
    case 'remove':
      newCount = previousCount - Number(quantity);
      if (newCount < 0) {
        res.status(400);
        throw new Error('Cannot remove more items than available in stock');
      }
      break;
    case 'adjust':
      newCount = Number(quantity);
      break;
    case 'return':
      newCount = previousCount + Number(quantity);
      break;
    default:
      res.status(400);
      throw new Error('Invalid action');
  }

  // Update product count
  product.countInStock = newCount;
  await product.save();

  // Create inventory log
  const inventoryLog = await InventoryLog.create({
    product: productId,
    user: req.user._id,
    action,
    quantity: Number(quantity),
    previousCount,
    newCount,
    reason,
    notes: notes || '',
  });

  // Log the inventory update
  logger.info(
    `Inventory updated: ${action} ${quantity} units of ${product.name} by ${req.user.name}. Reason: ${reason}`
  );

  res.status(200).json({
    success: true,
    data: {
      product: {
        _id: product._id,
        name: product.name,
        countInStock: product.countInStock,
      },
      log: inventoryLog,
    },
  });
});

// @desc    Get inventory logs for a specific product
// @route   GET /api/inventory/product/:id
// @access  Private/Admin
const getProductInventoryLogs = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get inventory logs for the product
  const logs = await InventoryLog.find({ product: productId })
    .populate('user', 'name email')
    .sort('-createdAt');

  res.json(logs);
});

// @desc    Get all inventory logs
// @route   GET /api/inventory/logs
// @access  Private/Admin
const getAllInventoryLogs = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  // Filter options
  const filterOptions = {};
  
  if (req.query.productId) {
    filterOptions.product = req.query.productId;
  }
  
  if (req.query.action) {
    filterOptions.action = req.query.action;
  }

  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    filterOptions.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const count = await InventoryLog.countDocuments(filterOptions);
  
  const logs = await InventoryLog.find(filterOptions)
    .populate('product', 'name')
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    logs,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get inventory summary
// @route   GET /api/inventory/summary
// @access  Private/Admin
const getInventorySummary = asyncHandler(async (req, res) => {
  // Get low stock products (less than 10 items)
  const lowStockProducts = await Product.find({ countInStock: { $lt: 10 } })
    .select('name countInStock')
    .sort('countInStock');
  
  // Get out of stock products
  const outOfStockProducts = await Product.find({ countInStock: 0 })
    .select('name countInStock');
  
  // Get total inventory value
  const products = await Product.find({})
    .select('name price countInStock');
  
  const totalInventoryValue = products.reduce((total, product) => {
    return total + (product.price * product.countInStock);
  }, 0);
  
  // Get inventory activity for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentActivity = await InventoryLog.find({
    createdAt: { $gte: thirtyDaysAgo }
  })
    .populate('product', 'name')
    .populate('user', 'name')
    .sort('-createdAt')
    .limit(10);
  
  res.json({
    lowStockProducts,
    outOfStockProducts: {
      count: outOfStockProducts.length,
      products: outOfStockProducts
    },
    totalInventoryValue,
    totalProducts: products.length,
    recentActivity
  });
});

module.exports = {
  updateInventory,
  getProductInventoryLogs,
  getAllInventoryLogs,
  getInventorySummary
};