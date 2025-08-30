import React, { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import "./Interview.css";

const ROUND_COUNTS = {
  aptitude: 10,
  coding: 2,
  technical: 10,
  hr: 5,
};

function Interview({ roundKey, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [codeResult, setCodeResult] = useState(null);
  const [runningCode, setRunningCode] = useState(false);

  const getRoundType = () => {
    if (roundKey === "aptitude" || roundKey === "technical") return "mcq";
    if (roundKey === "coding") return "code";
    if (roundKey === "hr") return "text";
    return "text";
  };
  const roundType = getRoundType();

  useEffect(() => {
    async function fetchRoundQuestions() {
      const count = ROUND_COUNTS[roundKey] || 6;
      const url = `http://localhost:3000/questions?round=${roundKey}&count=${count}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        let qs = data.questions || [];
        if (roundKey === "aptitude" || roundKey === "technical") {
          qs = qs.filter(q => q.type === "mcq").slice(0, count);
        }
        setQuestions(qs);

        if (roundKey === "coding") {
          setAnswers(
            qs.map(
              (q) => `${q.signature || "function func() {"}\n  \n}`
            )
          );
        } else {
          setAnswers(Array(qs.length).fill(""));
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setQuestions([]);
        setAnswers([]);
      }
      setLoading(false);
    }
    fetchRoundQuestions();
  }, [roundKey]);

  const handleChange = (val) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = val;
      return copy;
    });
  };

  const handleMCQ = (opt) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = opt;
      return copy;
    });
  };

  const handleRunCode = async () => {
    setRunningCode(true);
    setCodeResult(null);
    const q = questions[current];
    try {
      const res = await axios.post("http://localhost:3000/api/judge", {
        sourceCode: answers[current],
        language: q.language || "javascript",
        testCases: q.testCases,
      });
      setCodeResult(res.data.results);
    } catch (err) {
      setCodeResult([{ error: "Error running code" }]);
    }
    setRunningCode(false);
  };

  const finishRound = () => {
    setCompleted(true);
  };

  if (loading)
    return (
      <div className="container">
        <h2>Loading {roundKey} questions...</h2>
      </div>
    );

 if (completed) {
  return (
    <div className="container">
      <h2 className="round-header">{roundKey} Round Complete!</h2>
      <p>You have completed the {roundKey} round.</p>
      <button
        onClick={() =>
          onComplete(
            roundKey,
            answers,
            questions,
            questions.map((q) => q.type)
          )
        }
        className="button"
      >
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
        <p className="question">
          <strong>Question:</strong> {q?.question}
        </p>
        {roundType === "mcq" ? (
          <div className="mcq-group">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleMCQ(opt)}
                className="mcq-option"
                style={{
                  backgroundColor:
                    answers[current] === opt ? "#007bff" : "#f5f5f5",
                  color: answers[current] === opt ? "#fff" : "#222",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : roundType === "code" ? (
          <>
            <MonacoEditor
              height="300px"
              language={q.language || "javascript"}
              value={answers[current]}
              onChange={handleChange}
              theme="vs-dark"
              options={{ fontSize: 16 }}
            />
            <button
              onClick={handleRunCode}
              className="button"
              disabled={runningCode || !answers[current]?.trim()}
              style={{ marginTop: "1rem" }}
            >
              {runningCode ? "Running..." : "Run Code"}
            </button>
            {codeResult && (
              <div className="testcase-results">
                <h4>Results:</h4>
                {codeResult.map((res, idx) => (
                  <div key={idx} style={{ marginBottom: "6px" }}>
                    {res.error ? (
                      <span style={{ color: "red" }}>{res.error}</span>
                    ) : (
                      <>
                        <strong>Input:</strong> {res.input} <br />
                        <strong>Expected:</strong> {res.expected} <br />
                        <strong>Your Output:</strong> {res.actual} <br />
                        <strong>Status:</strong>{" "}
                        {res.passed ? "✅ Passed" : "❌ Failed"}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <textarea
            rows={5}
            placeholder="Type your answer here..."
            value={answers[current]}
            onChange={(e) => handleChange(e.target.value)}
            className="textarea"
          />
        )}

        <div className="nav-buttons">
          {current > 0 && (
            <button
              onClick={() => setCurrent(current - 1)}
              className="button secondary"
            >
              Previous Question
            </button>
          )}
         {current < questions.length - 1 ? (
  <button
    onClick={() => setCurrent(current + 1)}
    disabled={!answers[current]?.trim()}
    className="button"
  >
    Next Question
  </button>
) : (
  <button
    onClick={finishRound}
    disabled={!answers[current]?.trim()}
    className="button finish"
  >
    {roundKey === "hr" ? "Finish Test" : "Next Section"}
  </button>
)}

        </div>
      </div>
    </div>
  );
}

export default Interview;
