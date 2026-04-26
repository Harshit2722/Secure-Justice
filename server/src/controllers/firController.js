const FIR = require("../models/FIR");
const mongoose = require("mongoose");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");
const Evidence = require("../models/Evidence");
const { createNotification, notifyAllAdmins } = require("../utils/notificationService");

const formatStatus = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ==============================
// CREATE FIR
// ==============================
exports.createFIR = asyncHandler(async (req, res) => {
  const { complaint_text, crime_type, location } = req.body;

  const citizen = req.user.id;

  if (!complaint_text || !crime_type || !location) {
    throw new ApiError(400, "All fields are required");
  }

  // Prevent duplicate FIR
  const existingFIR = await FIR.findOne({
    citizen,
    complaint_text: {
      $regex: `^${complaint_text.trim()}$`,
      $options: "i",
    },
    location: {
      $regex: `^${location.trim()}$`,
      $options: "i",
    },
    crime_type: {
      $regex: `^${crime_type}$`,
      $options: "i",
    },
  });

  if (existingFIR) {
    throw new ApiError(400, "Duplicate FIR detected");
  }

  // Generate FIR number
  const count = await FIR.countDocuments();
  const firNumber = `FIR-${new Date().getFullYear()}-${String(
    count + 1
  ).padStart(6, "0")}`;

  const fir = await FIR.create({
    fir_number: firNumber,
    citizen,
    complaint_text,
    crime_type,
    location,
    status_history: [{ status: "pending" }],
  });

  await fir.populate("citizen", "name email role");

  // Notify citizen — confirmation
  await createNotification({
    recipient: citizen,
    type: 'fir_filed',
    title: 'FIR Filed Successfully',
    message: `Your FIR ${fir.fir_number} has been filed successfully and is pending review.`,
    link: `/cases/${fir._id}`,
  });
  // Notify all admins — assign officers
  await notifyAllAdmins({
    type: 'fir_filed',
    title: 'New FIR Filed',
    message: `New FIR ${fir.fir_number} filed by ${fir.citizen.name} — assign a Police Officer and Forensic Expert.`,
    link: '/admin-assignments',
  });

  return res.status(201).json({
    success: true,
    message: "FIR filed successfully",
    data: fir,
  });
});

// ==============================
// GET FIR BY NUMBER
// ==============================
exports.getFIRByNumber = asyncHandler(async (req, res) => {
  const { firNumber } = req.params;

  const fir = await FIR.findOne({ fir_number: firNumber })
    .populate("citizen", "name email role")
    .populate("assigned_officer", "name email role")
    .populate("assigned_forensic", "name email role");

  if (!fir) {
    throw new ApiError(404, "FIR not found");
  }

  return res.status(200).json({
    success: true,
    data: fir,
  });
});

// ==============================
// GET ALL FIRs
// Role-based access: Citizens see only their FIRs, Police see all
// ==============================
exports.getAllFIRs = asyncHandler(async (req, res) => {
  const { status, crime_type, search, location, complaint_text, assigned_officer, assigned_forensic } = req.query;

  let filter = {};

  // Role-based access control
  if (req.user.role === "citizen") {
    filter.citizen = req.user.id;
  }
  // Police can view all FIRs (no role-based filter)

  if (assigned_officer === 'null') filter.assigned_officer = null;
  if (assigned_forensic === 'null') filter.assigned_forensic = null;

  if (status) {
    filter.status = {
      $regex: `^${status}$`,
      $options: "i",
    };
  }

  if (crime_type) {
    filter.crime_type = {
      $regex: `^${crime_type}$`,
      $options: "i",
    };
  }

  if (location) {
    filter.location = {
      $regex: location,
      $options: "i",
    };
  }

  if (complaint_text) {
    filter.complaint_text = {
      $regex: complaint_text,
      $options: "i",
    };
  }

  // Global search
  if (search) {
    filter.$or = [
      { complaint_text: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { crime_type: { $regex: search, $options: "i" } },
    ];
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const firs = await FIR.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("citizen", "name email")
    .populate("assigned_officer", "name email")
    .populate("assigned_forensic", "name email");

  const total = await FIR.countDocuments(filter);

  return res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data: firs,
  });
});

// ==============================
// GET POLICE STATS
// ==============================
exports.getPoliceStats = asyncHandler(async (req, res) => {
  const statusStats = await FIR.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const crimeTypeStats = await FIR.aggregate([
    { $group: { _id: "$crime_type", count: { $sum: 1 } } },
  ]);

  return res.status(200).json({
    success: true,
    data: {
      statusStats,
      crimeTypeStats,
    },
  });
});

// ==============================
// GET FIRs BY USER
// ==============================
exports.getFIRsByUser = asyncHandler(async (req, res) => {
  const citizen = req.user._id;

  const firs = await FIR.find({ citizen }).populate("citizen", "name email");

  return res.status(200).json({
    success: true,
    count: firs.length,
    data: firs,
  });
});

