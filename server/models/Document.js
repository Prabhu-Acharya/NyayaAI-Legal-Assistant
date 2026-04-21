// server/models/Document.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: { type: String, required: true },
    storedName:   { type: String, required: true },
    mimeType:     { type: String, required: true },   // application/pdf | application/vnd.openxmlformats...
    sizeBytes:    { type: Number, required: true },

    // parsed raw text (stripped from PDF/DOCX)
    extractedText: { type: String, default: "" },

    // Groq analysis output
    analysis: {
      summary:       { type: String, default: "" },
      keyFindings:   [{ type: String }],
      riskFlags:     [{ type: String }],
      recommendations: [{ type: String }],
      rawResponse:   { type: String, default: "" },   // full Groq JSON, useful for debugging
    },

    // 0–100 score; null until analysed
    riskScore: { type: Number, min: 0, max: 100, default: null },

    // low | medium | high | critical
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical", "pending"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["uploaded", "parsing", "analysing", "done", "error"],
      default: "uploaded",
    },

    errorMessage: { type: String, default: "" },

    // premium-only field: full downloadable report path/URL
    reportUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// derive riskLevel from riskScore before save
documentSchema.pre("save", function (next) {
  if (this.riskScore !== null) {
    if      (this.riskScore >= 75) this.riskLevel = "critical";
    else if (this.riskScore >= 50) this.riskLevel = "high";
    else if (this.riskScore >= 25) this.riskLevel = "medium";
    else                           this.riskLevel = "low";
  }
  next();
});

const Document = mongoose.model("Document", documentSchema);
export default Document;