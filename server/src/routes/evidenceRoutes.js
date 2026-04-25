const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate,authorizeRoles } = require('../middleware/auth.middleware');
const { 
    uploadEvidence, 
    getEvidenceByFir, 
    getAllEvidence,
    analyzeEvidence,
    downloadEvidencePdf,
    getForensicStats
} = require('../controllers/evidenceController');

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Evidence routes
router.post('/evidence/upload/:firId', authenticate, authorizeRoles("citizen", "police"), upload.single('file'), uploadEvidence);
router.get('/evidence/fir/:firId', authenticate, authorizeRoles("lawyer", "police", "court", "forensic", "citizen"), getEvidenceByFir);
router.get('/evidence/all', authenticate, authorizeRoles("forensic", "police", "admin", "court"), getAllEvidence);

// Forensics stats
router.get('/evidence/stats/forensic', authenticate, authorizeRoles("forensic"), getForensicStats);

// Forensics route
router.post('/evidence/analyze/:evidenceId', authenticate, authorizeRoles("forensic"), analyzeEvidence);
router.get('/evidence/download/:evidenceId', downloadEvidencePdf);

module.exports = router;
