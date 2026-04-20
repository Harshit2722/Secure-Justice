const mongoose = require("mongoose");

const firSchema = new mongoose.Schema(
  {
    user_id: {
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
      enum: ["Theft", "Cybercrime", "Fraud", "Violence", "Other"],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Current status
    status: {
      type: String,
      enum: ["Pending", "Verified", "Under Investigation", "Closed"],
      default: "Pending",
    },
    

    // Status history (audit trail)
    status_history: [
      {
        status: {
          type: String,
          enum: ["Pending", "Verified", "Under Investigation", "Closed"],
        },
        updated_at: {
          type: Date,
          default: Date.now,
        },
        // TODO: Add updated_by (user reference) after auth integration
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🔥 Indexes for performance
firSchema.index({ user_id: 1 });
firSchema.index({ status: 1 });
firSchema.index({ crime_type: 1 });

module.exports = mongoose.model("FIR", firSchema);