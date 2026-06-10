/**
 * server/controllers/contractController.week9.js
 *
 * Week 9 — two new handlers to add to contractController.js.
 *
 * HOW TO INTEGRATE:
 *   1. In contractController.js, add at top:
 *        const { polishClause, generateNewTypeContract, NEW_CONTRACT_TYPES } = require('../services/contractAI.week9');
 *        const { validationResult } = require('express-validator');
 *
 *   2. Paste polishClauseHandler and generateNewContract below into contractController.js.
 *
 *   3. Add both to module.exports.
 */

const { validationResult } = require('express-validator');
const { polishClause, generateNewTypeContract, NEW_CONTRACT_TYPES } = require('../services/contractAI.week9');
const Contract = require('../models/Contract');
const User     = require('../models/User');

const FREE_CONTRACT_LIMIT = 3;

// ── POST /api/contracts/polish-clause ────────────────────────────────────────
const polishClauseHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { clauseText, instruction } = req.body;
  try {
    const improved = await polishClause(clauseText, instruction);
    res.json({ improved });
  } catch (err) {
    console.error('polishClause error:', err.message);
    res.status(500).json({ message: 'AI clause polish failed', error: err.message });
  }
};

// ── POST /api/contracts/generate-custom ──────────────────────────────────────
// Handles: cofounder, terms, privacy, legal_notice
const generateNewContract = async (req, res) => {
  const { type, formData, language = 'english' } = req.body;

  if (!type || !NEW_CONTRACT_TYPES[type]) {
    return res.status(400).json({ message: `Invalid custom contract type: ${type}` });
  }
  if (!formData) return res.status(400).json({ message: 'formData required' });

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Same free-plan gate as existing generateContract
    const now       = new Date();
    const resetDate = new Date(user.usageResetDate);
    if (now.getFullYear() > resetDate.getFullYear() || now.getMonth() > resetDate.getMonth()) {
      user.contractsUsed  = 0;
      user.usageResetDate = now;
      await user.save();
    }

    if (!user.isPremium && user.contractsUsed >= FREE_CONTRACT_LIMIT) {
      return res.status(403).json({
        message: `Free plan allows ${FREE_CONTRACT_LIMIT} contracts. Upgrade to Premium.`,
        upgradeRequired: true,
        used:  user.contractsUsed,
        limit: FREE_CONTRACT_LIMIT,
      });
    }

    const contractText = await generateNewTypeContract(type, formData, language);

    // Persist to Contract collection (reuse existing model; Mixed formData handles extra types)
    const contract = await Contract.create({
      user:     req.user,
      type,                       // stored as-is; enum not enforced for custom
      title:    `${NEW_CONTRACT_TYPES[type]} — ${new Date().toLocaleDateString('en-IN')}`,
      formData,
      content:  contractText,
      language,
    });

    await User.findByIdAndUpdate(req.user, { $inc: { contractsUsed: 1 } });

    res.status(201).json({
      contractId: contract._id,
      title:      contract.title,
      content:    contractText,
      usage: {
        used:  user.contractsUsed + 1,
        limit: FREE_CONTRACT_LIMIT,
        isPremium: user.isPremium,
      },
    });
  } catch (err) {
    console.error('generateNewContract error:', err.message);
    res.status(500).json({ message: 'Contract generation failed', error: err.message });
  }
};

module.exports = { polishClauseHandler, generateNewContract };
