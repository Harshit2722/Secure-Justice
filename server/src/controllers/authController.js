const User = require("../models/User"); // Adjust path based on your folder structure
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

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

  // 2. Check if the user already exists to prevent duplicate emails
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists.");
  }

  // 3. Hash the password
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Create and save the new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role,
  });

  await newUser.save();

  // 5. Return success response (never return the password, even hashed)
  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

/**
 * @desc    Authenticate user & get token
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

  // 3. Compare the provided password with the hashed password in the database
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials.");
  }

  // 4. Generate the JWT
  // Payload includes user ID and Role as requested
  const payload = {
    id: user._id,
    role: user.role,
  };

  // Sign the token using a secret key from environment variables
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  // 5. Send response with token
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

module.exports = {
  register,
  login,
};
