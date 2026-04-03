// ─────────────────────────────────────────────────────────────────────────────
// contractRoutes.js  (replaces the old monolithic contracts.js route file)
// All business logic lives in contractController.js
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  protectExport,
  generateContract,
  listContracts,
  getContract,
  deleteContract,
  exportPDF,
  exportDOCX,
} = require("../controllers/contractController");

router.post("/generate",            protect,       generateContract);
router.get("/",                     protect,       listContracts);
router.get("/:id",                  protect,       getContract);
router.delete("/:id",               protect,       deleteContract);
router.get("/:id/export/pdf",       protectExport, exportPDF);
router.get("/:id/export/docx",      protectExport, exportDOCX);

module.exports = router;