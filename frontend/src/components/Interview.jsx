import React, { useEffect, useState } from "react";

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
        switch (roundKey) {
          case "aptitude":
            return [
              { type: "mcq", question: "If 3x + 5 = 20, what is x?", options: ["5", "4", "3", "15"] },
              { type: "mcq", question: "What is the next number in the series: 2, 4, 8, 16, ?", options: ["18", "20", "24", "32"] },
              { type: "text", question: "A train travels 60 km in 1.5 hours. What is its average speed?" },
              { type: "mcq", question: "Which is the odd one out? Apple, Orange, Banana, Potato", options: ["Apple", "Orange", "Banana", "Potato"] },
              { type: "mcq", question: "What is 25% of 80?", options: ["10", "15", "20", "25"] },
              { type: "text", question: "If a book costs $120 and is sold at a 20% discount, what is the selling price?" }
            ];
          case "coding":
            return [
              { type: "code", question: "Write a JS function to reverse a string." },
              { type: "code", question: "Write a function to check if a number is prime." },
              { type: "code", question: "Write a function to find the maximum in an array." },
              { type: "mcq", question: "What is the output of: console.log(typeof null);", options: ["object", "null", "undefined", "number"] },
              { type: "code", question: "Write a function to calculate factorial of n." },
              { type: "mcq", question: "Which method is used to add elements to the end of an array in JS?", options: ["push()", "pop()", "shift()", "unshift()"] }
            ];
          case "technical":
            return [
              { type: "text", question: "Explain the concept of closures in JavaScript." },
              { type: "text", question: "What is the difference between == and === in JS?" },
              { type: "mcq", question: "Which HTML tag is used for inserting an image?", options: ["<img>", "<src>", "<image>", "<pic>"] },
              { type: "text", question: "Explain what is REST API." },
              { type: "mcq", question: "Which is not a CSS selector?", options: [".class", "#id", ":hover", "@media"] },
              { type: "text", question: "What is the purpose of useEffect hook in React?" }
            ];
          case "hr":
            return [
              { type: "text", question: "Tell me about yourself." },
              { type: "text", question: "Why do you want to join our company?" },
              { type: "text", question: "Describe a challenge you faced and how you overcame it." },
              { type: "mcq", question: "Are you comfortable with relocation?", options: ["Yes", "No"] },
              { type: "text", question: "Where do you see yourself in 5 years?" },
              { type: "text", question: "What are your strengths and weaknesses?" }
            ];
          default:
            return [];
        }
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

  if (loading) return <div style={styles.container}><h2>Loading questions...</h2></div>;

  if (completed) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Interview Complete!</h2>
        <div style={styles.card}>
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
          <button onClick={handleRestart} style={styles.button}>Restart Interview</button>
        </div>
      </div>
    );
  }

  const q = questions[round][current];
  const progress = round * QUESTIONS_PER_ROUND + current + 1;
  const total = ROUNDS.length * QUESTIONS_PER_ROUND;
  const progressPercent = Math.round((progress / total) * 100);

  return (
    <div style={styles.container}>
      <div style={styles.roundHeader}>
        {ROUNDS[round].label}: Question {current + 1} of {QUESTIONS_PER_ROUND}
      </div>
      <div style={styles.progressBarContainer}>
        <div style={{ ...styles.progressBar, width: `${progressPercent}%` }} />
      </div>

      <div style={styles.card} className="animated-fade">
        <p style={styles.question}><strong>Question:</strong> {q.question}</p>
        {q.type === "mcq" ? (
          <div style={styles.mcqGroup}>
            {q.options.map(opt => (
              <button
                key={opt}
                onClick={() => handleMCQ(opt)}
                style={{
                  ...styles.mcqOption,
                  background: answers[round][current] === opt ? "#007bff" : "#f5f5f5",
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
            style={styles.textarea}
            disabled={loading}
          />
        )}
        <button
          onClick={handleNext}
          disabled={loading || !answers[round][current]?.trim()}
          style={styles.button}
        >
          {round === ROUNDS.length - 1 && current === QUESTIONS_PER_ROUND - 1
            ? 'Finish Interview'
            : 'Next Question'}
        </button>
        <div style={{ marginTop: '1rem', fontSize: '0.98rem', color: '#888' }}>
          Feedback will be provided after completion of all rounds.
        </div>
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
    paddingTop: '2rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    minHeight: '100vh',
  },
  roundHeader: {
    fontSize: '1.4rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#222',
    textAlign: 'center'
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
    transition: 'background 0.2s, color 0.2s'
  }
};

export default OnlineMockInterview;
