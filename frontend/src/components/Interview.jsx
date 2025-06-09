import React, { useEffect, useState } from "react";
import './Interview.css';

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
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

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
    setResult(null);
    setError("");
  }

  async function fetchHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    setShowHistory(true);
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch(`http://localhost:5000/interview/history/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setHistoryError("Could not load history.");
      setHistory([]);
    }
    setHistoryLoading(false);
  }

  async function handleGetAllFeedback() {
    setLoading(true);
    setError("");
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch("http://localhost:5000/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          rounds: ROUNDS.map((r, i) => ({
            round: r.key,
            questions: questions[i].map(q => q.question),
            types: questions[i].map(q => q.type),
            answers: answers[i]
          }))
        })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResult("Not Selected");
        setLoading(false);
        return;
      }
      if (data.feedbacks) setFeedbacks(data.feedbacks);
      if (data.result) setResult(data.result);
    } catch (err) {
      setError("Could not get AI feedback. Please try again later.");
      setResult("Not Selected");
    }
    setLoading(false);
  }

  if (loading) return <div className="container"><h2>Loading questions...</h2></div>;

  if (completed) {
    return (
      <div className="container">
        <h2 className="round-header">Interview Complete!</h2>
        <div className="card">
          {error && <div className="error-message" style={{color:'red',marginBottom:10}}>{error}</div>}
          <h3>Final Result: {result}</h3>
          {feedbacks.map((roundFeedback, roundIdx) => (
            <div key={roundIdx}>
              <h4>{ROUNDS[roundIdx].label}</h4>
              <ol>
                {(roundFeedback || []).map((fb, qIdx) => {
                  let your = fb, correct = "";
                  const splitIdx = fb.indexOf("Correct Answer:");
                  if (splitIdx !== -1) {
                    your = fb.substring(0, splitIdx).replace("Your Answer:", "").trim();
                    correct = fb.substring(splitIdx + "Correct Answer:".length).trim();
                  }
                  return (
                    <li key={qIdx} style={{ marginBottom: "1.2em" }}>
                      <div style={{marginLeft: "0"}}><b>Your Answer:</b> {your}</div>
                      <div style={{marginLeft: "0"}}><b>Correct Answer:</b> {correct}</div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
          <button onClick={handleRestart} className="button">Restart Interview</button>
          <button onClick={fetchHistory} className="button" style={{marginLeft:10}}>View History</button>
          {showHistory && (
            <div className="history-modal" style={{
              background: "#fff", border: "1px solid #ccc", padding: "1em", marginTop: "2em"
            }}>
              <h3>Interview History</h3>
              {historyLoading && <div>Loading...</div>}
              {historyError && <div style={{color:"red"}}>{historyError}</div>}
              {history.length === 0 && !historyLoading && !historyError && (
                <div>No previous interviews found.</div>
              )}
              {history.length > 0 && (
                <ul>
                  {history.map(h => (
                    <li key={h._id || h.date}>
                      <b>Date:</b> {new Date(h.date).toLocaleString()}<br/>
                      <b>Result:</b> {h.result}
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => setShowHistory(false)} className="button" style={{marginTop:10}}>Close</button>
            </div>
          )}
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