const mongoose = require("mongoose");

const firSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fir_number: {
      type: String,
      unique: true,
    },

    complaint_text: {
      type: String,
      required: true,
      trim: true,
    },

    crime_type: {
      type: String,
      enum: ["theft", "cybercrime", "fraud", "violence", "other"],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "under_investigation", "closed"],
      default: "pending",
    },

    assigned_officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

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

firSchema.index({ citizen: 1 });
firSchema.index({ status: 1 });
firSchema.index({ crime_type: 1 });

module.exports = mongoose.model("FIR", firSchema);