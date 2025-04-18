const csrf = require('csurf');
const logger = require('../utils/logger');

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRF error handler
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // Log CSRF attack attempt
  logger.warn({
    message: 'CSRF attack detected',
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    headers: req.headers
  });

  // Send error response
  res.status(403);
  res.json({
    message: 'Form has been tampered with'
  });
};

module.exports = { csrfProtection, handleCsrfError };