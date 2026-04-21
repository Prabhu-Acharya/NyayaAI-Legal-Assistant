// server/controllers/documentController.js
import fs from "fs";
import path from "path";
import Document from "../models/Document.js";
import { extractText, analyseDocument } from "../services/documentAI.service.js";

// ─── Upload + Analyse ─────────────────────────────────────────────────────────
// POST /api/documents/upload
export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  const { originalname, filename, mimetype, size, path: filePath } = req.file;

  // create doc record
  const doc = await Document.create({
    user:         req.user,          // raw ID from authMiddleware
    originalName: originalname,
    storedName:   filename,
    mimeType:     mimetype,
    sizeBytes:    size,
    status:       "parsing",
  });

  // run pipeline async so we can respond immediately with doc ID
  runPipeline(doc._id, filePath, mimetype).catch(console.error);

  return res.status(202).json({
    success: true,
    message: "File uploaded. Analysis in progress.",
    documentId: doc._id,
  });
};

// ─── Pipeline (extract → analyse → save) ─────────────────────────────────────
async function runPipeline(docId, filePath, mimeType) {
  let doc = await Document.findById(docId);
  if (!doc) return;

  try {
    // 1. extract text
    doc.status = "parsing";
    await doc.save();

    const text = await extractText(filePath, mimeType);
    if (!text || text.length < 50) throw new Error("Could not extract meaningful text from file.");

    doc.extractedText = text;

    // 2. analyse
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
    doc.riskScore   = result.riskScore;    // pre-save hook sets riskLevel
    doc.status      = "done";
    await doc.save();

  } catch (err) {
    doc.status       = "error";
    doc.errorMessage = err.message;
    await doc.save();
  } finally {
    // clean up uploaded file
    fs.unlink(filePath, () => {});
  }
}

// ─── Poll Status ──────────────────────────────────────────────────────────────
// GET /api/documents/:id/status
export const getDocumentStatus = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user }).select(
    "status riskScore riskLevel errorMessage createdAt"
  );
  if (!doc) return res.status(404).json({ success: false, message: "Document not found." });

  return res.json({ success: true, document: doc });
};

// ─── Get Full Report ──────────────────────────────────────────────────────────
// GET /api/documents/:id/report
export const getDocumentReport = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user }).select(
    "-extractedText -analysis.rawResponse -storedName"
  );
  if (!doc) return res.status(404).json({ success: false, message: "Document not found." });
  if (doc.status !== "done")
    return res.status(400).json({ success: false, message: `Analysis ${doc.status}.` });

  return res.json({ success: true, document: doc });
};

// ─── List User Documents ──────────────────────────────────────────────────────
// GET /api/documents
export const listDocuments = async (req, res) => {
  const docs = await Document.find({ user: req.user })
    .sort({ createdAt: -1 })
    .select("originalName riskScore riskLevel status createdAt sizeBytes")
    .limit(20);

  return res.json({ success: true, documents: docs });
};

// ─── Delete ───────────────────────────────────────────────────────────────────
// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user });
  if (!doc) return res.status(404).json({ success: false, message: "Document not found." });

  return res.json({ success: true, message: "Document deleted." });
};