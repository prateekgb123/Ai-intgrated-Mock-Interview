import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Interview from './components/Interview';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogout = () => {
    setToken('');
    setUsername('');
    setUserId('');
    setShowProfile(false);
  };

  return (
    <div className="app-container">
      <h1>AI Mock Interview</h1>
      {!token ? (
        <div className="center-auth-area">
          <div className="auth-wrapper">
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
      ) : (
        <>
          <div className="navbar">
            <span>Welcome, {username}</span>
            <button onClick={() => setShowProfile((p) => !p)}>
              {showProfile ? "Interview" : "Profile"}
            </button>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="home-main-content">
            {showProfile ? (
              <Profile userId={userId} username={username} />
            ) : (
              <Interview userId={userId} />
            )}
            {/* You can add more home page components here side by side */}
          </div>
        </>
      )}
    </div>
  );
}

export default App;