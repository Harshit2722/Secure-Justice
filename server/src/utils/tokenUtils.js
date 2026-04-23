const crypto = require('crypto');
const otpGenerator = require('otp-generator');

const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const generateOTP = () => {
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
    });
};

module.exports = { generateVerificationToken, generateOTP };