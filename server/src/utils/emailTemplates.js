/**
 * Email template helper functions
 */

const emailTemplates = {
  verificationEmail: (name, verificationLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 10px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SecureJustice</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for registering with SecureJustice. To complete your registration, please verify your email address.</p>
          <p style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email</a>
          </p>
          <p><strong>Note:</strong> This link will expire in 24 hours.</p>
          <p>If you didn't register, please ignore this email or contact support.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 SecureJustice. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  otpEmail: (name, otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .otp-box { background-color: #e8f4f8; padding: 20px; text-align: center; border-radius: 5px; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #3498db; }
        .footer { text-align: center; padding: 10px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SecureJustice Login</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your login OTP is:</p>
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
          </div>
          <p><strong>Important:</strong> This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore or contact support immediately.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 SecureJustice. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordResetOtpEmail: (name, otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .otp-box { background-color: #e8f4f8; padding: 20px; text-align: center; border-radius: 5px; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #e74c3c; }
        .footer { text-align: center; padding: 10px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset - SecureJustice</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your password reset OTP is:</p>
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
          </div>
          <p><strong>Important:</strong> This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore or contact support immediately.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 SecureJustice. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  firRegistrationEmail: (name, firNumber, complaint, crimeType, location) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .details { background-color: white; padding: 15px; border-left: 4px solid #3498db; }
        .detail-row { margin: 10px 0; }
        .detail-label { font-weight: bold; color: #2c3e50; }
        .footer { text-align: center; padding: 10px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FIR Registration Confirmation</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your FIR has been successfully registered with SecureJustice. Here are the details:</p>
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">FIR Number:</span> ${firNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Crime Type:</span> ${crimeType}
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span> ${location}
            </div>
            <div class="detail-row">
              <span class="detail-label">Complaint:</span> ${complaint}
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span> Pending Review
            </div>
          </div>
          <p>You will receive updates on your FIR status via email. An officer will be assigned soon.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 SecureJustice. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  officerAssignmentEmail: (name, firNumber, crimeType, location, complaint) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .details { background-color: white; padding: 15px; border-left: 4px solid #27ae60; }
        .detail-row { margin: 10px 0; }
        .detail-label { font-weight: bold; color: #2c3e50; }
        .footer { text-align: center; padding: 10px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New FIR Assignment</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>You have been assigned a new FIR case. Please review and take appropriate action:</p>
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">FIR Number:</span> ${firNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Crime Type:</span> ${crimeType}
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span> ${location}
            </div>
            <div class="detail-row">
              <span class="detail-label">Complaint Description:</span> ${complaint}
            </div>
          </div>
          <p>Please contact the complainant and begin investigation as per protocol.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 SecureJustice. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  statusUpdateEmail: (name, firNumber, oldStatus, newStatus, notes) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .status-box { background-color: white; padding: 15px; border-left: 4px solid #f39c12; }
        .status-row { margin: 10px 0; }
        .status-label { font-weight: bold; color: #2c3e50; }
        .footer { text-align: center; padding: 10px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FIR Status Update</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your FIR status has been updated. Here are the details:</p>
          <div class="status-box">
            <div class="status-row">
              <span class="status-label">FIR Number:</span> ${firNumber}
            </div>
            <div class="status-row">
              <span class="status-label">Previous Status:</span> ${oldStatus}
            </div>
            <div class="status-row">
              <span class="status-label">New Status:</span> ${newStatus}
            </div>
            ${notes ? `<div class="status-row">
              <span class="status-label">Update Notes:</span> ${notes}
            </div>` : ''}
          </div>
          <p>Thank you for your cooperation.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 SecureJustice. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

module.exports = emailTemplates;