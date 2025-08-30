import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Interview from './components/Interview';
import History from './components/History';
import Footer from './components/Footer';
import './App.css';
import logo from './logo.png';
import ai from './ai.png'
function HomePage({ onGetStarted }) {
  // Added style to ensure display flex column and grow
  return (
    <div className="home-beautiful" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1,margin:"0px 20px" }}>
      <header className="hero-section">
        <div className="hero-text">
          <h1>
            Ace Your Interview With <span className="highlight">AI Power</span>
          </h1>
          <p>
            Practice with our virtual interviewer in four smart rounds and receive instant, actionable feedback.
          </p>
          <button className="get-started-btn" onClick={onGetStarted}>
            Get Started
          </button>
        </div>
        <div className="hero-image">
          <img src={ai} alt="AI Interview" />
        </div>
      </header>
      <section className="how-it-works-section" id="how-it-works" style={{ flexGrow: 1 }}>
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <span role="img" aria-label="signup">📝</span>
            <h3>Sign Up/Login</h3>
            <p>Start your journey or continue where you left off.</p>
          </div>
          <div className="step-card">
            <span role="img" aria-label="choose">🎯</span>
            <h3>Choose Interview Type</h3>
            <p>Select your preferred track: Aptitude, Coding, Technical, or HR.</p>
          </div>
          <div className="step-card">
            <span role="img" aria-label="practice">🤖</span>
            <h3>Practice Mock Interview</h3>
            <p>Get realistic questions and solve them live.</p>
          </div>
          <div className="step-card">
            <span role="img" aria-label="feedback">📊</span>
            <h3>Get Feedback</h3>
            <p>Review your performance and tips to improve.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('home'); // Default to Home
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

  const rounds = [
    { id: 'aptitude', title: 'Aptitude Round', type: 'mcq' },
    { id: 'coding', title: 'Coding Round', type: 'code' },
    { id: 'technical', title: 'Technical Round', type: 'mcq' },
    { id: 'hr', title: 'HR Round', type: 'text' },
  ];

  const handleLogout = () => {
    setToken('');
    setUsername('');
    setUserId('');
    setActiveTab('home');
    setSelectedRound(null);
    setProgress({ aptitude: true, coding: false, technical: false, hr: false });
    setAllRounds([]);
    setFinalResult(null);
  };

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
      } catch (err) {
        console.error('Error submitting final answers:', err);
        setFinalResult('Error contacting AI service.');
      }
    }

    setSelectedRound(null);
  };

  const handleGetStarted = () => {
    setActiveTab('dashboard');
  };

  if (!token) {
    return (
      <div className="auth-layout" style={{ display: 'flex', height: '100vh' }}>
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
    <div className="app-container">
      <div className="dashboard-layout">
        <nav className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={logo} alt="AI Logo" style={{ height: 50, borderRadius: '50%', verticalAlign: 'middle' }} />
            <h2 style={{ fontWeight: 700, letterSpacing: '1px' }}>AI MOCK INTERVIEW</h2>
          </div>

          <div className="nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" />
            <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" />
            <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="History" />
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

        <main className="dashboard-main">
          {activeTab === 'home' ? (
            <HomePage onGetStarted={handleGetStarted} />
          ) : finalResult ? (
            <div
              style={{
                padding: '2rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflowY: 'auto',
                fontSize: '1.1rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {finalResult.split('Decision:')[0]}
              <h2 style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                Decision:{finalResult.includes('Decision:') ? finalResult.split('Decision:')[1].trim() : ''}
              </h2>
            </div>
          ) : activeTab === 'dashboard' ? (
            !selectedRound ? (
              <div
                className="rounds-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}
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
          ) : null}
        </main>
      </div>
      <Footer />
    </div>
  );
}

function NavButton({ active, onClick, label, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: danger ? '#ff3b3b' : active ? '#fff' : 'transparent',
        color: danger ? '#fff' : active ? '#007bff' : '#fff',
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
      {label}
    </button>
  );
}

export default App;
