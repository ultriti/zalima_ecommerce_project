const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    
    // Total sales
    const orders = await Order.find({});
    const totalSales = orders.reduce((total, order) => total + (order.totalPrice || 0), 0);
    
    // Recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.qty' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate product details
    const topProductsWithDetails = await Product.populate(topProducts, {
      path: '_id',
      select: 'name image price'
    });
    
    res.json({
      userCount,
      orderCount,
      productCount,
      totalSales,
      recentOrders,
      topProducts: topProductsWithDetails.map(item => ({
        product: item._id,
        totalSold: item.totalSold
      }))
    });
  } catch (error) {
    logger.error({
      message: 'Error in getDashboardStats',
      error: error.message,
      stack: error.stack
    });
    res.status(500);
    throw new Error('Failed to fetch dashboard statistics');
  }
});

// @desc    Get sales report with filters
// @route   GET /api/dashboard/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
  try {
    // Get date range from query params or use default (last 30 days)
    const { startDate, endDate, timeFrame } = req.query;
    let start, end;
    
    if (startDate && endDate) {
      // Validate date format
      if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
        res.status(400);
        throw new Error('Invalid date format. Please use YYYY-MM-DD format');
      }
      
      start = new Date(startDate);
      end = new Date(endDate);
      
      // Validate date range
      if (start > end) {
        res.status(400);
        throw new Error('Start date must be before end date');
      }
    } else {
      // Default to last 30 days if no dates provided
      end = new Date();
      
      if (timeFrame === 'week') {
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeFrame === 'month') {
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (timeFrame === 'year') {
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
      } else {
        // Default to 30 days
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }
    
    // Get all paid orders within date range
    const orders = await Order.find({
      isPaid: true,
      paidAt: { $gte: start, $lte: end }
    }).sort({ paidAt: 1 });
    
    // Group by day for the report
    const salesByDay = {};
    
    orders.forEach(order => {
      if (!order.paidAt) return; // Skip orders without paidAt date
      
      const date = order.paidAt.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!salesByDay[date]) {
        salesByDay[date] = {
          date,
          orders: 0,
          sales: 0,
          items: 0
        };
      }
      
      salesByDay[date].orders += 1;
      salesByDay[date].sales += order.totalPrice || 0;
      salesByDay[date].items += order.orderItems.reduce((total, item) => total + (item.qty || 0), 0);
    });
    
    // Convert to array for easier consumption by frontend
    const salesReport = Object.values(salesByDay);
    
    // Calculate totals
    const totalSales = salesReport.reduce((total, day) => total + day.sales, 0);
    const totalOrders = salesReport.reduce((total, day) => total + day.orders, 0);
    const totalItems = salesReport.reduce((total, day) => total + day.items, 0);
    
    res.json({
      salesReport,
      summary: {
        totalSales,
        totalOrders,
        totalItems,
        averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error({
      message: 'Error in getSalesReport',
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500);
    throw new Error('Failed to generate sales report');
  }
});

// @desc    Get revenue breakdown by product category
// @route   GET /api/dashboard/revenue-by-category
// @access  Private/Admin
const getRevenueByCategory = asyncHandler(async (req, res) => {
  // Get date range from query params or use default (last 30 days)
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  
  // Aggregate orders to get revenue by category
  const revenueByCategory = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        isPaid: true
      }
    },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$productDetails.category",
        revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
        count: { $sum: "$orderItems.qty" }
      }
    },
    {
      $project: {
        category: "$_id",
        revenue: 1,
        count: 1,
        _id: 0
      }
    },
    { $sort: { revenue: -1 } }
  ]);
  
  res.json(revenueByCategory);
});

// @desc    Get top selling products
// @route   GET /api/dashboard/top-products
// @access  Private/Admin
const getTopSellingProducts = asyncHandler(async (req, res) => {
  const { limit = 10, period } = req.query;
  
  // Determine date range based on period
  let dateFilter = {};
  if (period) {
    const now = new Date();
    let startDate;
    
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === 'year') {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
    
    if (startDate) {
      dateFilter = { createdAt: { $gte: startDate } };
    }
  }
  
  // Find top selling products
  const topProducts = await Order.aggregate([
    { $match: { ...dateFilter, isPaid: true } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.qty' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: parseInt(limit) }
  ]);
  
  // Populate product details
  const topProductsWithDetails = await Product.populate(topProducts, {
    path: '_id',
    select: 'name image price brand category countInStock'
  });
  
  // Format the response
  const formattedProducts = topProductsWithDetails.map(item => ({
    product: {
      _id: item._id._id,
      name: item._id.name,
      image: item._id.image,
      price: item._id.price,
      brand: item._id.brand,
      category: item._id.category,
      countInStock: item._id.countInStock
    },
    totalSold: item.totalSold,
    revenue: item.revenue
  }));
  
  res.json(formattedProducts);
});

// @desc    Get customer statistics
// @route   GET /api/dashboard/customer-stats
// @access  Private/Admin
const getCustomerStats = asyncHandler(async (req, res) => {
  // Get total user count
  const totalUsers = await User.countDocuments();
  
  // Get new users in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // Get users with orders
  const usersWithOrders = await Order.distinct('user');
  const activeUsers = usersWithOrders.length;
  
  // Get top customers by order value
  const topCustomers = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ]);
  
  // Populate user details
  const topCustomersWithDetails = await User.populate(topCustomers, {
    path: '_id',
    select: 'name email'
  });
  
  // Format the response
  const formattedTopCustomers = topCustomersWithDetails.map(customer => ({
    user: {
      _id: customer._id._id,
      name: customer._id.name,
      email: customer._id.email
    },
    totalSpent: customer.totalSpent,
    orderCount: customer.orderCount,
    averageOrderValue: (customer.totalSpent / customer.orderCount).toFixed(2)
  }));
  
  res.json({
    totalUsers,
    newUsers,
    activeUsers,
    conversionRate: ((activeUsers / totalUsers) * 100).toFixed(2),
    topCustomers: formattedTopCustomers
  });
});

module.exports = {
  getDashboardStats,
  getSalesReport,
  getRevenueByCategory,
  getTopSellingProducts,
  getCustomerStats
};