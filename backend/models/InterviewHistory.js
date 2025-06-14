import mongoose from "mongoose";

const InterviewHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  result: { type: String, enum: ["Selected", "Not Selected"], required: true },
  feedbacks: { type: Array }, 
  rounds: { type: Array }    
});

export default mongoose.model("InterviewHistory", InterviewHistorySchema);