// ==============================
// GET FIR BY ID
// ==============================
exports.getFIRById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid FIR ID");
  }

  const fir = await FIR.findById(id)
    .populate("citizen", "name email role")
    .populate("assigned_officer", "name email role")
    .populate("assigned_forensic", "name email role");

  if (!fir) {
    throw new ApiError(404, "FIR not found");
  }

  return res.status(200).json({
    success: true,
    data: fir,
  });
});

// ==============================
// UPDATE FIR DETAILS
// ==============================
exports.updateFIR = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid FIR ID");
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new ApiError(400, "No update data provided");
  }

  delete updates.status;
  delete updates.citizen;

  const fir = await FIR.findById(id);

  if (!fir) {
    throw new ApiError(404, "FIR not found");
  }

  if (fir.citizen.toString() !== req.user.id) {
    throw new ApiError(403, "You can only update your own FIRs");
  }

  if (fir.status !== "pending") {
    throw new ApiError(400, "Cannot edit FIR after verification");
  }

  Object.assign(fir, updates);
  await fir.save();

  await fir.populate("citizen", "name email role");
  await fir.populate("assigned_officer", "name email role");
  await fir.populate("assigned_forensic", "name email role");

  return res.status(200).json({
    success: true,
    message: "FIR updated successfully",
    data: fir,
  });
});

// ==============================
// UPDATE FIR STATUS
// ==============================
exports.updateFIRStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid FIR ID");
  }

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const allowedStatuses = [
    "pending",
    "verified",
    "under_investigation",
    "closed",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const fir = await FIR.findById(id);

  if (!fir) {
    throw new ApiError(404, "FIR not found");
  }

  // RBAC Check: Only assigned officer or Admin can update status
  if (
    req.user.role === "police" &&
    fir.assigned_officer?.toString() !== req.user.id
  ) {
    throw new ApiError(
      403,
      "This case is not assigned to you. You cannot update its status."
    );
  }

  // Mandatory Assignment Check for Police
  if (req.user.role === "police") {
    if (!fir.assigned_officer || !fir.assigned_forensic) {
      throw new ApiError(
        400,
        "Procedural Guard: You cannot change the status of this FIR until both a Police Officer and a Forensic Expert have been formally assigned to the case."
      );
    }
  }

  if (status === "pending" && fir.status !== "pending") {
    throw new ApiError(
      400,
      "Illegal Operation: Cannot revert status back to 'pending' once it has been processed."
    );
  }

  if (
    fir.status === "under_investigation" &&
    status !== "closed" &&
    status !== "under_investigation"
  ) {
    throw new ApiError(
      400,
      "Procedural Error: Cases under investigation can only be transitioned to 'closed'."
    );
  }

  if (
    fir.status === "closed" &&
    status !== "under_investigation" &&
    status !== "closed"
  ) {
    throw new ApiError(
      400,
      "Procedural Error: Closed cases can only be reopened to 'under investigation'."
    );
  }

  // Final check: If closing the FIR, ensure ALL evidence has been analyzed
  if (status === "closed") {
    const unanalyzedEvidence = await Evidence.findOne({
      fir: id,
      status: "Pending",
    });

    if (unanalyzedEvidence) {
      throw new ApiError(
        400,
        "Cannot close FIR: There are evidence items awaiting forensic analysis. All digital evidence must be verified or marked as tampered before the case can be finalized."
      );
    }
  }

  fir.status = status;
  fir.status_history.push({ status, updated_by: req.user.id });

  await fir.save();

  await fir.populate("citizen", "name email role");
  await fir.populate("assigned_officer", "name email role");
  await fir.populate("assigned_forensic", "name email role");

  const statusLabel = formatStatus(status);
  // Notify citizen
  await createNotification({
    recipient: fir.citizen._id,
    type: 'status_changed',
    title: 'Case Status Updated',
    message: `Your FIR ${fir.fir_number} status has been updated to ${statusLabel}.`,
    link: `/cases/${fir._id}`,
  });
  // Notify assigned officer
  if (fir.assigned_officer) {
    await createNotification({
      recipient: fir.assigned_officer._id,
      type: 'status_changed',
      title: 'Case Status Updated',
      message: `Status of your assigned case ${fir.fir_number} has changed to ${statusLabel}.`,
      link: '/your-cases',
    });
  }
  // Notify assigned forensic expert
  if (fir.assigned_forensic) {
    await createNotification({
      recipient: fir.assigned_forensic._id,
      type: 'status_changed',
      title: 'Case Status Updated',
      message: `Status of your assigned case ${fir.fir_number} has changed to ${statusLabel}.`,
      link: '/forensic-your-cases',
    });
  }

  return res.status(200).json({
    success: true,
    message: "FIR status updated",
    data: fir,
  });
});

