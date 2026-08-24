# High-Level Design (HLD)
## Secure-Justice: Digital FIR & Evidence Integrity System

---

## 1. System Architecture

Secure-Justice follows the standard **3-Tier Client-Server Architecture**:

```
+-----------------------------------------------------------------------+
|                           1. CLIENT (FRONTEND)                        |
|                                                                       |
|   React (Vite) + Tailwind CSS SPA                                     |
|   - Portals: Citizen, Police, Forensic Expert, Administrator          |
|   - Sends HTTP requests with JWT Token via Axios                      |
+-----------------------------------+-----------------------------------+
                                    | (REST API Calls / JSON)
                                    v
+-----------------------------------------------------------------------+
|                           2. SERVER (BACKEND)                         |
|                                                                       |
|   Node.js + Express.js REST API                                       |
|   - Auth Middleware (JWT Verification & Role Checking)                |
|   - Rate Limiter Middleware (Prevents spam/brute force)               |
|   - Controllers: Auth, FIR, Evidence, Notification, User              |
|   - Services: SHA-256 Hashing, PDFKit Generator, Nodemailer           |
+-------------------+-------------------+-------------------------------+
                    |                   |
                    v                   v
+-----------------------+   +-----------------------+
|  3. DATABASE (DATA)   |   |   4. CLOUD STORAGE    |
|                       |   |                       |
|   MongoDB Atlas       |   |   Cloudinary          |
|   - Users             |   |   - Evidence Files    |
|   - FIRs              |   |   - Generated PDF     |
|   - Evidence Metadata |   |     Reports           |
|   - Notifications     |   |                       |
+-----------------------+   +-----------------------+
```

---

## 2. Core Modules & Functions

### 2.1 Frontend Portals (React SPA)
- **Citizen Portal**: File complaints, view FIR history, upload photos/videos/documents.
- **Police Portal**: View assigned FIRs, progress investigation status, review evidence.
- **Forensic Portal**: View assigned evidence queue, run verification algorithm, download PDF report.
- **Admin Dashboard**: System-wide counts, assign officers/forensics to cases, manage user accounts.

### 2.2 Backend Modules (Express.js)
1. **Authentication Engine**:
   - Manages user registration, email verification links, OTP generation, and JWT login tokens.
2. **FIR Management Engine**:
   - Generates formatted FIR numbers (`FIR-YYYY-XXXXXX`).
   - Controls status transitions (`pending` $\rightarrow$ `verified` $\rightarrow$ `under_investigation` $\rightarrow$ `closed`).
3. **Evidence & Integrity Engine**:
   - Intercepts file uploads using `multer`.
   - Computes 64-character SHA-256 hash using Node's `crypto` module before sending file to Cloudinary.
   - For analysis: fetches file bytes, recalculates hash, compares with stored hash.
4. **PDF Report Engine**:
   - Creates a forensic certificate using `pdfkit` and saves it to Cloudinary.
5. **Notification Hub**:
   - Creates database alerts for status changes, new assignments, and evidence uploads.

---

## 3. Key Workflows (Data Flow)

### 3.1 FIR Filing & Assignment Flow
1. **Citizen** submits FIR form $\rightarrow$ Server saves to MongoDB with status `pending`.
2. **Admin** assigns a Police Officer and Forensic Expert $\rightarrow$ Status auto-updates to `verified`.
3. **Police Officer** investigates and updates status $\rightarrow$ `under_investigation` $\rightarrow$ `closed`.

### 3.2 Evidence Upload Flow
1. User selects file and clicks Upload.
2. Server temporarily receives file via Multer $\rightarrow$ Computes **SHA-256 hash** on file buffer.
3. Server uploads file to **Cloudinary** $\rightarrow$ Deletes local temp file.
4. Server saves `file_url` and `file_hash` in MongoDB Evidence collection.

### 3.3 Forensic Verification Flow
1. **Forensic Expert** clicks "Analyze Evidence".
2. Server downloads file from Cloudinary $\rightarrow$ Recalculates SHA-256 hash.
3. Server compares: `Recalculated Hash == Stored Hash`.
   - **Match**: Status = `Verified` (Intact).
   - **Mismatch**: Status = `Tampered` (Alerts Admins).
4. Server generates PDF report using `pdfkit` $\rightarrow$ Uploads PDF to Cloudinary $\rightarrow$ Updates Evidence record.

---

## 4. Security & Access Control (RBAC)

- **Authentication**: JWT token sent in `Authorization: Bearer <token>` header.
- **Role Verification**: Middleware checks if `req.user.role` is allowed for that endpoint.
- **Rate Limiting**: `express-rate-limit` prevents brute-force attempts on login and OTP routes.
- **Password Security**: Passwords hashed with `bcryptjs` (salt rounds = 10).
- **Data Protection**: Evidence cannot be uploaded or modified once a case is `closed`.
