const FIR = require("../models/FIR");
const mongoose = require("mongoose");

// ==============================
// CREATE FIR
// 🔒 TODO (Auth Integration):
// Replace fallback with ONLY req.user.id after JWT middleware
// Remove req.body.user_id completely
// ==============================
exports.createFIR = async (req, res) => {
  try {
    const { complaint_text, crime_type, location } = req.body;

    const user_id = req.user?.id || req.body.user_id;

    if (!user_id || !complaint_text || !crime_type || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Prevent duplicate FIR
    const existingFIR = await FIR.findOne({
      user_id,
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
      user_id,
      complaint_text,
      crime_type,
      location,
      status_history: [{ status: "Pending" }],
    });

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
      "user_id",
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
// 🔒 TODO (Auth Integration):
// Restrict access to 'police' role only
// ==============================
exports.getAllFIRs = async (req, res) => {
  try {
    const { status, crime_type, search, location, complaint_text } =
      req.query;

    let filter = {};

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
      .populate("user_id", "name email");

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
// 🔒 TODO (Auth Integration):
// Replace this route with req.user.id
// Citizens should only access their own FIRs
// ==============================
exports.getFIRsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const firs = await FIR.find({ user_id: userId });

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
      "user_id",
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
// 🔒 TODO (Auth Integration):
// Add ownership check → only FIR owner (citizen) can update
// Compare fir.user_id with req.user.id
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
    delete updates.user_id;

    const fir = await FIR.findById(id);

    if (!fir) {
      return res.status(404).json({
        success: false,
        message: "FIR not found",
      });
    }

    if (fir.status !== "Pending") {
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
// 🔒 TODO (Auth Integration):
// Restrict to 'police' role
// Add updated_by: req.user.id in status_history
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
      "Pending",
      "Verified",
      "Under Investigation",
      "Closed",
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
    fir.status_history.push({ status });

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