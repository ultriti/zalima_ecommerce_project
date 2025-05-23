const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const logger = require('../utils/logger');

// @desc    Get product recommendations based on user purchase history
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    // Get user's order history with populated product details
    const userOrders = await Order.find({ user: req.user._id })
      .populate({
        path: 'orderItems.product',
        select: 'category'
      });
    
    // Extract product categories the user has purchased
    const purchasedCategories = new Set();
    userOrders.forEach(order => {
      if (!order.orderItems) return;
      
      order.orderItems.forEach(item => {
        if (item.product && item.product.category) {
          purchasedCategories.add(item.product.category);
        }
      });
    });
    
    // Find products in those categories that the user hasn't purchased
    const purchasedProductIds = new Set();
    userOrders.forEach(order => {
      if (!order.orderItems) return;
      
      order.orderItems.forEach(item => {
        if (item.product) {
          purchasedProductIds.add(item.product.toString());
        }
      });
    });
    
    let recommendations = [];
    
    if (purchasedCategories.size > 0) {
      recommendations = await Product.find({
        category: { $in: Array.from(purchasedCategories) },
        _id: { $nin: Array.from(purchasedProductIds) }
      }).limit(5);
    }
    
    // If not enough recommendations, add top-rated products
    if (recommendations.length < 5) {
      const topRatedProducts = await Product.find({
        _id: { $nin: Array.from(purchasedProductIds) }
      }).sort({ rating: -1 }).limit(5 - recommendations.length);
      
      recommendations = [...recommendations, ...topRatedProducts];
    }
    
    res.json(recommendations);
  } catch (error) {
    logger.error({
      message: 'Error in getRecommendations',
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500);
    throw new Error('Failed to fetch recommendations');
  }
});

// @desc    Get similar products to a specific product
// @route   GET /api/recommendations/similar/:productId
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error('Invalid product ID');
    }
    
    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    // Find similar products based on category and brand
    const similarProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { brand: product.brand }
      ]
    })
    .sort({ rating: -1 })
    .limit(6);
    
    res.json(similarProducts);
  } catch (error) {
    logger.error({
      message: 'Error in getSimilarProducts',
      error: error.message,
      stack: error.stack,
      productId: req.params.productId
    });
    
    // Don't expose internal errors to client
    if (error.message === 'Product not found' || error.message === 'Invalid product ID') {
      throw error; // Re-throw client-facing errors
    } else {
      res.status(500);
      throw new Error('Failed to fetch similar products');
    }
  }
});

// @desc    Get personalized recommendations based on user browsing and purchase history
// @route   GET /api/recommendations/personalized
// @access  Private
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  // Get user's order history
  const userOrders = await Order.find({ user: req.user._id })
    .populate({
      path: 'orderItems.product',
      select: 'name category brand price rating numReviews'
    });
  
  // Extract user preferences
  const categoryPreferences = {};
  const brandPreferences = {};
  const priceRanges = [];
  
  userOrders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.product) {
        // Track category preferences
        if (item.product.category) {
          categoryPreferences[item.product.category] = 
            (categoryPreferences[item.product.category] || 0) + 1;
        }
        
        // Track brand preferences
        if (item.product.brand) {
          brandPreferences[item.product.brand] = 
            (brandPreferences[item.product.brand] || 0) + 1;
        }
        
        // Track price ranges
        if (item.product.price) {
          priceRanges.push(item.product.price);
        }
      }
    });
  });
  
  // Calculate preferred price range (if user has purchase history)
  let minPrice = 0;
  let maxPrice = Number.MAX_SAFE_INTEGER;
  
  if (priceRanges.length > 0) {
    // Calculate average price with 50% margin on either side
    const avgPrice = priceRanges.reduce((sum, price) => sum + price, 0) / priceRanges.length;
    minPrice = avgPrice * 0.5;
    maxPrice = avgPrice * 1.5;
  }
  
  // Get top categories and brands
  const topCategories = Object.entries(categoryPreferences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
    
  const topBrands = Object.entries(brandPreferences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
  
  // Build query based on user preferences
  const query = {};
  
  // Exclude products the user has already purchased
  const purchasedProductIds = new Set();
  userOrders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.product) {
        purchasedProductIds.add(item.product._id.toString());
      }
    });
  });
  
  if (purchasedProductIds.size > 0) {
    query._id = { $nin: Array.from(purchasedProductIds) };
  }
  
  // Add category and brand preferences if available
  if (topCategories.length > 0) {
    query.category = { $in: topCategories };
  }
  
  if (topBrands.length > 0) {
    query.brand = { $in: topBrands };
  }
  
  // Add price range if available
  if (priceRanges.length > 0) {
    query.price = { $gte: minPrice, $lte: maxPrice };
  }
  
  // Find personalized recommendations
  let personalizedRecommendations = await Product.find(query)
    .sort({ rating: -1 })
    .limit(10);
  
  // If not enough recommendations, get top-rated products
  if (personalizedRecommendations.length < 5) {
    const additionalProducts = await Product.find({
      _id: { $nin: Array.from(purchasedProductIds) }
    })
    .sort({ rating: -1 })
    .limit(10 - personalizedRecommendations.length);
    
    personalizedRecommendations = [...personalizedRecommendations, ...additionalProducts];
  }
  
  res.json(personalizedRecommendations);
});

