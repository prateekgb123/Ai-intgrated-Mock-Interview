import React, { useEffect, useState } from 'react';

function History({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    fetch(`http://localhost:3000/interview/history/${userId}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch interview history.');
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading history...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Interview History</h2>
      {history.length === 0 ? (
        <div>No interviews found.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {history.map(h => (
            <li key={h._id} style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              margin: '1em 0',
              padding: '1em',
              background: '#f9f9f9'
            }}>
              <b>Date:</b> {new Date(h.date).toLocaleString()}<br />
              <b>Result:</b> {h.result}
              
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;