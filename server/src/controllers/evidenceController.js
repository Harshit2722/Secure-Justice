const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Evidence = require('../models/Evidence');
const FIR = require('../models/FIR');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadOnCloudinary, uploadBufferToCloudinary } = require('../utils/cloudinary');
const PDFDocument = require('pdfkit');

// @desc    Upload new evidence and compute SHA-256 hash BEFORE saving to DB
// @route   POST /api/evidence/upload/:firId
// @access  Private
const uploadEvidence = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'Please provide a file to upload');
    }

    const { firId } = req.params;
    const { file_type, description } = req.body;
    
    if (!firId || !file_type) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw new ApiError(400, 'FIR reference and file_type are required');
    }

    if (req.user.role === 'citizen') {
        const fir = await FIR.findById(firId);
        if (!fir) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            throw new ApiError(404, 'FIR not found');
        }
        if (fir.citizen.toString() !== req.user._id.toString()) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            throw new ApiError(403, 'Forbidden: You do not own this FIR');
        }
        if (fir.status === 'closed') {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            throw new ApiError(403, 'Forbidden: Cannot upload evidence to a closed case.');
        }
    } else if (req.user.role === 'police') {
        const fir = await FIR.findById(firId);
        if (!fir) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            throw new ApiError(404, 'FIR not found');
        }
        if (fir.assigned_officer?.toString() !== req.user._id.toString()) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            throw new ApiError(403, 'Forbidden: This case is not assigned to you. You cannot upload evidence.');
        }
        if (fir.status === 'closed') {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            throw new ApiError(403, 'Forbidden: Cannot upload evidence to a closed case.');
        }
    } else if (req.user.role !== 'admin') {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw new ApiError(403, 'Forbidden: Unauthorized role');
    }

    try {
        // Read the file as a buffer to calculate its hash BEFORE saving the record
        const fileBuffer = fs.readFileSync(req.file.path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const file_hash = hashSum.digest('hex');

        // Upload to Cloudinary
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (!uploadResult) {
            throw new ApiError(500, 'Error uploading file to Cloudinary');
        }

        // Clean up the local file after uploading
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Create the evidence record
        const newEvidence = await Evidence.create({
            fir: firId,
            file_url: uploadResult.secure_url,
            file_hash,
            uploaded_by: req.user._id,
            file_type,
            description: description || ''
        });

        res.status(201).json({
            success: true,
            data: newEvidence
        });
    } catch (error) {
        // Clean up the uploaded file if database insertion fails
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        throw new ApiError(500, 'Error saving evidence: ' + error.message);
    }
});

// @desc    Get all evidence for a specific FIR
// @route   GET /api/evidence/fir/:firId
// @access  Private
const getEvidenceByFir = asyncHandler(async (req, res) => {
    const { firId } = req.params;

    if (req.user.role === 'citizen') {
        const fir = await FIR.findById(firId);
        if (!fir) {
            throw new ApiError(404, 'FIR not found');
        }
        if (fir.citizen.toString() !== req.user._id.toString()) {
            throw new ApiError(403, 'Forbidden: You do not own this FIR');
        }
    }

    const evidenceList = await Evidence.find({ fir: firId })
        .populate('uploaded_by', 'name role')
        .populate('analyzed_by', 'name role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: evidenceList.length,
        data: evidenceList
    });
});

// @desc    Get all evidence (for Forensics queue)
// @route   GET /api/evidence/all
// @access  Private (Forensic, Police, Admin)
const getAllEvidence = asyncHandler(async (req, res) => {
    const evidenceList = await Evidence.find({})
        .populate('fir')
        .populate('uploaded_by', 'name role')
        .populate('analyzed_by', 'name role')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: evidenceList.length,
        data: evidenceList
    });
});

