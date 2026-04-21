// server/routes/documentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";
import {
  uploadDocument,
  getDocumentStatus,
  getDocumentReport,
  listDocuments,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// all routes require auth
router.use(protect);

// POST /api/documents/upload
router.post("/upload", upload.single("document"), handleUploadError, uploadDocument);

// GET  /api/documents
router.get("/", listDocuments);

// GET  /api/documents/:id/status  — poll during analysis
router.get("/:id/status", getDocumentStatus);

// GET  /api/documents/:id/report  — full results
router.get("/:id/report", getDocumentReport);

// DELETE /api/documents/:id
router.delete("/:id", deleteDocument);

export default router;