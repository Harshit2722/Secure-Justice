
# Secure-Justice ⚖️

**Live URL**: https://secure-justice.vercel.app/

**Secure-Justice** is a comprehensive, secure platform for FIR (First Information Report) and Digital Evidence Management. Built on the MERN stack, it digitalizes and secures the law enforcement workflow, ensuring that forensic evidence remains immutable, verifiable, and strictly controlled through role-based access.

## ✨ Key Features

- **Role-Based Access Control (RBAC)**: Dedicated, secure portals for Citizens, Police Officers, Forensic Experts, and Administrators.
- **Secure FIR Filing & Case Management**: End-to-end digital lifecycle for reporting, assigning, and investigating cases.
- **Digital Evidence Management System (DEMS)**: Securely upload, categorize, and store case evidence.
- **Cryptographic Integrity Verification**: Utilizes **SHA-256 hashing** at the time of upload to detect and prevent any tampering of digital evidence. 
- **Automated Workflow Enforcement**: Strict state transitions (e.g., cases automatically verify once roles are assigned, strictly enforced one-time integrity analysis).
- **Secure File Handling**: Proxy-based evidence downloads ensuring authorized access without exposing public storage links.
- **User Authentication & OTP**: Robust email verification and OTP-based authentication using JSON Web Tokens (JWT).
- **Interactive Dashboards**: Clean, responsive, and dynamic UI powered by React and Tailwind CSS.

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS v4
- Axios
- React Router DOM

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcrypt
- Cloudinary (Cloud Storage)
- Nodemailer (Email Verification)
- Crypto (SHA-256 Hash Generation)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- MongoDB URI (Local or MongoDB Atlas)
- Cloudinary Account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harshit2722/Secure-Justice.git
   cd Secure-Justice
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add the following configurations:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=http://localhost:5173
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Run the Application**

   Open two terminal instances:

   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```

   The frontend will be running on `http://localhost:5173` and the backend on `http://localhost:5001`.

## 🛡️ Security & Integrity Core

Secure-Justice takes the integrity of legal proceedings seriously:
- **Tamper-Proof Evidence**: When a forensic expert uploads evidence, a unique SHA-256 hash is generated and stored. Future downloads verify this hash to guarantee the file hasn't been altered.
- **Proxy Downloads**: Cloudinary storage links are never exposed directly to the client. The backend securely proxies and streams the file to authorized users only.
- **Workflow Guards**: Restricts unauthorized case status reversions and ensures the proper chain of custody.

