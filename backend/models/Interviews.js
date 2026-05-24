const mongoose = require("mongoose");

const interviewSchema =
  new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    company: String,

    role: String,

    interviewType: {
      type: String,
      enum: [
        "HR",
        "Technical",
        "Coding",
        "System Design",
      ],
    },

    question: String,

    answer: String,

    feedback: String,

    score: Number,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

module.exports = mongoose.model(
  "Interviews",
  interviewSchema
);