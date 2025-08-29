// App.jsx
import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Interview from './components/Interview';
import Profile from './components/Profile';
import History from './components/History';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSignup, setShowSignup] = useState(false);

  // Progress unlocks
  const [progress, setProgress] = useState({
    aptitude: true,
    coding: false,
    technical: false,
    hr: false,
  });

  const [selectedRound, setSelectedRound] = useState(null);
  const [allRounds, setAllRounds] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [feedbacks, setFeedbacks] = useState(null);

  // Logout
  const handleLogout = () => {
    setToken('');
    setUsername('');
    setUserId('');
    setActiveTab('dashboard');
    setSelectedRound(null);
    setProgress({ aptitude: true, coding: false, technical: false, hr: false });
    setAllRounds([]);
    setFinalResult(null);
    setFeedbacks(null);
  };

  // Rounds list with type
  const rounds = [
    { id: 'aptitude', title: 'Aptitude Round', type: 'mcq' },
    { id: 'coding', title: 'Coding Round', type: 'code' },
    { id: 'technical', title: 'Technical Round', type: 'mcq' },
    { id: 'hr', title: 'HR Round', type: 'text' },
  ];

  // Handle round completion
  const handleRoundComplete = async (roundId, answers, questions, types) => {
    const updatedRounds = [...allRounds, { round: roundId, questions, answers, types }];
    setAllRounds(updatedRounds);

    // Unlock next round
    setProgress(prev => {
      if (roundId === 'aptitude') return { ...prev, coding: true };
      if (roundId === 'coding') return { ...prev, technical: true };
      if (roundId === 'technical') return { ...prev, hr: true };
      return prev;
    });

    // Final HR round → send to backend
    if (roundId === 'hr') {
      try {
        const res = await fetch('http://localhost:3000/interview/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rounds: updatedRounds, userId }),
        });
        const data = await res.json();
        setFinalResult(data.result || data.message || 'No result');
        setFeedbacks(data.feedbacks || []);
      } catch (err) {
        console.error('Error submitting final answers:', err);
        setFinalResult('Error contacting AI service.');
      }
    }

    setSelectedRound(null); // Back to dashboard
  };

  // Auth UI
  if (!token) {
    return (
      <div className="auth-layout" style={{ display: 'flex', height: '100vh' }}>
        {/* Left side */}
        <div
          className="auth-left"
          style={{
            flex: 1,
            backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            Welcome to <br /> AI-Powered Mock Interview
          </h1>
        </div>

        {/* Right side */}
        <div
          className="auth-right"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {!showSignup ? (
              <Login
                setToken={setToken}
                setUsername={setUsername}
                setUserId={setUserId}
                onSignupClick={() => setShowSignup(true)}
              />
            ) : (
              <Signup onBackToLogin={() => setShowSignup(false)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main App UI
  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <nav
        className="navbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '1rem',
          background: '#222',
          color: 'white',
        }}
      >
        <h2>AI Mock Interview</h2>
        <div className="nav-links" style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ background: 'transparent', color: 'white' }}>Home</button>
          <button onClick={() => setActiveTab('history')} style={{ background: 'transparent', color: 'white' }}>History</button>
          <button onClick={() => setActiveTab('profile')} style={{ background: 'transparent', color: 'white' }}>Profile</button>
          <button onClick={handleLogout} style={{ background: 'transparent', color: 'white' }}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-main" style={{ padding: '2rem' }}>
        {/* Final Result */}
        {finalResult ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h1>Final Result</h1>
            <h2 style={{ marginTop: '1rem' }}>{finalResult}</h2>
            {feedbacks && feedbacks.length > 0 && (
              <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <h3 className="font-bold">AI Feedback</h3>
                <ul>
                  {feedbacks.map((f, idx) => (
                    <li key={idx} style={{ marginTop: '0.5rem' }}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : activeTab === 'dashboard' ? (
          !selectedRound ? (
            // Show rounds
            <div className="rounds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {rounds.map((round) => {
                const unlocked = progress[round.id];
                return (
                  <div key={round.id} style={{ padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', background: 'white', textAlign: 'center' }}>
                    <h3>{round.title}</h3>
                    {unlocked ? (
                      <button
                        onClick={() => setSelectedRound(round.id)}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', background: '#007bff', color: 'white' }}
                      >
                        Start
                      </button>
                    ) : (
                      <button disabled style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', background: '#ccc', color: '#666' }}>Locked</button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Interview
              roundKey={selectedRound}
              roundType={rounds.find(r => r.id === selectedRound)?.type}
              onComplete={handleRoundComplete}
            />
          )
        ) : activeTab === 'history' ? (
          <History userId={userId} />
        ) : activeTab === 'profile' ? (
          <Profile userId={userId} username={username} />
        ) : null}
      </main>
    </div>
  );
}

export default App;
