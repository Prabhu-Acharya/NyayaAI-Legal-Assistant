const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const protect   = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const {
  protectExport,
  generateContract,
  listContracts,
  getContract,
  deleteContract,
  exportPDF,
  exportDOCX,
  getContractScore,
  polishClauseHandler,      // ← Week 9
  generateNewContract,      // ← Week 9
} = require('../controllers/contractController');

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please wait 15 minutes.' },
});

const polishLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: 'Polish limit reached. Try again in an hour.' },
});

// ── Existing routes ───────────────────────────────────────────────────────────
router.post('/generate',        generateLimiter, protect, generateContract);
router.get('/',                 protect,  listContracts);
router.get('/:id/score',        protect,  getContractScore);
router.get('/:id',              protect,  getContract);
router.delete('/:id',           protect,  deleteContract);
router.get('/:id/export/pdf',   protectExport, exportPDF);
router.get('/:id/export/docx',  protectExport, exportDOCX);

// ── Week 9: Polish a clause ───────────────────────────────────────────────────
router.post(
  '/polish-clause',
  polishLimiter,
  protect,
  [
    body('clauseText').trim().notEmpty().withMessage('clauseText required').isLength({ max: 3000 }),
    body('instruction').optional().trim().isLength({ max: 300 }),
  ],
  polishClauseHandler,
);

// ── Week 9: New contract types (cofounder / terms / privacy / legal_notice) ──
router.post('/generate-custom',  generateLimiter, protect, generateNewContract);

module.exports = router;
