import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Interview from './components/Interview';
import History from './components/History';
import Footer from './components/Footer';
import './App.css';
import logo from './logo.png';
import ai from './ai.png';

// Import round images
import codingImage from './icons/coding.png';
import technicalImage from './icons/technical.png';
import hrImage from './icons/hr.png';
import aptitudeImage from './icons/aptitude.jpeg';

function HomePage({ onGetStarted }) {
  return (
    <div className="home-beautiful">
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
      <section className="how-it-works-section" id="how-it-works">
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
  const [activeTab, setActiveTab] = useState('home');
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
    { id: 'aptitude', title: 'Aptitude Round', type: 'mcq', image: aptitudeImage },
    { id: 'coding', title: 'Coding Round', type: 'code', image: codingImage },
    { id: 'technical', title: 'Technical Round', type: 'mcq', image: technicalImage },
    { id: 'hr', title: 'HR Round', type: 'text', image: hrImage },
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

  const handleGetStarted = () => setActiveTab('dashboard');

  if (!token) {
    return (
      <div className="auth-layout">
        <div className="auth-left">
          <h1>
            Welcome to <br /> AI-Powered Mock Interview
          </h1>
        </div>
        <div className="auth-right">
          <div className="auth-box">
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
          <div className="logo-title">
            <img src={logo} alt="AI Logo" className="logo-image" />
            <h2>AI MOCK INTERVIEW</h2>
          </div>
          <div className="nav-links">
            <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" />
            <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" />
            <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="History" />
            <span className="username-badge">{username}</span>
            <NavButton onClick={handleLogout} label="Logout" danger />
          </div>
        </nav>

        <main className="dashboard-main">
          {activeTab === 'home' ? (
            <HomePage onGetStarted={handleGetStarted} />
          ) : finalResult ? (
            <div className="final-result">
              {finalResult.split('Decision:')[0]}
              <h2 className="decision-title">
                Decision:{finalResult.includes('Decision:') ? finalResult.split('Decision:')[1].trim() : ''}
              </h2>
            </div>
          ) : activeTab === 'dashboard' ? (
            !selectedRound ? (
              <div className="rounds-grid">
                {rounds.map((round) => {
                  const unlocked = progress[round.id];
                  return (
                    <div key={round.id} className="round-card" style={{ cursor: unlocked ? 'pointer' : 'default' }}>
                      {round.image && (
                        <img src={round.image} alt={`${round.title} icon`} className="round-image" />
                      )}
                      <h3>{round.title}</h3>
                      {unlocked ? (
                        <button className="start-btn" onClick={() => setSelectedRound(round.id)}>
                          Start
                        </button>
                      ) : (
                        <button className="start-btn locked" disabled>
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
      className={`${danger ? 'danger-btn' : ''} ${active ? 'active-btn' : ''}`}
    >
      {label}
    </button>
  );
}

export default App;
