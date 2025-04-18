const sanitize = require('mongo-sanitize');
const logger = require('../utils/logger');

const sanitizeRequest = (req, res, next) => {
  try {
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return sanitize(obj);
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitizeObject(obj[key]);
        return acc;
      }, Array.isArray(obj) ? [] : {});
    };
    
    req.body = sanitizeObject(req.body);
    req.params = sanitizeObject(req.params);
    req.query = sanitizeObject(req.query);
    next();
  } catch (error) {
    // Log the error but continue processing the request
    logger.error({
      message: 'Error in sanitize middleware',
      error: error.message,
      stack: error.stack
    });
    next();
  }
};

module.exports = { sanitizeRequest };