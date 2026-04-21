// server/routes/documentRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { upload, handleUploadError } = require("../middleware/uploadMiddleware");
const {
  uploadDocument,
  getDocumentStatus,
  getDocumentReport,
  listDocuments,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

router.use(protect);

router.post("/upload", upload.single("document"), handleUploadError, uploadDocument);
router.get("/", listDocuments);
router.get("/:id/status", getDocumentStatus);
router.get("/:id/report", getDocumentReport);
router.delete("/:id", deleteDocument);

module.exports = router;