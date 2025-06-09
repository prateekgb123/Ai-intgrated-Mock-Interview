import mongoose from "mongoose";

const InterviewHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  result: { type: String, enum: ["Selected", "Not Selected"], required: true },
  feedbacks: { type: Array }, // Optionally store feedbacks
  rounds: { type: Array }     // Optionally store questions/answers
});

export default mongoose.model("InterviewHistory", InterviewHistorySchema);