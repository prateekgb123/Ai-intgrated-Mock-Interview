// Interview.jsx
import React, { useEffect, useState } from "react";
import './Interview.css';

// Define how many questions each round should have
const ROUND_COUNTS = {
  aptitude: 10,
  coding: 2,
  technical: 10,
  hr: 5
};

function Interview({ roundKey, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  // Determine round type for rendering
  const getRoundType = () => {
    if (roundKey === "aptitude" || roundKey === "technical") return "mcq";
    if (roundKey === "coding") return "code";
    if (roundKey === "hr") return "text";
    return "text";
  };
  const roundType = getRoundType();

  useEffect(() => {
    async function fetchRoundQuestions() {
      const count = ROUND_COUNTS[roundKey] || 6; // fetch based on round
      const url = `http://localhost:3000/questions?round=${roundKey}&count=${count}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        let qs = data.questions || [];

        // Filter MCQs for aptitude & technical rounds
        if (roundKey === "aptitude" || roundKey === "technical") {
          qs = qs.filter(q => q.type === "mcq").slice(0, count);
        }

        setQuestions(qs);
        setAnswers(Array(qs.length).fill(""));
      } catch (err) {
        console.error("Error fetching questions:", err);
        setQuestions([]);
        setAnswers([]);
      }
      setLoading(false);
    }
    fetchRoundQuestions();
  }, [roundKey]);

  const handleChange = (e) => {
    const val = e.target.value;
    setAnswers(prev => {
      const copy = [...prev];
      copy[current] = val;
      return copy;
    });
  };

  const handleMCQ = (opt) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[current] = opt;
      return copy;
    });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setCompleted(true);
      onComplete(roundKey, answers, questions, questions.map(q => q.type));
    }
  };

  if (loading) return <div className="container"><h2>Loading {roundKey} questions...</h2></div>;

  if (completed) {
    return (
      <div className="container">
        <h2 className="round-header">{roundKey} Round Complete!</h2>
        <button onClick={() => onComplete(roundKey, answers, questions, questions.map(q => q.type))} className="button">
          Continue
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="container">
      <div className="round-header">
        {roundKey} Round: Question {current + 1} of {questions.length}
      </div>
      <div className="card animated-fade">
        <p className="question"><strong>Question:</strong> {q?.question}</p>

        {roundType === "mcq" ? (
          <div className="mcq-group">
            {q.options.map(opt => (
              <button
                key={opt}
                onClick={() => handleMCQ(opt)}
                className="mcq-option"
                style={{
                  backgroundColor: answers[current] === opt ? "#007bff" : "#f5f5f5",
                  color: answers[current] === opt ? "#fff" : "#222"
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : roundType === "code" ? (
          <textarea
            rows={10}
            placeholder="Write your code here..."
            value={answers[current]}
            onChange={handleChange}
            className="textarea code-editor"
          />
        ) : (
          <textarea
            rows={5}
            placeholder="Type your answer here..."
            value={answers[current]}
            onChange={handleChange}
            className="textarea"
          />
        )}

        <button
          onClick={handleNext}
          disabled={!answers[current]?.trim()}
          className="button"
        >
          {current === questions.length - 1 ? 'Finish Round' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

export default Interview;
