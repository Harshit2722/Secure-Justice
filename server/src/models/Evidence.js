const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
    fir: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FIR',
        required: true
    },
    file_url: {
        type: String,
        required: true
    },
    file_hash: {
        type: String,
        required: true
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    analyzed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    file_type: {
        type: String,
        enum: ['image', 'video', 'document'],
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Tampered'],
        default: 'Pending'
    },
    cloudinary_report_url: {
        type: String,
        default: null
    },
    forensic_report_url: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Evidence', evidenceSchema);