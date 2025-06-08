import React, { useEffect, useState } from "react";

// Helper for point-wise feedback rendering
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

function OnlineMockInterview() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("http://localhost:5000/questions");
        const data = await res.json();
        setQuestions(data.questions || []);
        setAnswers(Array(data.questions?.length || 0).fill(""));
        setFeedbacks(Array(data.questions?.length || 0).fill(""));
      } catch {
        setQuestions([
          { type: "text", question: "Tell me about yourself." },
          { type: "mcq", question: "Which is a JavaScript framework?", options: ["Django", "React", "Laravel", "Rails"] },
          { type: "text", question: "Describe a challenge you faced and how you overcame it." },
          { type: "code", question: "Write a JS function to reverse a string." }
        ]);
        setAnswers(["", "", "", ""]);
        setFeedbacks(["", "", "", ""]);
      }
    }
    fetchQuestions();
  }, []);

  // Handles answer change
  function handleChange(e) {
    const val = e.target.value;
    setAnswers(a => {
      const copy = [...a];
      copy[current] = val;
      return copy;
    });
  }

  // Handles MCQ select
  function handleMCQ(opt) {
    setAnswers(a => {
      const copy = [...a];
      copy[current] = opt;
      return copy;
    });
  }

  // Submit answer & get feedback
  async function handleSubmit() {
    if (!answers[current]?.trim()) return alert("Please answer!");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[current].question,
          answer: answers[current]
        })
      });
      const data = await res.json();
      setFeedbacks(f => {
        const copy = [...f];
        copy[current] = data.feedback || "No feedback.";
        return copy;
      });
    } catch {
      setFeedbacks(f => {
        const copy = [...f];
        copy[current] = "❌ Could not fetch feedback.";
        return copy;
      });
    }
    setLoading(false);
  }

  // Go to next question
  function handleNext() {
    if (current < questions.length - 1) setCurrent(current + 1);
    else setCompleted(true);
  }

  // Restart interview
  function handleRestart() {
    setAnswers(Array(questions.length).fill(""));
    setFeedbacks(Array(questions.length).fill(""));
    setCurrent(0);
    setCompleted(false);
  }

  // Rendering
  if (!questions.length) {
    return <div style={styles.container}><h2>Loading questions...</h2></div>;
  }

  if (completed) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Interview Complete!</h2>
        <div style={styles.card}>
          <h4>Summary</h4>
          <ol>
            {questions.map((q, i) => (
              <li key={i} style={{marginBottom:'1.5rem'}}>
                <strong>Q:</strong> {q.question}<br/>
                <strong>Your answer:</strong> <span style={{color:'#007bff'}}>{answers[i]}</span><br/>
                <strong>AI Feedback:</strong> {renderPointwise(feedbacks[i])}
              </li>
            ))}
          </ol>
          <button onClick={handleRestart} style={styles.button}>
            Restart Interview
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progressPercent = Math.round(((current)/questions.length)*100);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Online Mock Interview</h2>
      <div style={styles.progressBarContainer}>
        <div style={{ ...styles.progressBar, width: `${progressPercent}%` }} />
        <span style={styles.progressText}>
          Question {current+1} of {questions.length}
        </span>
      </div>
      <div style={styles.card} className="animated-fade">
        <p style={styles.question}><strong>Question:</strong> {q.question}</p>
        {/* Question type rendering */}
        {q.type === "mcq" ? (
          <div style={styles.mcqGroup}>
            {q.options.map(opt => (
              <button
                key={opt}
                onClick={() => handleMCQ(opt)}
                style={{
                  ...styles.mcqOption,
                  background: answers[current] === opt ? "#007bff" : "#f5f5f5",
                  color: answers[current] === opt ? "#fff" : "#222"
                }}
                disabled={!!feedbacks[current] || loading}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : q.type === "code" ? (
          <textarea
            rows={7}
            placeholder="Write your code here..."
            value={answers[current]}
            onChange={handleChange}
            style={styles.textarea}
            disabled={!!feedbacks[current] || loading}
          />
        ) : (
          <textarea
            rows={5}
            placeholder="Type your answer here..."
            value={answers[current]}
            onChange={handleChange}
            style={styles.textarea}
            disabled={!!feedbacks[current] || loading}
          />
        )}
        {/* Submit/Next */}
        {!feedbacks[current] ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !answers[current]?.trim()}
            style={styles.button}
          >
            {loading ? 'Analyzing...' : 'Submit Answer'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{ ...styles.button, backgroundColor: "#555" }}
            disabled={current === questions.length-1 && completed}
          >
            {current === questions.length-1 ? 'Finish Interview' : 'Next Question'}
          </button>
        )}
        {/* Feedback */}
        {feedbacks[current] && (
          <div style={styles.feedbackBox}>
            <h4>AI Feedback:</h4>
            {renderPointwise(feedbacks[current])}
          </div>
        )}
      </div>
      <style>{`
        .animated-fade { animation: fadeIn 0.7s;}
        @keyframes fadeIn {from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:none;}}
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center'
  },
  header: {
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  card: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '2rem',
    borderRadius: '10px',
    backgroundColor: '#f5f5f5',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)'
  },
  question: {
    fontSize: '1.2rem',
    marginBottom: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '1rem',
    fontSize: '1rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    marginBottom: '1rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer'
  },
  feedbackBox: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'left'
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto 1.5rem auto',
    background: '#e6e6e6',
    borderRadius: '10px',
    height: '14px',
    position: 'relative'
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #007bff, #00c6ff)',
    borderRadius: '10px',
    transition: 'width 0.5s'
  },
  progressText: {
    position: 'absolute',
    top: '18px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '0.97rem',
    color: '#333'
  },
  mcqGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  mcqOption: {
    border: '1px solid #007bff',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    transition: 'background 0.2s, color 0.2s'
  }
};

export default OnlineMockInterview;