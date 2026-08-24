# Product Requirements Document (PRD)
## Secure-Justice: Digital FIR & Evidence Integrity System

---

## 1. Overview & Objective

**Secure-Justice** is a web-based FIR (First Information Report) and Digital Evidence Management System built on the MERN stack (MongoDB, Express.js, React, Node.js). 

### Main Goal
To replace manual, paper-based police complaint workflows with a secure digital system that:
1. Enables citizens to file FIRs online and track progress.
2. Helps administrators assign Police Officers and Forensic Experts.
3. Guarantees that uploaded digital evidence cannot be altered undetected using **SHA-256 cryptographic hashing**.
4. Automatically generates a certified forensic verification report in PDF format.

---

## 2. User Roles & Capabilities

| Role | What They Can Do |
| :--- | :--- |
| **Citizen** | Register/Login, file new FIRs, view own FIR status, upload evidence to their active cases, view forensic reports. |
| **Police Officer** | View cases assigned to them, update investigation status (`under_investigation`, `closed`), upload case evidence. |
| **Forensic Expert** | View assigned cases, verify evidence integrity (recalculate hash), generate forensic verification PDF reports. |
| **Administrator** | Manage users, assign Police Officers and Forensic Experts to new cases, view system statistics, receive tamper alerts. |

---

## 3. Core Features & Requirements

### 3.1 Authentication & Security
- **Email & OTP Verification**: Users verify email via a token link and 6-digit OTP sent using Nodemailer.
- **Secure Passwords**: Passwords hashed using `bcryptjs` before database storage.
- **JWT Authentication**: Logged-in users receive a JSON Web Token stored in the browser to access protected routes.
- **Role-Based Access Control (RBAC)**: Each route checks if the logged-in user has the required role.

### 3.2 FIR Lifecycle Management
- **Unique FIR ID**: Automatically formats FIR IDs as `FIR-YYYY-XXXXXX` (e.g., `FIR-2026-000001`).
- **Duplicate Check**: Prevents identical complaints from the same user.
- **Case State Machine**:
  - `pending` (Default when filed by citizen)
  - `verified` (Auto-set when Admin assigns both an Officer and a Forensic Expert)
  - `under_investigation` (Updated by assigned Police Officer)
  - `closed` (Marked when investigation finishes; locks case from further edits)
- **Status History**: Keeps an audit log of who changed the status and when.

### 3.3 Digital Evidence Management & Integrity
- **SHA-256 Hashing on Upload**: When a file (image, video, document) is uploaded, the server calculates its SHA-256 hash before storing it on Cloudinary.
- **Integrity Verification**: When a Forensic Expert verifies the file, the server downloads the file from cloud storage, recalculates the SHA-256 hash, and compares it to the original hash.
  - If matches $\rightarrow$ Status is **Verified**.
  - If mismatch $\rightarrow$ Status is **Tampered** (alerts Admin immediately).
- **Automated PDF Report**: Generates a downloadable forensic report PDF showing case details, both hashes, examiner name, and verdict.

### 3.4 Notifications
- In-app notification bell with unread count for real-time updates (FIR filed, officer assigned, evidence analyzed, tamper alerts).

---

## 4. Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas with Mongoose ODM.
- **File Storage**: Cloudinary (Cloud media storage).
- **Security & Utilities**: `crypto` (built-in Node module for SHA-256), `bcryptjs`, `jsonwebtoken`, `pdfkit`, `nodemailer`, `express-rate-limit`.
