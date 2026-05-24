const mongoose = require("mongoose");

const ResumeSchema =
  new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fileName: String,

    extractedText: String,

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  });

module.exports = mongoose.model(
  "Resume",
  ResumeSchema
);