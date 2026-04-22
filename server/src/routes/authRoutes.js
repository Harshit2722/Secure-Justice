const express = require("express");
const router = express.Router();
const { register, login, verifyEmail, verifyOTP, resendOTP, forgotPassword, resetPassword } = require("../controllers/authController");
const { authLimiter, otpLimiter, passwordResetLimiter, emailVerificationLimiter } = require("../middleware/rateLimiter");

// POST /api/auth/register
router.post("/register", authLimiter, register);

// POST /api/auth/login
router.post("/login", authLimiter, login);

// POST /api/auth/verify-email
router.post("/verify-email", emailVerificationLimiter, verifyEmail);

// POST /api/auth/verify-otp
router.post("/verify-otp", otpLimiter, verifyOTP);

// POST /api/auth/resend-otp
router.post("/resend-otp", otpLimiter, resendOTP);

// POST /api/auth/forgot-password
router.post("/forgot-password", passwordResetLimiter, forgotPassword);

// POST /api/auth/reset-password
router.post("/reset-password", passwordResetLimiter, resetPassword);

module.exports = router;
