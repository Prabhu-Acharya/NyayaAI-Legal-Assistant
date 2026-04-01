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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);