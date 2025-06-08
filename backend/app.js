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
import { GoogleGenerativeAI } from "@google/generative-ai";


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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


app.post('/feedback', async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Please provide question and answer." });
    }

    const prompt = `You are an AI interviewer. Provide constructive and detailed feedback on the following response.\n\nQuestion: ${question}\nAnswer: ${answer}\n\nFeedback:`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const feedback = result.response.text().trim();

    res.json({ feedback });

  } catch (error) {
    console.error('Gemini feedback error:', error);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));