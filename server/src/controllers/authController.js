const User = require("../models/User"); // Adjust path based on your folder structure
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const { sendEmail } = require("../utils/emailService");
const { generateVerificationToken, generateOTP } = require("../utils/tokenUtils");
const { validateName } = require("../utils/validationUtils");
const emailTemplates = require("../utils/emailTemplates");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Validate required fields
  if (!name || !email || !password || !role) {
    throw new ApiError(
      400,
      "Please provide all required fields: name, email, password, and role.",
    );
  }

  // 2. Validate name
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    throw new ApiError(400, nameValidation.message);
  }

  // 3. Check if the user already exists to prevent duplicate emails
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists.");
  }

  // 6. Hash the password
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 7. Generate verification token
  const verificationToken = generateVerificationToken();
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // 8. Create and save the new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role,
    verificationToken,
    verificationTokenExpiry,
  });

  await newUser.save();

  // 9. Send verification email
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const html = emailTemplates.verificationEmail(newUser.name, verificationLink);
  await sendEmail(email, 'Verify Your Email - Secure Justice', html);

  // 10. Return success response
  res.status(201).json({
    success: true,
    message: "User registered successfully. Please check your email to verify your account.",
    data: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

/**
 * @desc    Authenticate user & send OTP
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password.");
  }

  // 2. Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials.");
  }

  // 4. Check if user is verified
  if (!user.isVerified) {
    throw new ApiError(401, "Please verify your email before logging in.");
  }

  // 5. Compare the provided password with the hashed password in the database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials.");
  }

  // 6. Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // 7. Save OTP to user
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // 8. Send OTP email
  const html = emailTemplates.otpEmail(user.name, otp);
  await sendEmail(email, 'Your Login OTP - Secure Justice', html);

  // 9. Send response
  res.status(200).json({
    success: true,
    message: "OTP sent to your email. Please verify to complete login.",
    data: {
      email: user.email,
    },
  });
});

/**
 * @desc    Verify email
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Verification token is required.");
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token.");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now log in.",
  });
});

/**
 * @desc    Verify OTP and login
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  if (!user.otp || user.otp !== otp || user.otpExpiry < new Date()) {
    throw new ApiError(401, "Invalid or expired OTP.");
  }

  // Clear OTP
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Generate JWT
  const payload = {
    id: user._id,
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (!user.isVerified) {
    throw new ApiError(400, "Please verify your email first.");
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  const html = emailTemplates.otpEmail(user.name, otp);
  await sendEmail(email, 'Your Login OTP - Secure Justice', html);

  res.status(200).json({
    success: true,
    message: "OTP resent to your email.",
  });
});
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.resetOtp = otp;
  user.resetOtpExpiry = otpExpiry;
  await user.save();

  const html = emailTemplates.passwordResetOtpEmail(user.name, otp);
  await sendEmail(email, 'Password Reset OTP - Secure Justice', html);

  res.status(200).json({
    success: true,
    message: "Password reset OTP sent to your email.",
  });
});

/**
 * @desc    Reset Password with OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP and new password are required.");
  }

  const user = await User.findOne({
    email,
    resetOtp: otp,
    resetOtpExpiry: { $gt: new Date() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  user.password = hashedPassword;
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully.",
  });
});

module.exports = {
  register,
  login,
  verifyEmail,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
};
