import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import connectDB from './config/db.js';
import Interview from './models/Interviews.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import InterviewHistory from "./models/InterviewHistory.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173', // frontend local dev
    'https://ai-intgrated-mock-interview-frontend.onrender.com', // production frontend
  ],
  credentials: true,
}));

const QUESTIONS_PER_ROUND = 6; 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------- SIGNUP ----------
app.post('/signup', async (req, res) => {
  try {
    let { username, email, password } = req.body;
    username = username?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // DO NOT hash the password here!
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// ---------- LOGIN ----------
app.post('/login', async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username?.trim();
    password = password?.trim();

    if (!username || !password) {
      return res.status(400).json({ message: "Both username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please signup first!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, username: user.username, userId: user._id });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ---------- DEFAULT QUESTIONS ----------
const defaultQuestions = {
  aptitude: [
    { type: "mcq", question: "If 3x + 5 = 20, what is x?", options: ["5", "4", "3", "15"], correct: "5" },
    { type: "mcq", question: "Next number: 2, 4, 8, 16, ?", options: ["18", "20", "24", "32"], correct: "32" },
    { type: "mcq", question: "Odd one out: Apple, Orange, Banana, Potato", options: ["Apple", "Orange", "Banana", "Potato"], correct: "Potato" },
    { type: "mcq", question: "25% of 80?", options: ["10", "15", "20", "25"], correct: "20" },
    { type: "mcq", question: "12 + x = 25, x = ?", options: ["10", "12", "13", "15"], correct: "13" },
    
    // Blood relation question
    { type: "mcq", question: "Pointing to a man, Ravi said, 'He is the son of my grandfather’s only son.' How is the man related to Ravi?", options: ["Brother", "Father", "Cousin", "Uncle"], correct: "Brother" },
    
    // Calendar question
    { type: "mcq", question: "If 1st January 2025 is Wednesday, what day will 1st January 2026 be?", options: ["Thursday", "Friday", "Saturday", "Sunday"], correct: "Friday" },
    
    // Clock question
    { type: "mcq", question: "At 3:15, the angle between hour and minute hand of a clock is?", options: ["7.5°", "0°", "90°", "52.5°"], correct: "7.5°" },
    
    { type: "mcq", question: "Square root of 144?", options: ["10", "11", "12", "14"], correct: "12" },
    { type: "mcq", question: "Next in series: 5, 10, 20, 40, ?", options: ["60", "70", "80", "100"], correct: "80" }
  ],

  coding: [
    { type: "code", question: "Write a JS function to reverse a string." },
    { type: "code", question: "Write a function to check if a number is prime." }
  ],

  technical: [
    { type: "mcq", question: "HTML tag for image?", options: ["<img>", "<src>", "<image>", "<pic>"], correct: "<img>" },
    { type: "mcq", question: "Not a CSS selector?", options: [".class", "#id", ":hover", "@media"], correct: "@media" },
    { type: "mcq", question: "JS method to convert JSON to object?", options: ["JSON.parse()", "JSON.stringify()", "Object.fromJSON()", "JSON.object()"], correct: "JSON.parse()" },
    { type: "mcq", question: "useState returns?", options: ["State variable", "Function to update", "Both", "None"], correct: "Both" },
    { type: "mcq", question: "HTTP method to update data?", options: ["GET", "POST", "PUT", "DELETE"], correct: "PUT" },
    { type: "mcq", question: "CSS property to change text color?", options: ["font-color", "text-color", "color", "font-style"], correct: "color" },
    { type: "mcq", question: "JS keyword for block-scoped variable?", options: ["var", "let", "const", "dim"], correct: "let" },
    { type: "mcq", question: "Which HTML attribute specifies alternative text?", options: ["alt", "title", "src", "text"], correct: "alt" },
    { type: "mcq", question: "Which method adds element at start of array?", options: ["push()", "pop()", "shift()", "unshift()"], correct: "unshift()" },
    { type: "mcq", question: "Which CSS property changes element background?", options: ["color", "bgcolor", "background", "background-color"], correct: "background-color" }
  ],

  hr: [
    { type: "text", question: "Tell me about yourself." },
    { type: "text", question: "Why do you want to join our company?" },
    { type: "text", question: "Describe a challenge you faced and how you overcame it." },
    { type: "mcq", question: "Are you comfortable with relocation?", options: ["Yes", "No"], correct: "Yes" },
    { type: "text", question: "Where do you see yourself in 5 years?" }
  ]
};


// ---------- GET QUESTIONS ----------
// GET QUESTIONS
app.get('/questions', async (req, res) => {
  try {
    const { round = "aptitude", count = 6 } = req.query;

    let questions = defaultQuestions[round] || [];

    // Apply type filters
    if (round === "aptitude" || round === "technical") {
      questions = questions.filter(q => q.type === "mcq");
    }
    if (round === "coding") {
      questions = questions.filter(q => q.type === "code");
    }
    if (round === "hr") {
      questions = questions.filter(q => q.type === "text" || q.type === "mcq");
    }

    // Now slice AFTER filtering
    questions = questions.slice(0, Number(count));

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});
 
// ---------- INTERVIEW FEEDBACK ----------
app.post('/interview/feedback', async (req, res) => {
  try {
    const { rounds, userId } = req.body; 
    const roundsWithCorrect = rounds.map(r => {
      const correctArray = (defaultQuestions[r.round] || []).map(q => q.correct || null);
      return { ...r, correct: correctArray };
    });

    const prompt = `
      You are an expert technical interviewer for software roles. For each round, each question, and each answer, carefully check the correctness (use the 'correct' field if provided), then give constructive, concise feedback. For multiple choice or factual questions, also say if it's correct/incorrect and show the right answer if wrong. For open-ended questions, give suggestions for improvement. At the end, decide if the candidate should be "Selected" or "Not Selected" overall. Output a JSON object like: {"feedbacks":[["...","..."],["..."]...],"result":"Selected" or "Not Selected"}. Return the JSON directly, without extra text.

      Rounds:
      ${roundsWithCorrect.map((r) =>
        `Round: ${r.round}
        ${r.questions.map((q, j) =>
          `Q${j+1}: ${q}\nType: ${r.types[j]}\nAnswer: ${r.answers[j]}\n${r.correct[j] ? `Correct: ${r.correct[j]}` : ''}\n`
        ).join('')}
        `
      ).join('')}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);

    let rawText = result.response.text().trim();
    console.log("RAW GEMINI OUTPUT:", rawText);

    let responseJSON;
    try {
      responseJSON = JSON.parse(rawText);
    } catch (e) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          responseJSON = JSON.parse(match[0]);
        } catch (e2) {
          return res.status(500).json({ error: "Gemini returned unparseable JSON." });
        }
      } else {
        return res.status(500).json({ error: "Gemini did not return valid JSON feedback." });
      }
    }

    let feedbacks = responseJSON.feedbacks;
    // Format feedbacks per round dynamically
if (Array.isArray(feedbacks) && Array.isArray(feedbacks[0])) {
  const formatted = feedbacks.map(fbArr =>
    `Your Answer: ${fbArr[0]}\nCorrect Answer: ${fbArr[1]}`
  );

  feedbacks = [];
  let start = 0;
  for (const r of rounds) {
    const roundCount = r.questions.length;
    feedbacks.push(formatted.slice(start, start + roundCount));
    start += roundCount;
  }
}

    if (userId) {
      await InterviewHistory.create({
        userId,
        date: new Date(),
        result: responseJSON.result,
        feedbacks,
        rounds
      });
    }

    res.json({
      feedbacks,
      result: responseJSON.result
    });

  } catch (err) {
    console.error("Error in /interview/feedback:", err);
    res.status(500).json({ error: "Failed to generate feedback. Please try again." });
  }
});

// ---------- INTERVIEW HISTORY ----------
app.get('/interview/history/:userId', async (req, res) => {
  try {
    const history = await InterviewHistory.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interview history" });
  }
});

// ---------- SERVER START ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));