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
  getPoliceStats,
  assignOfficer,
  getMyAssignedFIRs,
  updateFIRStatusWithNotification,
} = require("../controllers/firController");

const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

// ==============================
// FIR ROUTES
// ==============================

// Police Stats → dashboard
router.get("/stats", authenticate, authorizeRoles("police"), getPoliceStats);

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

// Get cases assigned to current officer
router.get("/assigned/me", authenticate, authorizeRoles("police"), getMyAssignedFIRs);

// Assign officer to case → admin only
router.patch("/:id/assign", authenticate, authorizeRoles("admin"), assignOfficer);
// Update FIR status with notifications → police only
router.patch("/:id/status-update", authenticate, authorizeRoles("police"), updateFIRStatusWithNotification);

// Assign officer to FIR → police/admin only
router.patch("/:id/assign-officer", authenticate, authorizeRoles("police", "admin"), assignOfficer);

// Delete FIR → admin only
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteFIR);

module.exports = router;