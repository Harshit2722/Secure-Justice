# Secure Justice - Email & Validation System Documentation

## Overview
This document outlines all the email notification and validation features implemented in the Secure Justice system.

---

## 1. Authentication Features

### 1.1 Email & Password Validation

#### Email Validation
- **Format Check**: Validates email format using regex pattern
- **Unique Check**: Ensures no duplicate emails in the system
- **Error Message**: Clear feedback on invalid emails

#### Password Validation
Requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

Example Valid Password: `SecurePass123!`

#### Name Validation
- Minimum 2 characters
- Maximum 100 characters
- Prevents empty or invalid names

### 1.2 Registration Flow
```
1. User submits registration form
2. System validates all fields
3. Check if email already exists
4. Hash password with bcrypt
5. Generate verification token
6. Create user with isVerified = false
7. Send verification email
8. User receives email with verification link
```

**Verification Email Features:**
- Professional HTML template with branding
- Clickable verification link
- 24-hour expiration time
- Clear call-to-action button

### 1.3 Email Verification
```
POST /api/auth/verify-email
Body: { token: "verification_token" }
```
- Marks user as verified
- Allows user to proceed to login
- Clear error messages for expired tokens

### 1.4 Login with OTP
```
1. User enters email and password
2. System validates credentials
3. Generate 6-digit OTP
4. Send OTP via email
5. OTP expires in 10 minutes
6. User enters OTP
7. System validates OTP
8. Issue JWT token for authenticated session
```

**OTP Email Features:**
- Large, easy-to-read OTP display
- Time remaining information
- Security reminder

### 1.5 OTP Management
```
POST /api/auth/login
Body: { email, password }
Response: { message: "OTP sent to your email" }

POST /api/auth/verify-otp
Body: { email, otp }
Response: { token, user_data }

POST /api/auth/resend-otp
Body: { email }
Response: { message: "OTP resent to your email" }
```

### 1.6 Password Reset
```
1. User requests password reset
2. System generates reset token
3. Send reset link via email (1-hour expiry)
4. User clicks link and enters new password
5. New password must pass validation
6. Password updated securely
7. Confirmation email sent
```

---

## 2. FIR Management Features

### 2.1 FIR Registration Email
When a user files an FIR, they receive an email containing:
- FIR Number (auto-generated)
- Crime Type
- Location
- Complaint Details
- Initial Status (Pending Review)

**Email Template:**
- Professional HTML formatting
- All relevant case information
- Assurance of officer assignment

### 2.2 Officer Assignment with Notifications

#### API Endpoint
```
PATCH /api/fir/:id/assign-officer
Body: { officer_id: "officer_id" }
Authorization: Police or Admin
```

#### Process
1. Validate officer exists and has police role
2. Assign officer to FIR
3. Send email to citizen with officer details
4. Send email to officer with FIR details

#### Citizen Receives
- Officer assigned notification
- Can identify their case handler

#### Officer Receives
- Crime type and severity
- Complainant information
- Location and complaint details
- Action required

### 2.3 Status Update Notifications

#### API Endpoint
```
PATCH /api/fir/:id/status-update
Body: { 
  status: "verified|under_investigation|closed",
  notes: "Optional update notes"
}
Authorization: Police
```

#### Status Workflow
- **Pending** → Initial state when FIR filed
- **Verified** → Investigation approved
- **Under Investigation** → Active investigation
- **Closed** → Case resolution

#### Notifications Sent To
- **Citizen**: Status change with updates
- **Assigned Officer**: Case status changes
- **Both**: Receive detailed information and next steps

#### Email Content
- Previous status and new status
- Optional notes from the officer
- Case number for reference
- Professional formatting

---

## 3. Rate Limiting & Security

### 3.1 Rate Limits Applied

#### Authentication Endpoints
- **Register/Login**: 5 requests per 15 minutes
- **OTP Verification**: 3 requests per 10 minutes
- **Email Verification**: 5 requests per hour
- **Password Reset**: 3 requests per hour

