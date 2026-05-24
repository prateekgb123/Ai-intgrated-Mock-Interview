const mongoose = require("mongoose");

const InterviewHistorySchema =
  new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    result: {
      type: String,
      enum: ["Selected", "Not Selected"],
      required: true,
    },

    feedbacks: [
      {
        round: String,
        feedback: String,
        score: Number,
      },
    ],

    rounds: [
      {
        roundName: String,
        status: String,
        score: Number,
      },
    ],
  });

module.exports = mongoose.model(
  "InterviewHistory",
  InterviewHistorySchema
);