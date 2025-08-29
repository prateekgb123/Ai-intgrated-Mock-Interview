import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
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
    'http://localhost:5173',
    'https://ai-intgrated-mock-interview-frontend.onrender.com',
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

    // Hash the password before saving!
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
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
    { type: "mcq", question: "Pointing to a man, Ravi said, 'He is the son of my grandfather’s only son.' How is the man related to Ravi?", options: ["Brother", "Father", "Cousin", "Uncle"], correct: "Brother" },
    { type: "mcq", question: "If 1st January 2025 is Wednesday, what day will 1st January 2026 be?", options: ["Thursday", "Friday", "Saturday", "Sunday"], correct: "Friday" },
    { type: "mcq", question: "At 3:15, the angle between hour and minute hand of a clock is?", options: ["7.5°", "0°", "90°", "52.5°"], correct: "7.5°" },
    { type: "mcq", question: "Square root of 144?", options: ["10", "11", "12", "14"], correct: "12" },
    { type: "mcq", question: "Next in series: 5, 10, 20, 40, ?", options: ["60", "70", "80", "100"], correct: "80" }
  ],
  coding: [
    {
      type: "code",
      question: "Write a JS function to reverse a string.",
      language: "javascript",
      // Signature without curly braces, LeetCode-style:
      signature: "function reverseString(str){",
      testCases: [
        { input: "hello", expectedOutput: "olleh" },
        { input: "world", expectedOutput: "dlrow" }
      ]
    },
    {
      type: "code",
      question: "Write a function to check if a number is prime.",
      language: "javascript",
      signature: "function isPrime(num){",
      testCases: [
        { input: "2", expectedOutput: "true" },
        { input: "4", expectedOutput: "false" },
        { input: "17", expectedOutput: "true" }
      ]
    }
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
app.get('/questions', async (req, res) => {
  try {
    const { round = "aptitude", count = 6 } = req.query;

    let questions = defaultQuestions[round] || [];

    if (round === "aptitude" || round === "technical") {
      questions = questions.filter(q => q.type === "mcq");
    }
    if (round === "coding") {
      questions = questions.filter(q => q.type === "code");
    }
    if (round === "hr") {
      questions = questions.filter(q => q.type === "text" || q.type === "mcq");
    }

    questions = questions.slice(0, Number(count));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ---------- LIVE CODING JUDGE (JUDGE0) ----------
// LeetCode-style: receives functionBody, signature, language, testCases
const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  // Add more as needed
};

// Utility to wrap user code for LeetCode-style evaluation
function wrapCode(fullFunctionCode, input, language) {
  if (language === "javascript") {
    // Extract function name
    const match = fullFunctionCode.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
    const funcName = match ? match[1] : "func";
    return `
${fullFunctionCode}
console.log(${funcName}(${JSON.stringify(input)}));
`;
  }
  return fullFunctionCode;
}
app.post('/api/judge', async (req, res) => {
  const { sourceCode, language, testCases } = req.body;

  if (!sourceCode || !language || !Array.isArray(testCases)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const language_id = languageMap[language] || 63;
  const results = [];

  for (const tc of testCases) {
    try {
      const codeToRun = wrapCode(sourceCode, tc.input, language);
      // console.log('Code sent to Judge0:', codeToRun); // For debugging!
      const submission = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          source_code: codeToRun,
          language_id,
          stdin: ""
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );
      const output = submission.data.stdout || submission.data.stderr || submission.data.compile_output || '';
      results.push({
        input: tc.input,
        expected: tc.expectedOutput,
        actual: output.trim(),
        passed: output.trim() === tc.expectedOutput.trim()
      });
    } catch (err) {
      results.push({ input: tc.input, expected: tc.expectedOutput, actual: "Error", passed: false });
    }
  }
  res.json({ results });
});
// ---------- INTERVIEW FEEDBACK ----------
// Feedback endpoint
app.post('/interview/feedback', async (req, res) => {
  const { rounds } = req.body;

  try {
    const prompt = `
You are an interviewer. Evaluate the entire mock interview across multiple rounds.

For each round:
- Show the round name
- For each question: 
   - Question text
   - User Answer
   - Correct Answer (if given in data)
   - Mark Correct/Wrong

At the end:
- Give total score across all rounds
- Decide: "Selected" if >= 60% correct, otherwise "Not Selected"
`;

    // Format input for AI
    const formatted = rounds.map(r =>
      `\n=== ${r.round} ===\n` +
      r.questions.map((q, i) =>
        `Q${i+1}: ${q.question}\nType: ${q.type}\nCorrect: ${q.correct || "N/A"}\nUser Answer: ${r.answers[i] || "No Answer"}`
      ).join("\n\n")
    ).join("\n\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt + "\n\n" + formatted);

    const evaluation = result.response.text().trim();
    res.json({ evaluation });
  } catch (err) {
    console.error("Error in /interview/feedback:", err);
    res.status(500).json({ error: "Failed to generate feedback" });
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
