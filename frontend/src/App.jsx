import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Interview from './components/Interview';
import History from './components/History';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSignup, setShowSignup] = useState(false);

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

  const rounds = [
    { id: 'aptitude', title: 'Aptitude Round', type: 'mcq' },
    { id: 'coding', title: 'Coding Round', type: 'code' },
    { id: 'technical', title: 'Technical Round', type: 'mcq' },
    { id: 'hr', title: 'HR Round', type: 'text' },
  ];

  const handleRoundComplete = async (roundId, answers, questions, types) => {
    const enrichedQuestions = questions.map(q => ({
      question: q.question,
      type: q.type,
      correct: q.correct || q.answer || null,
    }));

    let updatedRounds;
    setAllRounds(prevRounds => {
      const existingIndex = prevRounds.findIndex(r => r.round === roundId);
      if (existingIndex !== -1) {
        const newRounds = [...prevRounds];
        newRounds[existingIndex] = { round: roundId, questions: enrichedQuestions, answers, types };
        updatedRounds = newRounds;
        return newRounds;
      } else {
        updatedRounds = [...prevRounds, { round: roundId, questions: enrichedQuestions, answers, types }];
        return updatedRounds;
      }
    });

    setProgress(prev => {
      if (roundId === 'aptitude') return { ...prev, coding: true };
      if (roundId === 'coding') return { ...prev, technical: true };
      if (roundId === 'technical') return { ...prev, hr: true };
      return prev;
    });

    if (roundId === 'hr') {
      try {
        const res = await fetch('http://localhost:3000/interview/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rounds: updatedRounds, userId }),
        });
        const data = await res.json();
        setFinalResult(data.evaluation || data.result || 'No result');
        setFeedbacks(null); // You can set feedbacks if returned by backend
      } catch (err) {
        console.error('Error submitting final answers:', err);
        setFinalResult('Error contacting AI service.');
      }
    }

    setSelectedRound(null);
  };

  if (!token) {
    return (
      <div className="auth-layout" style={{ display: 'flex', height: '100vh' }}>
        <div
          className="auth-left"
          style={{
            flex: 1,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c')",
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

  return (
    <div
      className="dashboard-layout"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(90deg, #007bff 0%, #3a8dde 100%)',
      }}
    >
      <nav
        className="navbar"
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          zIndex: 100,
          background: 'linear-gradient(90deg, #007bff 0%, #3a8dde 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
          minHeight: '64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src="logo.jpeg"
            alt="AI Logo"
            style={{ height: 40, borderRadius: '50%', marginRight: 12 }}
          />
          <h2 style={{ fontWeight: 700, letterSpacing: '1px' }}>
            AI Mock Interview
          </h2>
        </div>

        <div
          className="nav-links"
          style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}
        >
          <NavButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            label="Home"
          />
          <NavButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            label="History"
          />
          <span
            style={{
              marginLeft: 10,
              padding: '4px 14px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '20px',
              fontWeight: 500,
              fontSize: '1rem',
            }}
          >
            {username}
          </span>
          <NavButton onClick={handleLogout} label="Logout" danger />
        </div>
      </nav>

      <main
        className="dashboard-main"
        style={{
          flex: 1,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
       {finalResult ? (
  <div style={{
    padding: '2rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflowY: 'auto',
    fontSize: '1.1rem',
    whiteSpace: 'pre-wrap'
  }}>
    {/* Render only the final evaluation text you get from backend */}
    {finalResult.split("Decision:")[0]}
    <h2 style={{ marginTop: '1rem', fontWeight: 'bold' }}>
      Decision:{finalResult.includes("Decision:") ? finalResult.split("Decision:")[1].trim() : ""}
    </h2>
  </div>
)  : activeTab === 'dashboard' ? (
          !selectedRound ? (
            <div
              className="rounds-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {rounds.map(round => {
                const unlocked = progress[round.id];
                return (
                  <div
                    key={round.id}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      background: 'white',
                      textAlign: 'center',
                    }}
                  >
                    <h3>{round.title}</h3>
                    {unlocked ? (
                      <button
                        onClick={() => setSelectedRound(round.id)}
                        style={{
                          marginTop: '1rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          background: '#007bff',
                          color: 'white',
                        }}
                      >
                        Start
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          marginTop: '1rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          background: '#ccc',
                          color: '#666',
                        }}
                      >
                        Locked
                      </button>
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

function NavButton({ active, onClick, icon, label, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: danger ? '#ff3b3b' : (active ? '#fff' : 'transparent'),
        color: danger ? '#fff' : (active ? '#007bff' : '#fff'),
        fontWeight: active ? 700 : 500,
        border: 'none',
        outline: 'none',
        padding: '8px 18px',
        borderRadius: '22px',
        cursor: 'pointer',
        boxShadow: active ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
        fontSize: '1rem',
        transition: 'all 0.2s',
        marginLeft: danger ? '1rem' : 0,
      }}
    >
      <span style={{ marginRight: 8 }}>{icon}</span>
      {label}
    </button>
  );
}

export default App;
