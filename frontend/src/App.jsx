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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    setToken('');
    setUsername('');
    setUserId('');
    setActiveTab('dashboard');
  };

  const closeSidebar = () => setSidebarOpen(false);

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
      <button
        className={`hamburger${sidebarOpen ? ' open' : ''}`}
        id="hamburger-btn"
        aria-label="Open menu"
        onClick={() => setSidebarOpen((v) => !v)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
        <h2>{username}</h2>
        <ul>
          <li
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          >
            Dashboard
          </li>
          <li
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => { setActiveTab('history'); setSidebarOpen(false); }}
          >
            History
          </li>
          <li
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
          >
            Profile
          </li>
        </ul>
      </aside>
      <div
        className="sidebar-overlay"
        id="sidebar-overlay"
        style={{
          display: sidebarOpen ? 'block' : 'none',
        }}
        onClick={closeSidebar}
      />

      <main className="dashboard-main">
        <div className="header-bar">
          <h2 className="header-title">Online Mock Interview</h2>
          <div className="header-user">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && <Interview userId={userId} />}
        {activeTab === 'history' && <History userId={userId} />}
        {activeTab === 'profile' && <Profile userId={userId} username={username} />}
      </main>
    </div>
  );
}

export default App;