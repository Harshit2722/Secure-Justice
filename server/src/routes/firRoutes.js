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

const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

// ==============================
// FIR ROUTES
// ==============================

// Create FIR → logged-in citizen
router.post("/", authenticate, authorizeRoles("citizen"), createFIR);

// Get all FIRs → police dashboard
router.get("/", authenticate, authorizeRoles("police","citizen"), getAllFIRs);

// Get FIRs by user → citizen's own FIRs
router.get("/my-firs", authenticate, authorizeRoles("citizen"), getFIRsByUser);

// Get FIR by number (public? or authenticated?)
router.get("/number/:firNumber", getFIRByNumber);

// Get FIR by ID
router.get("/:id", authenticate, getFIRById);

// Update FIR → only owner (citizen) and only if Pending
router.patch("/:id", authenticate, authorizeRoles("citizen"), updateFIR);

// Update FIR status → police only
router.patch("/:id/status", authenticate, authorizeRoles("police"), updateFIRStatus);

// Delete FIR → admin only
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteFIR);

module.exports = router;