// server/controllers/documentController.js
const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");
const { extractText, analyseDocument } = require("../services/documentAI.service");

// POST /api/documents/upload
const uploadDocument = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "No file uploaded." });

  const { originalname, filename, mimetype, size, path: filePath } = req.file;

  const doc = await Document.create({
    user:         req.user,
    originalName: originalname,
    storedName:   filename,
    mimeType:     mimetype,
    sizeBytes:    size,
    status:       "parsing",
  });

  runPipeline(doc._id, filePath, mimetype).catch(console.error);

  return res.status(202).json({
    success: true,
    message: "File uploaded. Analysis in progress.",
    documentId: doc._id,
  });
};

// ─── Async pipeline ───────────────────────────────────────────────────────────
async function runPipeline(docId, filePath, mimeType) {
  let doc = await Document.findById(docId);
  if (!doc) return;

  try {
    doc.status = "parsing";
    await doc.save();

    const text = await extractText(filePath, mimeType);
    if (!text || text.length < 50)
      throw new Error("Could not extract meaningful text from file.");

    doc.extractedText = text;
    doc.status = "analysing";
    await doc.save();

    const result = await analyseDocument(text);

    doc.analysis = {
      summary:         result.summary,
      keyFindings:     result.keyFindings,
      riskFlags:       result.riskFlags,
      recommendations: result.recommendations,
      rawResponse:     result.rawResponse,
    };
    doc.riskScore = result.riskScore;
    doc.status    = "done";
    await doc.save();

  } catch (err) {
    doc.status       = "error";
    doc.errorMessage = err.message;
    await doc.save();
  } finally {
    fs.unlink(filePath, () => {});
  }
}

// GET /api/documents/:id/status
const getDocumentStatus = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user }).select(
    "status riskScore riskLevel errorMessage createdAt"
  );
  if (!doc) return res.status(404).json({ success: false, message: "Document not found." });
  return res.json({ success: true, document: doc });
};

// GET /api/documents/:id/report
const getDocumentReport = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user }).select(
    "-extractedText -analysis.rawResponse -storedName"
  );
  if (!doc) return res.status(404).json({ success: false, message: "Document not found." });
  if (doc.status !== "done")
    return res.status(400).json({ success: false, message: `Analysis ${doc.status}.` });
  return res.json({ success: true, document: doc });
};

// GET /api/documents
const listDocuments = async (req, res) => {
  const docs = await Document.find({ user: req.user })
    .sort({ createdAt: -1 })
    .select("originalName riskScore riskLevel status createdAt sizeBytes")
    .limit(20);
  return res.json({ success: true, documents: docs });
};

// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user });
  if (!doc) return res.status(404).json({ success: false, message: "Document not found." });
  return res.json({ success: true, message: "Document deleted." });
};

module.exports = { uploadDocument, getDocumentStatus, getDocumentReport, listDocuments, deleteDocument };