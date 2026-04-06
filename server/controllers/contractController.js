// ─────────────────────────────────────────────────────────────────────────────
// contractController.js
// Responsibilities:
//   • Route handler functions (generate, list, getOne, remove, exportPDF, exportDOCX)
//   • Premium gate enforcement
//   • protectExport middleware (token via ?token= query for window.open exports)
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const Contract = require("../models/Contract");
const User = require("../models/User");
const {
  CONTRACT_TEMPLATES,
  generateContractText,
  streamContractPDF,
  buildContractDOCX,
  sanitizeFilename,
} = require("../services/contractAI.service");

const FREE_CONTRACT_LIMIT = 3;

// ── protectExport ─────────────────────────────────────────────────────────────
// window.open() cannot send Authorization headers, so export routes accept the
// JWT as a ?token= query param in addition to the standard Bearer header.
const protectExport = (req, res, next) => {
  const token =
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null) || req.query.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized — no token provided ❌" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized — invalid or expired token ❌" });
  }
};

// ── POST /api/contracts/generate ─────────────────────────────────────────────
const generateContract = async (req, res) => {
  try {
    const { type, formData } = req.body;

    if (!type || !CONTRACT_TEMPLATES[type])
      return res.status(400).json({ message: "Invalid contract type." });
    if (!formData)
      return res.status(400).json({ message: "Form data is required." });

    const user = await User.findById(req.user);
    if (!user) return res.status(401).json({ message: "User not found." });

    // Premium gate — uses contractsUsed counter (no extra query)
    if (!user.isPremium && user.contractsUsed >= FREE_CONTRACT_LIMIT) {
      return res.status(403).json({
        message: `Free plan allows ${FREE_CONTRACT_LIMIT} contracts. Upgrade to Premium for unlimited access.`,
        upgradeRequired: true,
        used:  user.contractsUsed,
        limit: FREE_CONTRACT_LIMIT,
      });
    }

    const contractText = await generateContractText(type, formData);

    const contract = await Contract.create({
      user:    req.user,
      type,
      title:   `${CONTRACT_TEMPLATES[type]} - ${new Date().toLocaleDateString("en-IN")}`,
      formData,
      content: contractText,
    });

    // Increment usage counter after successful generation
    await User.findByIdAndUpdate(req.user, { $inc: { contractsUsed: 1 } });

    res.status(201).json({
      contractId: contract._id,
      title:      contract.title,
      content:    contractText,
      usage: {
        used:  user.contractsUsed + 1,
        limit: FREE_CONTRACT_LIMIT,
      },
    });
  } catch (err) {
    console.error("Contract generation error:", err);
    res.status(500).json({ message: err.message || "Generation failed." });
  }
};

// ── GET /api/contracts ────────────────────────────────────────────────────────
const listContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ user: req.user })
      .sort({ createdAt: -1 })
      .select("_id type title createdAt");
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/contracts/:id ────────────────────────────────────────────────────
const getContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/contracts/:id ─────────────────────────────────────────────────
const deleteContract = async (req, res) => {
  try {
    await Contract.findOneAndDelete({ _id: req.params.id, user: req.user });
    res.json({ message: "Deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/contracts/:id/export/pdf ─────────────────────────────────────────
const exportPDF = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });
    streamContractPDF(contract, res);
  } catch (err) {
    console.error("PDF export error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/contracts/:id/export/docx ───────────────────────────────────────
const exportDOCX = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });

    const buffer = await buildContractDOCX(contract);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${sanitizeFilename(contract.title)}.docx"`
    );
    res.send(buffer);
  } catch (err) {
    console.error("DOCX export error:", err);
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
};