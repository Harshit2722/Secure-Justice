const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    throw new ApiError(401, "Authentication token is missing.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired authentication token.");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    throw new ApiError(401, "Authenticated user not found.");
  }

  req.user = user;
  next();
});

const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You do not have permission to access this resource.",
      );
    }

    next();
  };

module.exports = {
  authenticate,
  authorizeRoles,
};
