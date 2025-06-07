import React, { useState } from 'react';

const mockQuestions = [
  "Tell me about yourself.",
  "Why do you want this job?",
  "Describe a challenge you faced and how you overcame it.",
  "What are your strengths and weaknesses?",
  "Where do you see yourself in 5 years?"
];

function Interview() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  const handleSubmit = async () => {
    if (!answer.trim()) return alert("Please provide an answer!");

    setLoading(true);
    setFeedback('');

    try {
      const res = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          answer: answer
        })
      });

      const data = await res.json();
      console.log("AI response:", data);

      if (data.feedback) {
        setFeedback(data.feedback);
      } else {
        setFeedback("❌ Error: No feedback received.");
      }
    } catch (error) {
      console.error("❌ AI feedback failed:", error);
      setFeedback("❌ Something went wrong while getting feedback.");
    }

    setLoading(false);
  };

  const handleNext = () => {
    setAnswer('');
    setFeedback('');
    setCurrentQuestionIndex((prev) => (prev + 1) % mockQuestions.length);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>AI Mock Interview</h2>
      <div style={styles.card}>
        <p style={styles.question}><strong>Question:</strong> {currentQuestion}</p>
        <textarea
          rows={6}
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={styles.textarea}
        />
        <button onClick={handleSubmit} disabled={loading} style={styles.button}>
          {loading ? 'Analyzing...' : 'Submit Answer'}
        </button>
        {feedback && (
          <div style={styles.feedbackBox}>
            <h4>AI Feedback:</h4>
            <p>{feedback}</p>
          </div>
        )}
        <button onClick={handleNext} style={{ ...styles.button, backgroundColor: '#555' }}>
          Next Question
        </button>
      </div>
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
  }
};

export default Interview;
