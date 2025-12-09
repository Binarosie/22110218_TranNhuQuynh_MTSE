const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 100, // 100 requests per minute
    message: 'Too many requests from this IP, please try again later.'
});

module.exports = { apiLimiter };
