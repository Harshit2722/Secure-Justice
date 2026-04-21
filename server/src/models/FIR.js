const mongoose = require("mongoose");

const firSchema = new mongoose.Schema(
  {
    // 👤 Citizen who filed FIR
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🆔 FIR Number (unique identifier)
    fir_number: {
      type: String,
      unique: true,
    },

    // 📝 Complaint
    complaint_text: {
      type: String,
      required: true,
      trim: true,
    },

    // 🚨 Crime Type
    crime_type: {
      type: String,
      enum: ["theft", "cybercrime", "fraud", "violence", "other"],
      required: true,
    },

    // 📍 Location
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // 📌 Current Status
    status: {
      type: String,
      enum: ["pending", "verified", "under_investigation", "closed"],
      default: "pending",
    },

    // 👮 Assigned Officer
    assigned_officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 📜 Status History (Audit Trail)
    status_history: [
      {
        status: {
          type: String,
          enum: ["pending", "verified", "under_investigation", "closed"],
        },
        updated_at: {
          type: Date,
          default: Date.now,
        },
        updated_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ⚡ Indexes (important for scaling)
firSchema.index({ citizen: 1 });
firSchema.index({ status: 1 });
firSchema.index({ crime_type: 1 });

module.exports = mongoose.model("FIR", firSchema);