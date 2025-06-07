import React, { useEffect, useState } from 'react';
import axios from 'axios';

function History({ userId }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/history/${userId}`)
        .then(res => setHistory(res.data));
    }
  }, [userId]);
  return (
    <div className="interview-card">
      <h2>History</h2>
      <ul>
        {history.map((item, idx) => (
          <li key={idx} style={{ marginBottom: "1rem" }}>
            <strong>Q:</strong> {item.question} <br />
            <strong>A:</strong> {item.answer} <br />
            <strong>F:</strong> {item.feedback}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default History;