const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const FIR = require("../models/FIR");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, password, oldPassword } = req.body;
  const userId = req.user.id;

  if (!name && !email && !password) {
    throw new ApiError(400, "No profile fields provided for update.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // If oldPassword is provided, verify it (needed for password change)
  if (oldPassword) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Current password incorrect.");
    }
  }

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  
  if (password) {
    // If updating password, oldPassword MUST have been provided and verified above
    if (!oldPassword) {
      throw new ApiError(400, "Current password is required to set a new password.");
    }

    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(password, salt);
  }

  if (email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ApiError(400, "Email is already in use by another account.");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: updatedUser,
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    throw new ApiError(404, "User not found.");
  }

  res.status(200).json({
    success: true,
    message: "User profile deleted successfully.",
  });
});
exports.getPoliceOfficers = asyncHandler(async (req, res) => {
  const officers = await User.find({ role: 'police' }).select("name email role");
  res.status(200).json({
    success: true,
    data: officers
  });
});

exports.getForensicExperts = asyncHandler(async (req, res) => {
  const experts = await User.find({ role: 'forensic' }).select("name email role");
  res.status(200).json({
    success: true,
    data: experts
  });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  let query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query).select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Fetch associated FIRs based on role
  let firs = [];
  if (user.role === 'citizen') {
    firs = await FIR.find({ citizen: id }).sort({ createdAt: -1 });
  } else if (user.role === 'police') {
    firs = await FIR.find({ assigned_officer: id }).sort({ createdAt: -1 });
  } else if (user.role === 'forensic') {
    firs = await FIR.find({ assigned_forensic: id }).sort({ createdAt: -1 });
  }

  res.status(200).json({
    success: true,
    data: {
      ...user._doc,
      firs
    }
  });
});
