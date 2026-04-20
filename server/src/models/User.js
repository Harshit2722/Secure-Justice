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
        enum: ['citizen', 'police', 'forensic', 'lawyer', 'victim', 'defendant', 'court', 'admin'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);