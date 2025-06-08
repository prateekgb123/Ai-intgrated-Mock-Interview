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

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---- User Authentication ----
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

// ---- Default Questions for Fallback & to provide correct answers to Gemini ----
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

// ---- API: Get Questions for a Round ----
app.get('/questions', async (req, res) => {
  try {
    const { round = "aptitude", count = 6 } = req.query;
    // Gemini API for generating questions (uncomment to use Gemini in production):
    /*
    const prompt = `Generate ${count} ${round} interview questions in the following JSON format:
    [{"type":"mcq" or "text" or "code","question":"...","options":["..."] (if mcq), "correct": "if applicable"}]`;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    let questions = [];
    try {
      questions = JSON.parse(result.response.text().trim());
    } catch {
      questions = defaultQuestions[round]?.slice(0, Number(count)) || [];
    }
    */
    // Fallback to hardcoded questions
    const questions = defaultQuestions[round]?.slice(0, Number(count)) || [];
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ---- API: Gemini-powered Interview Feedback for All Rounds ----
app.post('/interview/feedback', async (req, res) => {
  try {
    const { rounds } = req.body;
    // rounds: [{round, questions:[], types:[], answers:[]}]

    // Attach correct answers for MCQ/text if available
    const roundsWithCorrect = rounds.map((r, i) => {
      // Try to find correct answers from your defaultQuestions (if exists)
      const correctArray = (defaultQuestions[r.round] || []).map(q => q.correct || null);
      return {
        ...r,
        correct: correctArray
      };
    });

    // Compose an explicit, structured prompt for Gemini
    const prompt = `
    You are an expert technical interviewer for software roles. For each round, each question, and each answer, carefully check the correctness (use the 'correct' field if provided), then give constructive, concise feedback. For multiple choice or factual questions, also say if it's correct/incorrect and show the right answer if wrong. For open-ended questions, give suggestions for improvement. At the end, decide if the candidate should be "Selected" or "Not Selected" overall. Output a JSON object like: {"feedbacks":[["...","..."],["..."]...],"result":"Selected" or "Not Selected"}.

     Rounds:
${roundsWithCorrect.map((r) => `
Round: ${r.round}
${r.questions.map((q, j) =>
  `Q${j+1}: ${q}\nType: ${r.types[j]}\nAnswer: ${r.answers[j]}\n${r.correct[j] ? `Correct: ${r.correct[j]}` : ''}\n`
).join('')}
`).join('')}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);

    const rawText = result.response.text().trim();
    console.log("Gemini raw output:", rawText);

    let responseJSON;
    try {
      responseJSON = JSON.parse(rawText);
    } catch (e) {
      // Try to extract JSON if Gemini adds text before/after
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        responseJSON = JSON.parse(match[0]);
      } else {
        return res.status(500).json({ error: "Gemini did not return valid JSON feedback." });
      }
    }

    if (!responseJSON.feedbacks || !responseJSON.result) {
      return res.status(500).json({ error: "Gemini did not return expected feedback or result." });
    }

    res.json({
      feedbacks: responseJSON.feedbacks,
      result: responseJSON.result
    });

  } catch (err) {
    console.error('Gemini batch feedback error:', err);
    res.status(500).json({ error: 'Failed to generate feedback. Please try again.' });
  }
});

// ---- (Optional) Single Question Feedback ----
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

// ---- (Optional) Single Question Ask/Answer/History ----
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

// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));