const express     = require("express");
const router      = express.Router();
const rateLimit   = require("express-rate-limit");
const protect     = require("../middleware/authMiddleware");
const {
  protectExport,
  generateContract,
  listContracts,
  getContract,
  deleteContract,
  exportPDF,
  exportDOCX,
} = require("../controllers/contractController");

// Max 5 generate attempts per IP per 15 minutes
const generateLimiter = rateLimit({
  windowMs:    15 * 60 * 1000,
  max:         5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    message: "Too many requests — please wait 15 minutes before trying again.",
  },
});

router.post("/generate",        generateLimiter, protect, generateContract);
router.get("/",                 protect,  listContracts);
router.get("/:id",              protect,  getContract);
router.delete("/:id",           protect,  deleteContract);
router.get("/:id/export/pdf",   protectExport, exportPDF);
router.get("/:id/export/docx",  protectExport, exportDOCX);

module.exports = router;