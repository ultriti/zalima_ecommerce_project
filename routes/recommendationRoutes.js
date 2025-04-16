const express = require('express');
const router = express.Router();
const { 
  getRecommendations,
  getPersonalizedRecommendations,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getTrendingProducts,
  getSeasonalRecommendations
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Basic recommendations (cached for 30 minutes)
router.get('/', protect, cacheMiddleware(1800), getRecommendations);

// Personalized recommendations based on user history
router.get('/personalized', protect, getPersonalizedRecommendations);

// Product-specific recommendations
router.get('/similar/:productId', cacheMiddleware(3600), getSimilarProducts);
router.get('/frequently-bought-with/:productId', cacheMiddleware(3600), getFrequentlyBoughtTogether);

// Trending and seasonal recommendations
router.get('/trending', cacheMiddleware(1800), getTrendingProducts);
router.get('/seasonal', cacheMiddleware(86400), getSeasonalRecommendations);

module.exports = router;