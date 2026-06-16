const jwt     = require("jsonwebtoken");
const Contract = require("../models/Contract");
const User    = require("../models/User");
const logger  = require("../config/logger");
const PDFDocument = require("pdfkit");
const fs      = require("fs");
const path    = require("path");
const {
  CONTRACT_TEMPLATES,
  generateContractText,
  scoreContract,
  streamContractPDF,
  buildContractDOCX,
  sanitizeFilename,
} = require("../services/contractAI.service");
const { polishClauseHandler, generateNewContract } = require("./contractController.week9");
const FREE_CONTRACT_LIMIT = 3;
const FONT_PATH = path.join(__dirname, "../fonts/NotoSans-Regular.ttf");

const protectExport = (req, res, next) => {
  const token = (req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1] : null) || req.query.token;
  if (!token) return res.status(401).json({ message: "Not authorized ❌" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; next();
  } catch { return res.status(401).json({ message: "Invalid token ❌" }); }
};

const generateContract = async (req, res) => {
  try {
    const { type, formData, language = "english" } = req.body;
    if (!type || !CONTRACT_TEMPLATES[type]) return res.status(400).json({ message: "Invalid contract type." });
    if (!formData) return res.status(400).json({ message: "Form data is required." });
    const user = await User.findById(req.user);
    if (!user) return res.status(401).json({ message: "User not found." });
    const now = new Date(); const resetDate = new Date(user.usageResetDate);
    if (now.getFullYear() > resetDate.getFullYear() || now.getMonth() > resetDate.getMonth()) {
      user.contractsUsed = 0; user.usageResetDate = now; await user.save();
    }
    if (!user.isPremium && user.contractsUsed >= FREE_CONTRACT_LIMIT) {
      return res.status(403).json({ message: `Free plan allows ${FREE_CONTRACT_LIMIT} contracts.`, upgradeRequired: true, used: user.contractsUsed, limit: FREE_CONTRACT_LIMIT });
    }
    const contractText = await generateContractText(type, formData, language);
    const contract = await Contract.create({ user: req.user, type, title: `${CONTRACT_TEMPLATES[type]} - ${new Date().toLocaleDateString("en-IN")}`, formData, content: contractText, language });
    await User.findByIdAndUpdate(req.user, { $inc: { contractsUsed: 1 } });
    res.status(201).json({ contractId: contract._id, title: contract.title, content: contractText, usage: { used: user.contractsUsed + 1, limit: FREE_CONTRACT_LIMIT } });
  } catch (err) { logger.error(`generateContract failed — ${err.message}`); res.status(500).json({ message: err.message }); }
};

const listContracts = async (req, res) => {
  try { const contracts = await Contract.find({ user: req.user }).sort({ createdAt: -1 }).select("_id type title createdAt"); res.json(contracts); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const getContract = async (req, res) => {
  try { const contract = await Contract.findOne({ _id: req.params.id, user: req.user }); if (!contract) return res.status(404).json({ message: "Not found." }); res.json(contract); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteContract = async (req, res) => {
  try { await Contract.findOneAndDelete({ _id: req.params.id, user: req.user }); res.json({ message: "Deleted." }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const exportPDF = async (req, res) => {
  try { const contract = await Contract.findOne({ _id: req.params.id, user: req.user }); if (!contract) return res.status(404).json({ message: "Not found." }); await streamContractPDF(contract, res); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const exportDOCX = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });
    const buffer = await buildContractDOCX(contract);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizeFilename(contract.title)}.docx"`);
    res.send(buffer);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getContractScore = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });
    if (contract.riskScore?.total != null) return res.json(contract.riskScore);
    const score = await scoreContract(contract.content);
    await Contract.findByIdAndUpdate(req.params.id, { riskScore: score });
    res.json(score);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Week 9: Export PDF with embedded e-signature ──────────────────────────────
const exportPDFSigned = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user });
    if (!contract) return res.status(404).json({ message: "Not found." });

    const { signatureDataUrl } = req.body;
    let sigBuffer = null;
    if (signatureDataUrl && signatureDataUrl.startsWith("data:image/png;base64,")) {
      sigBuffer = Buffer.from(signatureDataUrl.split(",")[1], "base64");
    }

    const isLatin = !contract.language || contract.language === "english";
    const bodyFont = isLatin ? "Helvetica" : "NotoSans";
    const boldFont = isLatin ? "Helvetica-Bold" : "NotoSans";

    const doc = new PDFDocument({ margin: 72, size: "A4", bufferPages: true });
    if (!isLatin && fs.existsSync(FONT_PATH)) doc.registerFont("NotoSans", FONT_PATH);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizeFilename(contract.title)}-signed.pdf"`);
    doc.pipe(res);

    // Header
    doc.font(boldFont).fontSize(18).fillColor("#1a1a2e").text("NyayaAI — Legal Document", { align: "center" });
    doc.moveDown(0.3);
    doc.font(boldFont).fontSize(14).fillColor("#16213e").text(contract.title, { align: "center" });
    doc.moveDown(0.3);
    doc.font(bodyFont).fontSize(9).fillColor("#666").text(`Generated: ${contract.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}  |  Governed by Indian Law`, { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(72, doc.y).lineTo(523, doc.y).strokeColor("#c9a84c").lineWidth(1).stroke();
    doc.moveDown(1);

    // Body
    doc.font(bodyFont).fontSize(10).fillColor("#111");
    contract.content.split("\n").forEach((line) => {
      const t = line.trim();
      if (!t) { doc.moveDown(0.4); return; }
      if (/^\d+\.\s/.test(t) && !/^\d+\.\d+/.test(t)) {
        doc.moveDown(0.5).font(boldFont).fontSize(11).fillColor("#1a1a2e").text(t, { paragraphGap: 4 });
        doc.font(bodyFont).fontSize(10).fillColor("#111");
      } else if (/^\d+\.\d+/.test(t)) {
        doc.font(bodyFont).fontSize(10).fillColor("#333").text(t, { indent: 20, paragraphGap: 3 });
      } else {
        doc.font(bodyFont).fontSize(10).fillColor("#111").text(t, { paragraphGap: 3 });
      }
    });

    // Signature block
    doc.moveDown(2);
    doc.moveTo(72, doc.y).lineTo(523, doc.y).strokeColor("#c9a84c").lineWidth(0.5).stroke();
    doc.moveDown(0.5);
    doc.font(boldFont).fontSize(11).fillColor("#1a1a2e").text("E-Signature");
    doc.moveDown(0.5);
    if (sigBuffer) {
      try { doc.image(sigBuffer, { width: 200, height: 70 }); }
      catch (e) { doc.font(bodyFont).fontSize(10).fillColor("#999").text("[Signature could not be rendered]"); }
    } else {
      doc.font(bodyFont).fontSize(10).fillColor("#999").text("[No signature provided]");
    }
    doc.moveDown(0.5);
    doc.font(bodyFont).fontSize(9).fillColor("#666").text(`Signed on: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);

    // Footer
    doc.flushPages();
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.font(bodyFont).fontSize(8).fillColor("#999").text(`NyayaAI — Page ${i + 1} | AI-generated. Review with a qualified advocate before execution.`, 72, doc.page.height - 40, { align: "center", width: doc.page.width - 144 });
    }
    doc.end();
  } catch (err) {
    logger.error(`exportPDFSigned failed — ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  protectExport, generateContract, listContracts, getContract, deleteContract,
  exportPDF, exportDOCX, getContractScore,
  polishClauseHandler, generateNewContract,
  exportPDFSigned,
};