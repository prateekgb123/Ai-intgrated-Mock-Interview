import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: String,
  question: String,
  answer: String,
  feedback: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Interviews', interviewSchema);