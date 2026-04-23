const jwt = require("jsonwebtoken");
const Contract = require("../models/Contract");
const User = require("../models/User");
const logger = require("../config/logger");
const {
  CONTRACT_TEMPLATES,
  generateContractText,
  scoreContract,
  streamContractPDF,
  buildContractDOCX,
  sanitizeFilename,
} = require("../services/contractAI.service");
const FREE_CONTRACT_LIMIT = 3;

const protectExport = (req, res, next) => {
  const token =
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null) || req.query.token;

  if (!token)
    return res.status(401).json({ message: "Not authorized — no token provided ❌" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized — invalid or expired token ❌" });
  }
};

const generateContract = async (req, res) => {
  try {
    const { type, formData, language = "english" } = req.body;

    if (!type || !CONTRACT_TEMPLATES[type])
      return res.status(400).json({ message: "Invalid contract type." });
    if (!formData)
      return res.status(400).json({ message: "Form data is required." });

    const user = await User.findById(req.user);
    if (!user) return res.status(401).json({ message: "User not found." });

    // ── Auto-reset usage if a new month has started ───────────────────────
    const now = new Date();
    const resetDate = new Date(user.usageResetDate);
    if (now.getFullYear() > resetDate.getFullYear() || now.getMonth() > resetDate.getMonth()) {
      user.contractsUsed = 0;
      user.usageResetDate = now;
      await user.save();
    }
    // ─────────────────────────────────────────────────────────────────────

    if (!user.isPremium && user.contractsUsed >= FREE_CONTRACT_LIMIT) {
      return res.status(403).json({
        message: `Free plan allows ${FREE_CONTRACT_LIMIT} contracts. Upgrade to Premium for unlimited access.`,
        upgradeRequired: true,
        used: user.contractsUsed,
        limit: FREE_CONTRACT_LIMIT,
      });
    }

    const contractText = await generateContractText(type, formData, language);

    const contract = await Contract.create({
      user: req.user,
      type,
      title: `${CONTRACT_TEMPLATES[type]} - ${new Date().toLocaleDateString("en-IN")}`,
      formData,
      content: contractText,
      language,
    });

    await User.findByIdAndUpdate(req.user, { $inc: { contractsUsed: 1 } });

    res.status(201).json({
      contractId: contract._id,
      title: contract.title,
      content: contractText,
      usage: {
        used: user.contractsUsed + 1,
        limit: FREE_CONTRACT_LIMIT,
      },
    });
  } catch (err) {
    logger.error(`generateContract failed — user:${req.user} — ${err.message}`);
    res.status(500).json({ message: err.message || "Generation failed." });
  }
};

const listContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ user: req.user })
      .sort({ createdAt: -1 })
      .select("_id type title createdAt");
    res.json(contracts);
  } catch (err) {
    logger.error(`listContracts failed — user:${req.user} — ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

const getContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });
    res.json(contract);
  } catch (err) {
    logger.error(`getContract failed — contract:${req.params.id} — ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

const deleteContract = async (req, res) => {
  try {
    await Contract.findOneAndDelete({ _id: req.params.id, user: req.user });
    res.json({ message: "Deleted." });
  } catch (err) {
    logger.error(`deleteContract failed — contract:${req.params.id} — ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

const exportPDF = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });
    await streamContractPDF(contract, res);
  } catch (err) {
    logger.error(`exportPDF failed — contract:${req.params.id} — ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

const exportDOCX = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });

    const buffer = await buildContractDOCX(contract);

    res.setHeader("Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition",
      `attachment; filename="${sanitizeFilename(contract.title)}.docx"`);
    res.send(buffer);
  } catch (err) {
    logger.error(`exportDOCX failed — contract:${req.params.id} — ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

// Add new controller:
const getContractScore = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });

    // Return cached score if exists
    if (contract.riskScore?.total != null) {
      return res.json(contract.riskScore);
    }

    const score = await scoreContract(contract.content);

    await Contract.findByIdAndUpdate(req.params.id, { riskScore: score });

    res.json(score);
  } catch (err) {
    logger.error(`getContractScore failed — contract:${req.params.id} — ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  protectExport,
  generateContract,
  listContracts,
  getContract,
  deleteContract,
  exportPDF,
  exportDOCX,
  getContractScore,
};