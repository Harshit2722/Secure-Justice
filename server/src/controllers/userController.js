const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
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

  // For SecureJustice, we require the current password for ANY profile update (name or password)
  if (!oldPassword) {
    throw new ApiError(400, "Current password is required to save changes.");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Current password incorrect.");
  }

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  
  if (password) {
    if (!oldPassword) {
      throw new ApiError(400, "Old password is required to change your password.");
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
