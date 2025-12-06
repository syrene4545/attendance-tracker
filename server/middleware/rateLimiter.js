// File: server/middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different limits for different endpoints
const loginLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes

module.exports = {
  loginLimiter,
  apiLimiter
};