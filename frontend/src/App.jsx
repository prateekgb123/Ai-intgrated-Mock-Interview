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

  const handleLogout = () => {
    setToken('');
    setUsername('');
    setUserId('');
    setActiveTab('dashboard');
  };

  if (!token) {
    return (
      <div>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>AI Mock Interview</h1>
        <div className="auth-container">
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
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>{username}</h2>
        <ul>
          <li
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </li>
          <li
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            History
          </li>
          <li
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </li>
        </ul>
      </aside>

      <main className="dashboard-main">
        <div className="header-bar">
          <h2 className="header-title">Online Mock Interview</h2>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {activeTab === 'dashboard' && <Interview userId={userId} />}
        {activeTab === 'history' && <History userId={userId} />}
        {activeTab === 'profile' && <Profile userId={userId} username={username} />}
      </main>
    </div>
  );
}

export default App;
