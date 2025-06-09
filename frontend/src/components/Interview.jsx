import React, { useEffect, useState } from "react";
import './Interview.css'; // Import the external stylesheet

function renderPointwise(feedback) {
  if (!feedback) return null;
  const points = feedback
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^(\d+\.|-|\*)\s+/.test(line));
  if (points.length === 0) {
    return (
      <ul>
        {feedback.split('. ').map((item, i) =>
          item.trim() && <li key={i}>{item.trim()}</li>
        )}
      </ul>
    );
  }
  return (
    <ul>
      {points.map((item, i) => (
        <li key={i}>{item.replace(/^(\d+\.|-|\*)\s+/, '')}</li>
      ))}
    </ul>
  );
}

const ROUNDS = [
  { key: "aptitude", label: "Aptitude Round" },
  { key: "coding", label: "Coding Round" },
  { key: "technical", label: "Technical Round" },
  { key: "hr", label: "HR Round" }
];

const QUESTIONS_PER_ROUND = 6;

function OnlineMockInterview() {
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState([[], [], [], []]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([[], [], [], []]);
  const [feedbacks, setFeedbacks] = useState([[], [], [], []]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [allFeedback, setAllFeedback] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchRoundQuestions(roundKey) {
      const url = `http://localhost:5000/questions?round=${roundKey}&count=${QUESTIONS_PER_ROUND}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        return data.questions && Array.isArray(data.questions)
          ? data.questions.slice(0, QUESTIONS_PER_ROUND)
          : [];
      } catch {
        // Fallback questions omitted here for brevity
        return [];
      }
    }

    (async () => {
      setLoading(true);
      const results = await Promise.all(ROUNDS.map(r => fetchRoundQuestions(r.key)));
      setQuestions(results);
      setAnswers(results.map(qs => Array(qs.length).fill("")));
      setFeedbacks(results.map(qs => Array(qs.length).fill("")));

      setLoading(false);
    })();
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setAnswers(a => {
      const copy = a.map(arr => [...arr]);
      copy[round][current] = val;
      return copy;
    });
  }

  function handleMCQ(opt) {
    setAnswers(a => {
      const copy = a.map(arr => [...arr]);
      copy[round][current] = opt;
      return copy;
    });
  }

  function handleNext() {
    if (current < QUESTIONS_PER_ROUND - 1) {
      setCurrent(current + 1);
    } else if (round < ROUNDS.length - 1) {
      setRound(round + 1);
      setCurrent(0);
    } else {
      setCompleted(true);
      handleGetAllFeedback();
    }
  }

  function handleRestart() {
    setAnswers(questions.map(qs => Array(qs.length).fill("")));
    setFeedbacks(questions.map(qs => Array(qs.length).fill("")));
    setCurrent(0);
    setRound(0);
    setCompleted(false);
    setAllFeedback(null);
    setResult(null);
  }

  async function handleGetAllFeedback() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rounds: ROUNDS.map((r, i) => ({
            round: r.key,
            questions: questions[i].map(q => q.question),
            types: questions[i].map(q => q.type),
            answers: answers[i]
          }))
        })
      });
      const data = await res.json();
      if (data.feedbacks) setFeedbacks(data.feedbacks);
      if (data.result) setResult(data.result);
      setAllFeedback(data.feedbacks);
    } catch {
      setFeedbacks([
        questions[0].map(() => "Feedback: Good attempt."),
        questions[1].map(() => "Feedback: Satisfactory."),
        questions[2].map(() => "Feedback: Needs improvement."),
        questions[3].map(() => "Feedback: Well answered.")
      ]);
      setResult(Math.random() > 0.4 ? "Selected" : "Not Selected");
    }
    setLoading(false);
  }

  if (loading) return <div className="container"><h2>Loading questions...</h2></div>;

  if (completed) {
    return (
      <div className="container">
        <h2 className="round-header">Interview Complete!</h2>
        <div className="card">
          <h3>Final Result: {result}</h3>
          {feedbacks.map((roundFeedback, roundIdx) => (
            <div key={roundIdx}>
              <h4>{ROUNDS[roundIdx].label}</h4>
              <ol>
                {roundFeedback.map((fb, qIdx) => (
                  <li key={qIdx}>{Array.isArray(fb) ? fb.join(" ") : fb}</li>
                ))}
              </ol>
            </div>
          ))}
          <button onClick={handleRestart} className="button">Restart Interview</button>
        </div>
      </div>
    );
  }

  const q = questions[round][current];
  const progress = round * QUESTIONS_PER_ROUND + current + 1;
  const total = ROUNDS.length * QUESTIONS_PER_ROUND;
  const progressPercent = Math.round((progress / total) * 100);

  return (
    <div className="container">
      <div className="round-header">
        {ROUNDS[round].label}: Question {current + 1} of {QUESTIONS_PER_ROUND}
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="card animated-fade">
        <p className="question"><strong>Question:</strong> {q.question}</p>
        {q.type === "mcq" ? (
          <div className="mcq-group">
            {q.options.map(opt => (
              <button
                key={opt}
                onClick={() => handleMCQ(opt)}
                className="mcq-option"
                style={{
                  backgroundColor: answers[round][current] === opt ? "#007bff" : "#f5f5f5",
                  color: answers[round][current] === opt ? "#fff" : "#222"
                }}
                disabled={loading}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            rows={q.type === "code" ? 7 : 5}
            placeholder="Type your answer here..."
            value={answers[round][current]}
            onChange={handleChange}
            className="textarea"
            disabled={loading}
          />
        )}
        <button
          onClick={handleNext}
          disabled={loading || !answers[round][current]?.trim()}
          className="button"
        >
          {round === ROUNDS.length - 1 && current === QUESTIONS_PER_ROUND - 1
            ? 'Finish Interview'
            : 'Next Question'}
        </button>
        <div style={{ marginTop: '1rem', fontSize: '0.98rem', color: '#888' }}>
          Feedback will be provided after completion of all rounds.
        </div>
      </div>
    </div>
  );
}

export default OnlineMockInterview;