exports.assignOfficer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { officerId, officer_id } = req.body;
  const targetOfficerId = officerId || officer_id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid FIR ID");
  }

  if (!targetOfficerId) {
    throw new ApiError(400, "Officer ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(targetOfficerId)) {
    throw new ApiError(400, "Invalid Officer ID");
  }

  // Check if officer exists and has police role
  const officer = await User.findById(targetOfficerId);
  if (!officer) {
    throw new ApiError(404, "Officer not found");
  }

  if (officer.role !== "police") {
    throw new ApiError(400, "Only police officers can be assigned to FIR");
  }

  // Find and update FIR
  const fir = await FIR.findById(id).populate("citizen", "name email");
  if (!fir) {
    throw new ApiError(404, "FIR not found");
  }

  fir.assigned_officer = targetOfficerId;

  // Auto-verify if both are assigned and status is pending
  if (fir.assigned_forensic && fir.status === "pending") {
    fir.status = "verified";
    fir.status_history.push({ status: "verified", updated_by: req.user.id });
  }

  await fir.save();

  await fir.populate("citizen", "name email role");
  await fir.populate("assigned_officer", "name email role");
  await fir.populate("assigned_forensic", "name email role");

  // Notify citizen
  await createNotification({
    recipient: fir.citizen._id,
    type: 'officer_assigned',
    title: 'Officer Assigned to Your Case',
    message: `A Police Officer has been assigned to your FIR ${fir.fir_number}.`,
    link: `/cases/${fir._id}`,
  });
  // Notify the assigned officer
  await createNotification({
    recipient: targetOfficerId,
    type: 'officer_assigned',
    title: 'New Case Assigned to You',
    message: `You have been assigned to case ${fir.fir_number} (${fir.crime_type} at ${fir.location}). Begin investigation.`,
    link: '/your-cases',
  });

  return res.status(200).json({
    success: true,
    message: "Officer assigned successfully.",
    data: fir,
  });
});

// ==============================
// GET MY ASSIGNED CASES (Police Only)
// ==============================
exports.getMyAssignedFIRs = asyncHandler(async (req, res) => {
  const officerId = req.user.id;
  const { status, search } = req.query;

  if (req.user.role !== "police") {
    throw new ApiError(
      403,
      "Access Denied. Only police officers can access this."
    );
  }

  let filter = { assigned_officer: officerId };

  if (status) {
    filter.status = {
      $regex: `^${status}$`,
      $options: "i",
    };
  }

  if (search) {
    filter.$or = [
      { fir_number: { $regex: search, $options: "i" } },
      { complaint_text: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { crime_type: { $regex: search, $options: "i" } },
    ];
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const firs = await FIR.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("citizen", "name email role")
    .populate("assigned_officer", "name email role")
    .populate("assigned_forensic", "name email role");

  const total = await FIR.countDocuments(filter);

  return res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data: firs,
  });
});

// ==============================
// DELETE FIR
// ==============================
exports.deleteFIR = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid FIR ID");
  }

  const fir = await FIR.findByIdAndDelete(id);

  if (!fir) {
    throw new ApiError(404, "FIR not found");
  }

  return res.status(200).json({
    success: true,
    message: "FIR deleted successfully",
  });
});



// ==============================
// UPDATE FIR STATUS WITH NOTIFICATIONS
// ==============================
exports.updateFIRStatusWithNotification = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid FIR ID");
    }

    if (!status) {
      throw new ApiError(400, "Status is required");
    }

    const allowedStatuses = [
      "pending",
      "verified",
      "under_investigation",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    const fir = await FIR.findById(id)
      .populate("citizen", "name email")
      .populate("assigned_officer", "name email");

    if (!fir) {
      throw new ApiError(404, "FIR not found");
    }

    // Mandatory Assignment Check for Police
    if (req.user.role === "police") {
      if (!fir.assigned_officer || !fir.assigned_forensic) {
        throw new ApiError(
          400,
          "Procedural Guard: You cannot change the status of this FIR until both a Police Officer and a Forensic Expert have been formally assigned to the case."
        );
      }
    }

    // Final check: If closing the FIR, ensure ALL evidence has been analyzed
    if (status === "closed") {
      const unanalyzedEvidence = await Evidence.findOne({
        fir: id,
        status: "Pending",
      });

      if (unanalyzedEvidence) {
        throw new ApiError(
          400,
          "Cannot close FIR: There are evidence items awaiting forensic analysis. All digital evidence must be verified or marked as tampered before the case can be finalized."
        );
      }
    }

    const oldStatus = fir.status;
    fir.status = status;
    fir.status_history.push({
      status,
      updated_by: req.user.id,
      notes: notes || "",
    });

    await fir.save();

    await fir.populate("citizen", "name email role");
    await fir.populate("assigned_officer", "name email role");
    await fir.populate("assigned_forensic", "name email role");

    const statusLabel = formatStatus(status);
    await createNotification({
      recipient: fir.citizen._id,
      type: 'status_changed',
      title: 'Case Status Updated',
      message: `Your FIR ${fir.fir_number} status has been updated to ${statusLabel}.`,
      link: `/cases/${fir._id}`,
    });
    if (fir.assigned_officer) {
      await createNotification({
        recipient: fir.assigned_officer._id,
        type: 'status_changed',
        title: 'Case Status Updated',
        message: `Status of your assigned case ${fir.fir_number} has changed to ${statusLabel}.`,
        link: '/your-cases',
      });
    }
    if (fir.assigned_forensic) {
      await createNotification({
        recipient: fir.assigned_forensic._id,
        type: 'status_changed',
        title: 'Case Status Updated',
        message: `Status of your assigned case ${fir.fir_number} has changed to ${statusLabel}.`,
        link: '/forensic-your-cases',
      });
    }

    return res.status(200).json({
      success: true,
      message: "FIR status updated successfully.",
      data: fir,
    });
  }
);