// @desc    Forensic analysis of evidence (recalculate hash, generate PDF)
// @route   POST /api/evidence/analyze/:evidenceId
// @access  Private (Forensic)
const analyzeEvidence = asyncHandler(async (req, res) => {
    const { evidenceId } = req.params;
    const { notes } = req.body || {};

    const evidence = await Evidence.findById(evidenceId).populate({
        path: 'fir',
        populate: { path: 'citizen', select: 'name' }
    });

    if (!evidence) {
        throw new ApiError(404, 'Evidence not found');
    }

    if (!evidence.fir) {
        throw new ApiError(404, 'Associated FIR not found');
    }

    // Role-Based Access Control: Only the assigned forensic expert can analyze
    if (!evidence.fir.assigned_forensic || evidence.fir.assigned_forensic.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Access Denied. You can only analyze evidence for cases you are officially assigned to.');
    }

    if (evidence.fir.status !== 'under_investigation') {
        throw new ApiError(403, 'Analysis Denied. Evidence can only be analyzed when the FIR status is "under_investigation".');
    }

    if (evidence.status !== 'Pending') {
        throw new ApiError(400, 'Analysis Denied. This evidence has already been analyzed and a forensic report has been finalized.');
    }

    // Download file from Cloudinary to recalculate hash
    const response = await fetch(evidence.file_url);
    if (!response.ok) {
        throw new ApiError(500, 'Cannot fetch evidence file for analysis from cloud');
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Recalculate hash of the current file
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const currentHash = hashSum.digest('hex');

    // Compare with the original hash from DB
    const isIntact = currentHash === evidence.file_hash;
    
    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const pdfBuffers = [];
    doc.on('data', pdfBuffers.push.bind(pdfBuffers));
    
    const finishPdfCreation = new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(pdfBuffers)));
        doc.on('error', reject);
    });

    // Beautiful PDF Structure
    doc.fontSize(22).font('Helvetica-Bold').text('FORENSIC INTEGRITY REPORT', { align: 'center', characterSpacing: 2 });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center', color: 'gray' });
    doc.moveDown(2);

    // Separator line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#000000').stroke();
    doc.moveDown(1.5);

    // Context Details
    doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('CASE & EVIDENCE INFORMATION');
    doc.moveDown(0.5);

    const citizenName = evidence.fir.citizen ? evidence.fir.citizen.name : 'Unknown_Citizen';
    // Use the actual fir_number from the updated schema! Fallback to ID just in case.
    const firNumber = evidence.fir.fir_number || evidence.fir._id.toString();

    doc.fontSize(12)
       .font('Helvetica-Bold').text(`FIR Reference: `, { continued: true })
       .font('Helvetica').text(firNumber)
       .moveDown(0.3)
       .font('Helvetica-Bold').text(`Filed By: `, { continued: true })
       .font('Helvetica').text(citizenName)
       .moveDown(0.3)
       .font('Helvetica-Bold').text(`Evidence Code: `, { continued: true })
       .font('Helvetica').text(evidence._id.toString())
       .moveDown(0.3)
       .font('Helvetica-Bold').text(`Forensic Examiner: `, { continued: true })
       .font('Helvetica').text(req.user.name);
       
    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#dddddd').stroke();
    doc.moveDown(1.5);

    // Hash Details
    doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('CRYPTO-VALIDATION ANALYSIS');
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica-Bold').text('Original SHA-256 Checksum (Upload):');
    doc.font('Courier').text(evidence.file_hash);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('Recalculated SHA-256 Checksum (Current):');
    doc.font('Courier').text(currentHash);
    doc.moveDown(2);

    // Verdict
    doc.fontSize(18).font('Helvetica-Bold');
    if (isIntact) {
        doc.fillColor('green').text('VERDICT: VERIFIED (INTACT)', { align: 'center' });
    } else {
        doc.fillColor('red').text('VERDICT: TAMPERED (COMPROMISED)', { align: 'center' });
    }
    
    if (notes && notes.trim().length > 0) {
        doc.moveDown(2);
        doc.fillColor('black').fontSize(14).font('Helvetica-Bold').text('EXAMINER NOTES');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(notes);
    }
    
    // Reset color & finalize
    doc.fillColor('black');
    doc.end();

    const pdfBufferFinal = await finishPdfCreation;

    // Build an Extensionless dynamic name purely for storage bypassing CDN limitations
    const safeCitizenName = citizenName.replace(/[^a-zA-Z0-9]/g, '_');
    const extensionlessPublicId = `${safeCitizenName}-${firNumber}`;

    // Upload extensionless raw bytes to Cloudinary! No 401 Unauthorized PDF Block!
    const cldResponse = await uploadBufferToCloudinary(pdfBufferFinal, extensionlessPublicId, "raw");
    
    // Update Evidence document
    evidence.status = isIntact ? 'Verified' : 'Tampered';
    evidence.cloudinary_report_url = cldResponse.secure_url;
    evidence.forensic_report_url = `${req.protocol}://${req.get('host')}/api/evidence/download/${evidence._id}`;
    evidence.analyzed_by = req.user._id;

    await evidence.save();

    res.status(200).json({
        success: true,
        message: 'Forensic analysis completed successfully.',
        data: {
            evidenceId: evidence._id,
            isIntact,
            status: evidence.status,
            forensic_report_url: evidence.forensic_report_url
        }
    });
});

// @desc    Download Forensic Report directly (Proxy to hide Cloudinary and Force Download)
// @route   GET /api/evidence/download/:evidenceId
// @access  Public (Unguessable ID acts as secure token)
const downloadEvidencePdf = asyncHandler(async (req, res) => {
    const { evidenceId } = req.params;

    const evidence = await Evidence.findById(evidenceId).populate('fir');
    
    if (!evidence || !evidence.cloudinary_report_url) {
        throw new ApiError(404, 'Forensic PDF Report not found or not yet generated.');
    }

    // Fetch the raw PDF buffer silently from Cloudinary
    const response = await fetch(evidence.cloudinary_report_url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/110.0.0.0 Safari/537.36'
        }
    });
    
    if (!response.ok) {
        let errDesc = '';
        try {
            errDesc = await response.text();
        } catch(e) {}
        throw new ApiError(500, `Cloudinary rejected our fetch: ${response.status} ${response.statusText} - ${errDesc} | URL: ${evidence.cloudinary_report_url}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Build the clean dynamic name again for the user's PC download
    let firNumber = 'Unknown';
    if(evidence.fir) {
        firNumber = evidence.fir.fir_number || evidence.fir._id.toString();
    }
    const pdfName = `Official_Forensic_Report_${firNumber}.pdf`;

    // Send the correct headers that force Chrome/Safari to trigger a hard File Download to the local system
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfName}"`);
    res.send(buffer);
});

// @desc    Get forensic statistics for dashboard
// @route   GET /api/evidence/stats/forensic
// @access  Private (Forensic)
const getForensicStats = asyncHandler(async (req, res) => {
    // We only get stats for cases assigned to this expert, or global if they want global.
    // Let's provide global stats or specific stats. Here we provide global evidence stats.
    const statusStats = await Evidence.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const typeStats = await Evidence.aggregate([
      { $group: { _id: "$file_type", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            statusStats,
            typeStats
        }
    });
});

module.exports = {
    uploadEvidence,
    getEvidenceByFir,
    getAllEvidence,
    analyzeEvidence,
    downloadEvidencePdf,
    getForensicStats
};
