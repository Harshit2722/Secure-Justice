const express = require("express");
const router = express.Router();

const {
  createFIR,
  getAllFIRs,
  getFIRsByUser,
  updateFIRStatus,
  getFIRById,
  updateFIR,
  deleteFIR,
  getFIRByNumber,
} = require("../controllers/firController");

// 🔒 TODO: import auth middleware after integration
// const { protect, authorize } = require("../middleware/authMiddleware");

// ==============================
// FIR ROUTES
// ==============================

// Create FIR → logged-in citizen
// TODO: add protect (use req.user.id instead of user_id from body)
router.post("/", createFIR);

// Get all FIRs → police dashboard
// TODO: restrict to 'police'
router.get("/", getAllFIRs);

// Get FIRs by user
// TODO: replace :userId with req.user.id (citizen access only)
router.get("/user/:userId", getFIRsByUser);

// Get FIR by number (keep before /:id)
router.get("/number/:firNumber", getFIRByNumber);

// Get FIR by ID
router.get("/:id", getFIRById);

// Update FIR → only owner (citizen) and only if Pending
// TODO: add protect + ownership check
router.patch("/:id", updateFIR);

// Update FIR status → police only
// TODO: restrict to 'police'
router.patch("/:id/status", updateFIRStatus);

// Delete FIR → admin only
// TODO: restrict to 'admin'
router.delete("/:id", deleteFIR);

module.exports = router;