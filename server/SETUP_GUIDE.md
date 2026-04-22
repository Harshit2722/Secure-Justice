# Secure Justice - Setup & Configuration Guide

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the server directory:

```env
# Email Service (Gmail with App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/secure-justice

# JWT Secret (Change in production!)
JWT_SECRET=your-secret-key-here

# Server Port
PORT=5001

NODE_ENV=development
```

### 3. Gmail Setup for Email Notifications

#### Step-by-Step Gmail Configuration:

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Complete the setup

2. **Generate App Password**
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password to `.env` as `EMAIL_PASS`

3. **Use Gmail Address**
   - Set `EMAIL_USER` to your Gmail address

### 4. Start the Server

```bash
npm run dev
```

Expected output:
```
Server is running on port 5001
MongoDB Connected
```

---

## API Examples

### 1. User Registration

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "citizen"
  }'
```

**Valid Password Examples:**
- ✅ `SecurePass123!`
- ✅ `Police@2026`
- ✅ `ComplexPass#99`
- ❌ `short` (too short)
- ❌ `nouppercases123!` (no uppercase)
- ❌ `NOLOWERCASE123!` (no lowercase)
- ❌ `NoSpecial123` (no special character)

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

### 2. Email Verification

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification_token_from_email"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

### 3. Login with OTP

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete login.",
  "data": {
    "email": "john@example.com"
  }
}
```

### 4. Verify OTP

**Request:**
```bash
curl -X POST http://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

### 5. File FIR

**Request:**
```bash
curl -X POST http://localhost:5001/api/fir \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "complaint_text": "My bicycle was stolen",
    "crime_type": "theft",
    "location": "Main Street, Downtown"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "FIR filed successfully",
  "data": {
    "id": "fir_id",
    "fir_number": "FIR-2026-000001",
    "complaint_text": "My bicycle was stolen",
    "crime_type": "theft",
    "location": "Main Street, Downtown",
    "status": "pending",
    "citizen": "user_id",
    "createdAt": "2026-04-22T10:30:00Z"
  }
}
```

### 6. Assign Officer to FIR

**Request:**
```bash
curl -X PATCH http://localhost:5001/api/fir/fir_id/assign-officer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer officer_token" \
  -d '{
    "officer_id": "police_officer_user_id"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Officer assigned successfully. Notifications sent.",
  "data": {
    "id": "fir_id",
    "fir_number": "FIR-2026-000001",
    "assigned_officer": "police_officer_user_id",
    "status": "pending"
  }
}
```

### 7. Update FIR Status with Notifications

**Request:**
```bash
curl -X PATCH http://localhost:5001/api/fir/fir_id/status-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer officer_token" \
  -d '{
    "status": "under_investigation",
    "notes": "Investigation started. Witness statements collected."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "FIR status updated and notifications sent",
  "data": {
    "id": "fir_id",
    "fir_number": "FIR-2026-000001",
    "status": "under_investigation",
    "status_history": [
      {
        "status": "pending",
        "createdAt": "2026-04-22T10:30:00Z"
      },
      {
        "status": "under_investigation",
        "notes": "Investigation started. Witness statements collected.",
        "createdAt": "2026-04-22T11:00:00Z"
      }
    ]
  }
}
```

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **citizen** | File FIR, view own FIRs, receive updates |
| **police** | View all FIRs, assign officers, update status |
| **forensic** | View forensic evidence, provide reports |
| **lawyer** | View cases, provide legal consultation |
| **victim** | View related cases, receive notifications |
| **court** | View court proceedings, make decisions |
| **admin** | Full system access, manage users, delete FIRs |

---

## Rate Limiting Rules

| Action | Limit | Window |
|--------|-------|--------|
| Register/Login | 5 attempts | 15 minutes |
| OTP Verification | 3 attempts | 10 minutes |
| Email Verification | 5 attempts | 1 hour |
| Password Reset | 3 attempts | 1 hour |

---

## Troubleshooting

### Issue: "Email sending failed"
**Solution:**
1. Verify `EMAIL_USER` and `EMAIL_PASS` are correct
2. Enable 2-Factor Authentication on Gmail
3. Check that App Password was generated correctly
4. Ensure Less Secure Apps is disabled (using App Password)

### Issue: "Too many requests"
**Solution:**
1. Rate limit was exceeded
2. Wait for the time window to reset
3. Check rate limiter configuration

### Issue: "Invalid email format"
**Solution:**
1. Ensure email contains `@` and domain
2. Valid format: `user@domain.com`

### Issue: "Password is not strong enough"
**Solution:**
Password must have:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

Example: `SecurePass123!`

---

## Testing Emails Locally

### Using Mailtrap (Alternative to Gmail)

1. Create account at https://mailtrap.io
2. Get SMTP credentials
3. Update `.env`:
```env
EMAIL_USER=your_mailtrap_email
EMAIL_PASS=your_mailtrap_password
EMAIL_SERVICE=mailtrap
```

### Using Nodemailer Test Account

```javascript
// For testing only
const testAccount = await nodemailer.createTestAccount();
// Use transporter with testAccount
```

---

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong, unique value
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific email credentials
- [ ] Configure HTTPS/SSL
- [ ] Enable CORS appropriately
- [ ] Set up proper database backups
- [ ] Configure logging and monitoring
- [ ] Test all email templates
- [ ] Verify rate limiting is working
- [ ] Test password reset flow

---

## Support & Resources

- **Nodemailer Docs**: https://nodemailer.com/
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Mongoose Docs**: https://mongoosejs.com/
- **JWT Guide**: https://jwt.io/

---

**Last Updated**: April 2026  
**Version**: 1.0
