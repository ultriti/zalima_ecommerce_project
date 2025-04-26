const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const logger = require('../utils/logger');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password -refreshToken');

      if (!req.user) {
        logger.warn(`Auth failed: User not found for token`);
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      logger.warn(`Auth failed: ${error.message}`);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    logger.warn(`Auth failed: No token provided`);
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {  // Changed from req.user.isAdmin to req.user.role === 'admin'
    next();
  } else {
    logger.warn(`Admin access denied for user: ${req.user ? req.user._id : 'unknown'}`);
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Vendor middleware
const vendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    logger.warn(`Vendor access denied for user: ${req.user ? req.user._id : 'unknown'}`);
    res.status(403);
    throw new Error('Not authorized as a vendor');
  }
};

// SuperAdmin middleware
const superadmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    logger.warn(`Superadmin access denied for user: ${req.user ? req.user._id : 'unknown'}`);
    res.status(403);
    throw new Error('Not authorized as a superadmin');
  }
};

// Verified user middleware
const verified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    logger.warn(`Verified access denied for user: ${req.user ? req.user._id : 'unknown'}`);
    res.status(403);
    throw new Error('Email verification required');
  }
};


/**
 * Middleware for role-based authorization
 * @param {...String} roles - Allowed roles for the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user._id} with role ${req.user.role}`);
      res.status(403);
      throw new Error(`Access denied. Required role: ${roles.join(' or ')}`);
    }
    next();
  };
};

/**
 * Middleware to check if user owns the resource or is an admin
 * @param {Function} getResourceUserId - Function to extract owner ID from request
 */
const ownerOrAdmin = (getResourceUserId) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }
    
    // Allow admins and super admins
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {  // Changed from 'superAdmin' to 'superadmin'
      return next();
    }
    
    // Get the resource owner ID using the provided function
    const resourceUserId = await getResourceUserId(req);
    
    // Check if the current user is the owner
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }
    
    logger.warn(`Ownership check failed for user ${req.user._id}`);
    res.status(403);
    throw new Error('Not authorized to access this resource');
  });
};

// Update the exports
module.exports = { 
  protect, 
  authorize, 
  admin, 
  vendor, 
  superadmin,
  ownerOrAdmin,
  verified
};