// @desc    Get products frequently bought together with a specific product
// @route   GET /api/recommendations/frequently-bought-with/:productId
// @access  Public
const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  // Find orders containing the specified product
  const ordersWithProduct = await Order.find({
    'orderItems.product': productId
  });
  
  // Extract all products from these orders
  const productFrequency = {};
  
  ordersWithProduct.forEach(order => {
    order.orderItems.forEach(item => {
      const itemId = item.product.toString();
      
      // Skip the original product
      if (itemId !== productId) {
        productFrequency[itemId] = (productFrequency[itemId] || 0) + 1;
      }
    });
  });
  
  // Sort products by frequency
  const frequentlyBoughtProductIds = Object.entries(productFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(entry => entry[0]);
  
  // Get product details
  const frequentlyBoughtProducts = await Product.find({
    _id: { $in: frequentlyBoughtProductIds }
  });
  
  // If not enough recommendations, add products from the same category
  if (frequentlyBoughtProducts.length < 3) {
    const product = await Product.findById(productId);
    
    if (product) {
      const additionalProducts = await Product.find({
        _id: { $ne: productId, $nin: frequentlyBoughtProductIds },
        category: product.category
      })
      .limit(4 - frequentlyBoughtProducts.length);
      
      frequentlyBoughtProducts.push(...additionalProducts);
    }
  }
  
  res.json(frequentlyBoughtProducts);
});

// @desc    Get trending products based on recent orders and ratings
// @route   GET /api/recommendations/trending
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res) => {
  // Get recent orders (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentOrders = await Order.find({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  // Count product frequency in recent orders
  const productFrequency = {};
  
  recentOrders.forEach(order => {
    order.orderItems.forEach(item => {
      const productId = item.product.toString();
      productFrequency[productId] = (productFrequency[productId] || 0) + item.qty;
    });
  });
  
  // Get products with their order frequency
  const productIds = Object.keys(productFrequency);
  const products = await Product.find({ _id: { $in: productIds } });
  
  // Calculate trending score (combination of order frequency and rating)
  const trendingProducts = products.map(product => {
    const orderFrequency = productFrequency[product._id.toString()] || 0;
    const trendingScore = (orderFrequency * 0.7) + (product.rating * 0.3 * 10);
    
    return {
      ...product.toObject(),
      trendingScore
    };
  });
  
  // Sort by trending score and return top products
  trendingProducts.sort((a, b) => b.trendingScore - a.trendingScore);
  
  // Remove trending score from response
  const response = trendingProducts.slice(0, 10).map(product => {
    const { trendingScore, ...productWithoutScore } = product;
    return productWithoutScore;
  });
  
  res.json(response);
});

// @desc    Get seasonal recommendations based on current season
// @route   GET /api/recommendations/seasonal
// @access  Public
const getSeasonalRecommendations = asyncHandler(async (req, res) => {
  // Determine current season
  const now = new Date();
  const month = now.getMonth(); // 0-11
  
  let season;
  let seasonalKeywords = [];
  
  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) {
    season = 'spring';
    seasonalKeywords = ['spring', 'light', 'floral', 'rain', 'garden'];
  } else if (month >= 5 && month <= 7) {
    season = 'summer';
    seasonalKeywords = ['summer', 'beach', 'sun', 'outdoor', 'vacation', 'cool'];
  } else if (month >= 8 && month <= 10) {
    season = 'autumn';
    seasonalKeywords = ['autumn', 'fall', 'harvest', 'cozy', 'warm'];
  } else {
    season = 'winter';
    seasonalKeywords = ['winter', 'holiday', 'snow', 'gift', 'warm', 'cozy'];
  }
  
  // Find products matching seasonal keywords in name or description
  const seasonalProducts = await Product.find({
    $or: [
      { name: { $regex: seasonalKeywords.join('|'), $options: 'i' } },
      { description: { $regex: seasonalKeywords.join('|'), $options: 'i' } }
    ]
  }).limit(10);
  
  // If not enough seasonal products, add top-rated products
  if (seasonalProducts.length < 5) {
    const additionalProducts = await Product.find({
      _id: { $nin: seasonalProducts.map(p => p._id) }
    })
    .sort({ rating: -1 })
    .limit(10 - seasonalProducts.length);
    
    seasonalProducts.push(...additionalProducts);
  }
  
  res.json({
    season,
    products: seasonalProducts
  });
});

module.exports = {
  getRecommendations,
  getPersonalizedRecommendations,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getTrendingProducts,
  getSeasonalRecommendations
};