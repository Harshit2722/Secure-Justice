const express = require("express");
const router = express.Router();
const { register, login, verifyEmail, verifyOTP, resendOTP, forgotPassword, resetPassword } = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/verify-email
router.post("/verify-email", verifyEmail);

// POST /api/auth/verify-otp
router.post("/verify-otp", verifyOTP);

// POST /api/auth/resend-otp
router.post("/resend-otp", resendOTP);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

module.exports = router;