### 3.2 Security Features
- Passwords are hashed with bcrypt (10 salt rounds)
- Tokens expire after set timeframes
- One-time use OTP
- Rate limiting prevents brute force attacks
- Email validation prevents spam

---

## 4. Email Templates & Styling

All emails include:
- Professional company branding
- Consistent styling
- Clear call-to-action buttons
- Security disclaimers
- Footer with copyright

### Template Types

1. **Verification Email**
   - Welcome message
   - Verification button
   - Expiration information

2. **OTP Email**
   - Large OTP display
   - Time information
   - Security note

3. **Password Reset Email**
   - Reset button
   - Expiration time
   - Security warning

4. **FIR Registration Email**
   - Case details
   - FIR number
   - Status information

5. **Officer Assignment Email**
   - For citizen: Officer details
   - For officer: Case information

6. **Status Update Email**
   - Old and new status
   - Optional notes
   - Case reference

---

## 5. Implementation Details

### File Structure
```
server/
├── src/
│   ├── utils/
│   │   ├── emailService.js          # Email sending logic
│   │   ├── emailTemplates.js        # HTML email templates
│   │   ├── tokenUtils.js            # Token/OTP generation
│   │   ├── validationUtils.js       # Email/password validation
│   ├── middleware/
│   │   ├── rateLimiter.js           # Rate limiting rules
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── firController.js         # FIR management
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── firRoutes.js             # FIR endpoints
```

### Dependencies
- `nodemailer`: Email sending
- `otp-generator`: OTP generation
- `express-rate-limit`: Rate limiting
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT tokens

---

## 6. Database Schema Updates

### User Model
Added fields:
- `isVerified`: Boolean (email verification status)
- `verificationToken`: String (for email verification)
- `verificationTokenExpiry`: Date
- `otp`: String (6-digit code)
- `otpExpiry`: Date
- `resetPasswordToken`: String
- `resetPasswordExpiry`: Date

### FIR Model
Existing fields used:
- `assigned_officer`: Reference to User (Police officer)
- `status`: Current FIR status
- `status_history`: Array of status changes with timestamps

---

## 7. Environment Variables Required

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://...

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Server Port
PORT=5001
```

---

## 8. API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with OTP |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/verify-otp` | Verify OTP token |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### FIR Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fir` | Create FIR |
| PATCH | `/api/fir/:id/assign-officer` | Assign officer |
| PATCH | `/api/fir/:id/status-update` | Update status with notifications |
| PATCH | `/api/fir/:id/status` | Update status (without notifications) |

---

## 9. Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Password must contain at least one uppercase letter."
}
```

### Rate Limit Errors
```json
{
  "success": false,
  "message": "Too many attempts. Please try again after 15 minutes."
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Invalid credentials."
}
```

---

## 10. Testing Checklist

- [ ] User registration with invalid email
- [ ] User registration with weak password
- [ ] Email verification link expires
- [ ] OTP sent and received
- [ ] OTP verification success
- [ ] Login with correct credentials
- [ ] Password reset flow
- [ ] FIR registration notification sent
- [ ] Officer assignment notifications sent
- [ ] Status update notifications sent
- [ ] Rate limiting works correctly
- [ ] Rate limit counter resets

---

## 11. Future Enhancements

- SMS notifications as alternative to email
- Email unsubscribe option
- Email preference settings
- Automated reminders for pending FIRs
- Batch email notifications
- Email templates customization
- Multi-language email support
- Calendar integration for status updates

---

## 12. Support & Troubleshooting

### Email Not Sending
1. Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
2. Verify Gmail app password settings
3. Check email service logs
4. Ensure `FRONTEND_URL` is correct

### OTP Not Working
1. Verify OTP expiry time
2. Check user's email
3. Ensure database connection
4. Check OTP generation

### Rate Limiting Issues
1. Check if user has exceeded limits
2. Verify rate limit configuration
3. Check IP address being rate limited

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Maintained By**: Development Team
