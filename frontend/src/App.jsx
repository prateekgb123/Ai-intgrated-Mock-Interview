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
    <div className="auth-layout" style={{ display: "flex", height: "100vh" }}>
      {/* Left side */}
      <div
        className="auth-left"
        style={{
          flex: 1,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}>
          Welcome to <br /> AI-Powered Mock Interview
        </h1>
      </div>

      {/* Right side */}
      <div
        className="auth-right"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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