// ==============================
// ASSIGN FORENSIC EXPERT (Admin Only)
// ==============================
exports.assignForensic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { forensicId } = req.body;

  if (req.user.role !== "admin") {
    throw new ApiError(
      403,
      "Access Denied. Only admins can assign forensic experts."
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(forensicId)
  ) {
    throw new ApiError(400, "Invalid ID");
  }

  const fir = await FIR.findById(id);
  if (!fir) {
    throw new ApiError(404, "FIR not found");
  }

  const forensicExpert = await User.findById(forensicId);
  if (!forensicExpert || forensicExpert.role !== "forensic") {
    throw new ApiError(400, "User is not a valid forensic expert");
  }

  fir.assigned_forensic = forensicId;

  // Auto-verify if both are assigned and status is pending
  if (fir.assigned_officer && fir.status === "pending") {
    fir.status = "verified";
    fir.status_history.push({ status: "verified", updated_by: req.user.id });
  }

  await fir.save();

  await fir.populate("citizen", "name email role");
  await fir.populate("assigned_officer", "name email role");
  await fir.populate("assigned_forensic", "name email role");

  // Notify citizen
  await createNotification({
    recipient: fir.citizen._id,
    type: 'forensic_assigned',
    title: 'Forensic Expert Assigned',
    message: `A Forensic Expert has been assigned to your FIR ${fir.fir_number}.`,
    link: `/cases/${fir._id}`,
  });
  // Notify the forensic expert
  await createNotification({
    recipient: forensicId,
    type: 'forensic_assigned',
    title: 'New Case Assigned to You',
    message: `You have been assigned as Forensic Expert on case ${fir.fir_number}. Await evidence for analysis.`,
    link: '/forensic-your-cases',
  });

  return res.status(200).json({
    success: true,
    message: "Forensic expert assigned successfully",
    data: fir,
  });
});

// ==============================
// GET MY ASSIGNED FORENSIC CASES (Forensic Only)
// ==============================
exports.getMyAssignedForensicFIRs = asyncHandler(async (req, res) => {
  const forensicId = req.user.id;
  const { status, search } = req.query;

  if (req.user.role !== "forensic") {
    throw new ApiError(
      403,
      "Access Denied. Only forensic experts can access this."
    );
  }

  let filter = { assigned_forensic: forensicId };

  if (status) {
    filter.status = {
      $regex: `^${status}$`,
      $options: "i",
    };
  }

  if (search) {
    filter.$or = [
      { fir_number: { $regex: search, $options: "i" } },
      { complaint_text: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { crime_type: { $regex: search, $options: "i" } },
    ];
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const firs = await FIR.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("citizen", "name email")
    .populate("assigned_officer", "name email")
    .populate("assigned_forensic", "name email");

  const total = await FIR.countDocuments(filter);

  return res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data: firs,
  });
});

// ==============================
// GET ADMIN STATS
// ==============================
exports.getAdminStats = asyncHandler(async (req, res) => {
  // FIR Status Stats
  const statusStats = await FIR.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Crime Type Stats
  const crimeTypeStats = await FIR.aggregate([
    { $group: { _id: "$crime_type", count: { $sum: 1 } } },
  ]);

  // User Counts by Role
  const userRoleStats = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  // Monthly FIR Trends (Last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrends = await FIR.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Evidence Integrity Stats
  const evidenceStats = await Evidence.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return res.status(200).json({
    success: true,
    data: {
      statusStats,
      crimeTypeStats,
      userRoleStats,
      monthlyTrends,
      evidenceStats,
    },
  });
});