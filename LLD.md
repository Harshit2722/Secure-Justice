# Low-Level Design (LLD)
## Secure-Justice: Digital FIR & Evidence Integrity System

---

## 1. Database Schemas (Mongoose)

### 1.1 `User` Schema (`models/User.js`)
- `name` (String, required): User's full name.
- `email` (String, required, unique): User's email for login.
- `password` (String, required): Hashed password via `bcryptjs`.
- `role` (String, enum: `['citizen', 'police', 'forensic', 'admin']`): User access level.
- `isVerified` (Boolean, default: `false`): Email verification status.
- `verificationToken` & `verificationTokenExpiry` (String, Date): 24-hour email verification token.
- `otp` & `otpExpiry` (String, Date): 6-digit OTP for email verification / login.
- `resetOtp` & `resetOtpExpiry` (String, Date): 6-digit OTP for password reset.

### 1.2 `FIR` Schema (`models/FIR.js`)
- `citizen` (ObjectId, ref: `'User'`, required): Citizen who filed the case.
- `fir_number` (String, unique): Auto-formatted ID (e.g., `FIR-2026-000001`).
- `complaint_text` (String, required): Incident description.
- `crime_type` (String, enum: `['theft', 'cybercrime', 'fraud', 'violence', 'other']`).
- `location` (String, required): Location of crime.
- `status` (String, enum: `['pending', 'verified', 'under_investigation', 'closed']`, default: `'pending'`).
- `assigned_officer` (ObjectId, ref: `'User'`): Police Officer handling the case.
- `assigned_forensic` (ObjectId, ref: `'User'`): Forensic Expert handling evidence.
- `status_history` (Array of objects): Records `status`, `updated_at`, and `updated_by`.

### 1.3 `Evidence` Schema (`models/Evidence.js`)
- `fir` (ObjectId, ref: `'FIR'`, required): Associated case.
- `file_url` (String, required): Cloudinary media URL.
- `file_hash` (String, required): Original 64-character SHA-256 hash.
- `file_type` (String, enum: `['image', 'video', 'document']`).
- `uploaded_by` (ObjectId, ref: `'User'`): User who uploaded the file.
- `analyzed_by` (ObjectId, ref: `'User'`): Forensic expert who ran analysis.
- `status` (String, enum: `['Pending', 'Verified', 'Tampered']`, default: `'Pending'`).
- `cloudinary_report_url` (String): Cloudinary link to generated PDF report.
- `forensic_report_url` (String): Server download link for report.

### 1.4 `Notification` Schema (`models/Notification.js`)
- `recipient` (ObjectId, ref: `'User'`): Target user.
- `type` (String, enum: `['fir_filed', 'status_changed', 'officer_assigned', 'forensic_assigned', 'evidence_uploaded', 'evidence_verified', 'tampered_alert', 'new_user']`).
- `title` & `message` (String): Notification text.
- `link` (String): Route to navigate to on click.
- `isRead` (Boolean, default: `false`): Read indicator.

---

## 2. API Endpoints

### 2.1 Auth Routes (`/api/auth`)
- `POST /api/auth/register`: Creates new user account and sends verification email.
- `POST /api/auth/login`: Authenticates credentials and returns JWT token.
- `POST /api/auth/verify-email`: Verifies token sent via email.
- `POST /api/auth/verify-otp`: Verifies 6-digit OTP.
- `POST /api/auth/forgot-password`: Generates reset OTP and emails user.
- `POST /api/auth/reset-password`: Validates OTP and updates password.

### 2.2 FIR Routes (`/api/fir`)
- `POST /api/fir`: (Citizen only) File a new FIR.
- `GET /api/fir/my-firs`: (Citizen only) Get FIRs filed by logged-in citizen.
- `GET /api/fir/assigned/me`: (Police only) Get cases assigned to logged-in officer.
- `GET /api/fir/assigned-forensic/me`: (Forensic only) Get cases assigned to expert.
- `GET /api/fir/:id`: (Protected) Get full FIR details.
- `PATCH /api/fir/:id/assign-officer`: (Admin only) Assign police officer.
- `PATCH /api/fir/:id/assign-forensic`: (Admin only) Assign forensic expert.
- `PATCH /api/fir/:id/status-update`: (Police only) Update status (`under_investigation`, `closed`).
- `GET /api/fir/stats`: (Police) Case statistics.
- `GET /api/fir/admin/stats`: (Admin) System summary statistics.

### 2.3 Evidence Routes (`/api`)
- `POST /api/evidence/upload/:firId`: (Citizen/Police) Uploads file, computes SHA-256 hash, stores in Cloudinary & DB.
- `GET /api/evidence/fir/:firId`: Get all evidence files for an FIR.
- `POST /api/evidence/analyze/:evidenceId`: (Forensic only) Downloads file, recalculates hash, compares, generates PDF report.
- `GET /api/evidence/download/:evidenceId`: Downloads the forensic PDF report.

### 2.4 Notification Routes (`/api/notifications`)
- `GET /api/notifications`: Get user's notifications.
- `GET /api/notifications/unread-count`: Get unread count for bell badge.
- `PATCH /api/notifications/read-all`: Mark all as read.

---

## 3. Cryptographic Hashing Implementation

### 3.1 Upload Hashing (Pre-Storage)
```javascript
// Read file into memory buffer
const fileBuffer = fs.readFileSync(req.file.path);

// Compute SHA-256 hash
const hashSum = crypto.createHash('sha256');
hashSum.update(fileBuffer);
const file_hash = hashSum.digest('hex'); // 64-char string

// Upload to Cloudinary and delete local temp file
const uploadResult = await uploadOnCloudinary(req.file.path);
if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
```

### 3.2 Forensic Verification (Re-hashing)
```javascript
// Fetch raw file bytes from Cloudinary
const response = await fetch(evidence.file_url);
const arrayBuffer = await response.arrayBuffer();
const downloadedBuffer = Buffer.from(arrayBuffer);

// Recompute SHA-256 hash
const hashSum = crypto.createHash('sha256');
hashSum.update(downloadedBuffer);
const currentHash = hashSum.digest('hex');

// Compare hashes
const isIntact = (currentHash === evidence.file_hash);
evidence.status = isIntact ? 'Verified' : 'Tampered';
```

---

## 4. Middleware & Protection Flow

1. **`authenticate`**: Reads `req.headers.authorization`, verifies JWT using `jwt.verify(token, JWT_SECRET)`, attaches `req.user`.
2. **`authorizeRoles(...roles)`**: Checks if `roles.includes(req.user.role)`. If not, returns `403 Forbidden`.
3. **`rateLimiter`**: Limits repeated requests on auth & OTP routes to prevent brute-force attacks.
4. **`errorHandler`**: Catches all errors and returns standard JSON: `{ success: false, message: err.message }`.
