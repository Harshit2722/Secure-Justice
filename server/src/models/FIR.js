const mongoose = require('mongoose');

const firSchema = new mongoose.Schema({
    citizen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    complaint_text: {
        type: String,
        required: true
    },
    crime_type: {
        type: String,
        enum: ['theft', 'cybercrime', 'fraud', 'violence', 'other'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'investigating', 'closed'],
        default: 'pending'
    },
    assigned_officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('FIR', firSchema);