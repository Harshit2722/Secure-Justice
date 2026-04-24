const express = require("express");
const router = express.Router();

const {
  updateUserProfile,
  deleteUser,
  getPoliceOfficers,
} = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

// Update own profile
router.patch("/profile", authenticate, updateUserProfile);

// Delete any user profile (admin only)
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteUser);

// Get all police officers (admin only)
router.get("/officers", authenticate, authorizeRoles("admin"), getPoliceOfficers);

module.exports = router;
