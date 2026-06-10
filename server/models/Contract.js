const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "employment", "service", "nda", "rental",
        "sale", "partnership", "freelance", "loan",
        "cofounder", "terms", "privacy", "legal_notice",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "english",
      enum: ["english", "hindi", "marathi", "tamil", "telugu", "bengali", "gujarati", "kannada"],
    },
    riskScore: {
      type: {
        total: Number,
        enforceability: Number,
        clarity: Number,
        balance: Number,
        completeness: Number,
        compliance: Number,
        summary: String,
      },
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);