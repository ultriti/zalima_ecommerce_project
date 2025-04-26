const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Initialize cache with default TTL of 10 minutes and check period of 60 seconds
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

/**
 * Middleware to cache responses
 * @param {number} duration - Cache duration in seconds
 * @param {string} customKey - Optional custom cache key
 */
const cacheMiddleware = (duration = 300, customKey = '') => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create a cache key based on the URL and any query parameters
    const key = customKey || `${req.originalUrl}`;
    
    // Check if we have a cached response
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      logger.debug(`Cache hit for ${key}`);
      return res.status(200).json(cachedResponse);
    }

    // Store the original send method
    const originalSend = res.json;
    
    // Override the json method to cache the response
    res.json = function(body) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, duration);
        logger.debug(`Cached response for ${key} (TTL: ${duration}s)`);
      }
      
      // Call the original json method
      return originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Clear cache entries matching a pattern
 * @param {string} pattern - Pattern to match cache keys
 */
const clearCache = (pattern = '') => {
  if (!pattern) {
    logger.debug('Clearing entire cache');
    cache.flushAll();
    return;
  }
  
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  if (matchingKeys.length > 0) {
    matchingKeys.forEach(key => cache.del(key));
    logger.debug(`Cleared ${matchingKeys.length} cache entries matching "${pattern}"`);
  }
};

/**
 * Middleware to clear cache when data is modified
 * @param {string} pattern - Pattern to match cache keys to clear
 */
const clearCacheMiddleware = (pattern) => {
  return (req, res, next) => {
    // Store the original end method
    const originalEnd = res.end;
    
    // Override the end method to clear cache on successful response
    res.end = function(...args) {
      // If the request was successful, clear the cache
      if (res.statusCode >= 200 && res.statusCode < 400) {
        clearCache(pattern);
      }
      
      // Call the original end function
      originalEnd.apply(this, args);
    };
    
    next();
  };
};

module.exports = {
  cacheMiddleware,
  clearCacheMiddleware,
  clearCache
};