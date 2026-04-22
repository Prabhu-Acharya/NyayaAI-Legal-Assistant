const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName:  { type: String, required: true },
    storedName:    { type: String, required: true },
    mimeType:      { type: String, required: true },
    sizeBytes:     { type: Number, required: true },
    extractedText: { type: String, default: "" },
    analysis: {
      summary:         { type: String, default: "" },
      keyFindings:     [{ type: String }],
      riskFlags:       [{ type: String }],
      recommendations: [{ type: String }],
      rawResponse:     { type: String, default: "" },
    },
    riskScore: { type: Number, min: 0, max: 100, default: null },
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
    reportUrl:    { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);