import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Interview({ userId }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [history, setHistory] = useState([]);

  const getQuestion = async () => {
    const res = await axios.post('http://localhost:5000/ask');
    setQuestion(res.data.question);
    setAnswer('');
    setFeedback('');
  };

  const submitAnswer = async () => {
    const res = await axios.post('http://localhost:5000/answer', {
      userId,
      question,
      answer,
    });
    setFeedback(res.data.feedback);
    loadHistory();
  };

  const loadHistory = async () => {
    const res = await axios.get(`http://localhost:5000/history/${userId}`);
    setHistory(res.data);
  };

  useEffect(() => {
    if (userId) loadHistory();
  }, [userId]);

  return (
    <div>
      <button onClick={getQuestion}>Get Question</button>
      <p><b>Question:</b> {question}</p>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <button onClick={submitAnswer}>Submit</button>
      <p><b>Feedback:</b> {feedback}</p>
      <h3>History</h3>
      <ul>
        {history.map((item, index) => (
          <li key={index}>
            <strong>Q:</strong> {item.question} <br />
            <strong>A:</strong> {item.answer} <br />
            <strong>F:</strong> {item.feedback}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Interview;
