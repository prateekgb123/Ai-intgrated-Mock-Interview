import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import connectDB from './config/db.js';
import Interview from './models/Interviews.js';
import axios from 'axios';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const user = new User({ username, email, password });
  await user.save();
  res.send('User registered');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send('User not found. Please signup first!');
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, username: user.username, userId: user._id });
  } else {
    res.status(401).send('Invalid credentials');
  }
});
const sampleQuestions = [
  'Tell me about yourself.',
  'Why do you want this job?',
  'Describe a challenge you faced.',
];

app.post('/ask', (req, res) => {
  const question = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
  res.json({ question });
});

app.post('/answer', async (req, res) => {
  const { userId, question, answer } = req.body;
  const feedback = `Your response to "${question}" was detailed and relevant.`;
  const interview = new Interview({ userId, question, answer, feedback });
  await interview.save();
  res.json({ feedback });
});

app.get('/history/:userId', async (req, res) => {
  const interviews = await Interview.find({ userId: req.params.userId });
  res.json(interviews);
});

// ---------- Gemini Feedback Endpoint ----------
app.post('/feedback', async (req, res) => {
  const { question, answer } = req.body;

  try {
    const prompt = `You are an interview feedback bot.\nQuestion: ${question}\nAnswer: ${answer}\nGive constructive feedback for the answer.`;
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );
    // LOG THE FULL RESPONSE HERE:
    console.log("Gemini raw response:", JSON.stringify(geminiResponse.data, null, 2));

    let aiFeedback = "Sorry, could not generate feedback.";
    if (
      geminiResponse.data &&
      Array.isArray(geminiResponse.data.candidates) &&
      geminiResponse.data.candidates[0]?.content?.parts?.[0]?.text
    ) {
      aiFeedback = geminiResponse.data.candidates[0].content.parts[0].text;
    }

    res.json({ feedback: aiFeedback });
  } catch (error) {
    console.error("Gemini API error:", error.message, error.response?.data);
    res.status(500).json({ error: "AI feedback failed" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));