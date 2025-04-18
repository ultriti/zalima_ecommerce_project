const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    logger.warn({
      message: 'Rate limit exceeded',
      ip: req.ip,
      path: req.originalUrl
    });
    res.status(options.statusCode).json({
      message: options.message
    });
  }
});

// More strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after an hour',
  handler: (req, res, next, options) => {
    logger.warn({
      message: 'Authentication rate limit exceeded',
      ip: req.ip,
      path: req.originalUrl
    });
    res.status(options.statusCode).json({
      message: options.message
    });
  }
});

module.exports = { apiLimiter, authLimiter };