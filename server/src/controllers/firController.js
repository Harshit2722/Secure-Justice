const FIR = require("../models/FIR");
const mongoose = require("mongoose");
const { sendEmail } = require("../utils/emailService");
const User = require("../models/User");
const emailTemplates = require("../utils/emailTemplates");

// ==============================
// CREATE FIR
// ==============================
exports.createFIR = async (req, res) => {
  try {
    const { complaint_text, crime_type, location } = req.body;

    const citizen = req.user.id;

    if (!complaint_text || !crime_type || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
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
      return res.status(400).json({
        success: false,
        message: "Duplicate FIR detected",
      });
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

    // Send notification email to the citizen
    const user = await User.findById(citizen);
    if (user && user.email) {
      const html = emailTemplates.firRegistrationEmail(user.name, firNumber, complaint_text, crime_type, location);
      await sendEmail(user.email, 'FIR Registered - Secure Justice', html);
    }

    return res.status(201).json({
      success: true,
      message: "FIR filed successfully",
      data: fir,
    });
  } catch (error) {
    console.error("Create FIR Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// GET FIR BY NUMBER
// ==============================
exports.getFIRByNumber = async (req, res) => {
  try {
    const { firNumber } = req.params;

    const fir = await FIR.findOne({ fir_number: firNumber }).populate(
      "citizen",
      "name email role"
    );

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: fir,
    });
  } catch (error) {
    console.error("Get FIR By Number Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// GET ALL FIRs
// Role-based access: Citizens see only their FIRs, Police see all
// ==============================
exports.getAllFIRs = async (req, res) => {
  try {
    const { status, crime_type, search, location, complaint_text } =
      req.query;

    let filter = {};

    // Role-based access control
    if (req.user.role === "citizen") {
      filter.citizen = req.user.id;
    }
    // Police can view all FIRs (no role-based filter)

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
      .populate("citizen", "name email");

    const total = await FIR.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: firs,
    });
  } catch (error) {
    console.error("Get All FIRs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// GET FIRs BY USER
// ==============================
exports.getFIRsByUser = async (req, res) => {
  try {
    const citizen = req.user.id;

    const firs = await FIR.find({ citizen });

    return res.status(200).json({
      success: true,
      count: firs.length,
      data: firs,
    });
  } catch (error) {
    console.error("Get FIRs By User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// GET FIR BY ID
// ==============================
exports.getFIRById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID",
      });
    }

    const fir = await FIR.findById(id).populate(
      "citizen",
      "name email role"
    );

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: fir,
    });
  } catch (error) {
    console.error("Get FIR By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// UPDATE FIR DETAILS
// ==============================
exports.updateFIR = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID",
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    delete updates.status;
    delete updates.citizen;

    const fir = await FIR.findById(id);

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    if (fir.citizen.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own FIRs",
      });
    }

    if (fir.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit FIR after verification",
      });
    }

    Object.assign(fir, updates);
    await fir.save();

    return res.status(200).json({
      success: true,
      message: "FIR updated successfully",
      data: fir,
    });
  } catch (error) {
    console.error("Update FIR Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// UPDATE FIR STATUS
// ==============================
exports.updateFIRStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "pending",
      "verified",
      "under_investigation",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const fir = await FIR.findById(id);

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    fir.status = status;
    fir.status_history.push({ status, updated_by: req.user.id });

    await fir.save();

    return res.status(200).json({
      success: true,
      message: "FIR status updated",
      data: fir,
    });
  } catch (error) {
    console.error("Update FIR Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// DELETE FIR
// 🔒 TODO (Auth Integration):
// Restrict to 'admin' role only
// ==============================
exports.deleteFIR = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID",
      });
    }

    const fir = await FIR.findByIdAndDelete(id);

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FIR deleted successfully",
    });
  } catch (error) {
    console.error("Delete FIR Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// ASSIGN OFFICER TO FIR
// ==============================
exports.assignOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { officer_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID",
      });
    }

    if (!officer_id) {
      return res.status(400).json({
        success: false,
        message: "Officer ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(officer_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Officer ID",
      });
    }

    // Check if officer exists and has police role
    const officer = await User.findById(officer_id);
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }

    if (officer.role !== "police") {
      return res.status(400).json({
        success: false,
        message: "Only police officers can be assigned to FIR",
      });
    }

    // Find and update FIR
    const fir = await FIR.findById(id).populate("citizen", "name email");
    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    fir.assigned_officer = officer_id;
    await fir.save();

    // Send notification email to citizen
    if (fir.citizen && fir.citizen.email) {
      const html = `
        <h1>FIR Officer Assignment</h1>
        <p>Hi ${fir.citizen.name},</p>
        <p>An officer has been assigned to your FIR.</p>
        <p><strong>FIR Number:</strong> ${fir.fir_number}</p>
        <p><strong>Assigned Officer:</strong> ${officer.name}</p>
        <p>The officer will be in contact with you soon.</p>
      `;
      await sendEmail(fir.citizen.email, 'Officer Assigned to Your FIR - Secure Justice', html);
    }

    // Send notification email to officer
    if (officer && officer.email) {
      const html = emailTemplates.officerAssignmentEmail(officer.name, fir.fir_number, fir.crime_type, fir.location, fir.complaint_text);
      await sendEmail(officer.email, 'New FIR Assignment - Secure Justice', html);
    }

    return res.status(200).json({
      success: true,
      message: "Officer assigned successfully. Notifications sent.",
      data: fir,
    });
  } catch (error) {
    console.error("Assign Officer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// UPDATE FIR STATUS WITH NOTIFICATIONS
// ==============================
exports.updateFIRStatusWithNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FIR ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "pending",
      "verified",
      "under_investigation",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const fir = await FIR.findById(id).populate("citizen", "name email").populate("assigned_officer", "name email");

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    const oldStatus = fir.status;
    fir.status = status;
    fir.status_history.push({ 
      status, 
      updated_by: req.user.id,
      notes: notes || ""
    });

    await fir.save();

    // Send notification email to citizen
    if (fir.citizen && fir.citizen.email) {
      const html = emailTemplates.statusUpdateEmail(fir.citizen.name, fir.fir_number, oldStatus, status, notes);
      await sendEmail(fir.citizen.email, `FIR Status Updated to ${status} - Secure Justice`, html);
    }

    // Send notification email to assigned officer if status changes
    if (fir.assigned_officer && fir.assigned_officer.email && oldStatus !== status) {
      const html = emailTemplates.statusUpdateEmail(fir.assigned_officer.name, fir.fir_number, oldStatus, status, notes);
      await sendEmail(fir.assigned_officer.email, `FIR Status Updated to ${status} - Secure Justice`, html);
    }

    return res.status(200).json({
      success: true,
      message: "FIR status updated and notifications sent",
      data: fir,
    });
  } catch (error) {
    console.error("Update FIR Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};