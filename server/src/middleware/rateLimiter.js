const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for auth endpoints
 * Limits: 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for OTP endpoints
 * Limits: 3 requests per 10 minutes
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: "Too many OTP requests. Please try again after 10 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password reset
 * Limits: 3 requests per hour
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many password reset requests. Please try again after 1 hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for email verification
 * Limits: 5 requests per hour
 */
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many email verification attempts. Please try again after 1 hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
};