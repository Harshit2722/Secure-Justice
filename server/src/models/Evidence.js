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
    file_type: {
        type: String,
        enum: ['image', 'video', 'document'],
        required: true
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Evidence', evidenceSchema);