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
  origin: ['https://ai-intgrated-mock-interview-frontend.onrender.com'],
  credentials: true,
}));
const QUESTIONS_PER_ROUND = 6; 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", username, password);

    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found. Please signup first!" });
    }

    console.log("Stored hash in DB:", user.password);

    // Always use bcrypt.compare (since signup hashes with bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

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



const defaultQuestions = {
  aptitude: [
    { type: "mcq", question: "If 3x + 5 = 20, what is x?", options: ["5", "4", "3", "15"], correct: "5" },
    { type: "mcq", question: "What is the next number in the series: 2, 4, 8, 16, ?", options: ["18", "20", "24", "32"], correct: "32" },
    { type: "text", question: "A train travels 60 km in 1.5 hours. What is its average speed?", correct: "40" },
    { type: "mcq", question: "Which is the odd one out? Apple, Orange, Banana, Potato", options: ["Apple", "Orange", "Banana", "Potato"], correct: "Potato" },
    { type: "mcq", question: "What is 25% of 80?", options: ["10", "15", "20", "25"], correct: "20" },
    { type: "text", question: "If a book costs $120 and is sold at a 20% discount, what is the selling price?", correct: "96" }
  ],
  coding: [
    { type: "code", question: "Write a JS function to reverse a string." },
    { type: "code", question: "Write a function to check if a number is prime." },
    { type: "code", question: "Write a function to find the maximum in an array." },
    { type: "mcq", question: "What is the output of: console.log(typeof null);", options: ["object", "null", "undefined", "number"], correct: "object" },
    { type: "code", question: "Write a function to calculate factorial of n." },
    { type: "mcq", question: "Which method is used to add elements to the end of an array in JS?", options: ["push()", "pop()", "shift()", "unshift()"], correct: "push()" }
  ],
  technical: [
    { type: "text", question: "Explain the concept of closures in JavaScript." },
    { type: "text", question: "What is the difference between == and === in JS?" },
    { type: "mcq", question: "Which HTML tag is used for inserting an image?", options: ["<img>", "<src>", "<image>", "<pic>"], correct: "<img>" },
    { type: "text", question: "Explain what is REST API." },
    { type: "mcq", question: "Which is not a CSS selector?", options: [".class", "#id", ":hover", "@media"], correct: "@media" },
    { type: "text", question: "What is the purpose of useEffect hook in React?" }
  ],
  hr: [
    { type: "text", question: "Tell me about yourself." },
    { type: "text", question: "Why do you want to join our company?" },
    { type: "text", question: "Describe a challenge you faced and how you overcame it." },
    { type: "mcq", question: "Are you comfortable with relocation?", options: ["Yes", "No"], correct: "Yes" },
    { type: "text", question: "Where do you see yourself in 5 years?" },
    { type: "text", question: "What are your strengths and weaknesses?" }
  ]
};


app.get('/questions', async (req, res) => {
  try {
    const { round = "aptitude", count = 6 } = req.query;
    const questions = defaultQuestions[round]?.slice(0, Number(count)) || [];
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

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
    if (Array.isArray(feedbacks) && feedbacks.length === 24 && Array.isArray(feedbacks[0])) {
      const formatted = feedbacks.map(fbArr =>
        `Your Answer: ${fbArr[0]}\nCorrect Answer: ${fbArr[1]}`
      );
      feedbacks = [];
      for (let i = 0; i < 24; i += 6) {
        feedbacks.push(formatted.slice(i, i + 6));
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
app.get('/interview/history/:userId', async (req, res) => {
  try {
    const history = await InterviewHistory.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interview history" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));