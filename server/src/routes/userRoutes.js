const express = require("express");
const router = express.Router();

const {
  updateUserProfile,
  deleteUser,
  getPoliceOfficers,
  getForensicExperts,
  getAllUsers,
  getUserById,
} = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

// Get all users (admin only)
router.get("/", authenticate, authorizeRoles("admin"), getAllUsers);

// Update own profile
router.patch("/profile", authenticate, updateUserProfile);

// Get all police officers (admin only)
router.get("/officers", authenticate, authorizeRoles("admin"), getPoliceOfficers);

// Get all forensic experts (admin only)
router.get("/forensic-experts", authenticate, authorizeRoles("admin"), getForensicExperts);

// Get/Delete specific user profile (admin only for delete, others for view)
router.get("/:id", authenticate, authorizeRoles("admin", "police", "forensic"), getUserById);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteUser);

module.exports = router;
