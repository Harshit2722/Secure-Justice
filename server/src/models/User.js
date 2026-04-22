const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['citizen', 'police', 'forensic', 'lawyer', 'victim', 'court', 'admin'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    verificationTokenExpiry: {
        type: Date
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpiry: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);