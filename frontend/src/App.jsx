import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Interview from './components/Interview';
import Profile from './components/Profile'; // (You can create this)
import History from './components/History'; // (You can create this)

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSignup, setShowSignup] = useState(false); // <-- This was missing

  if (!token) {
    return (
      <div>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>AI Mock Interview</h1>
        <div className="auth-container">
          {!showSignup ? (
            <>
              <Login setToken={setToken} setUsername={setUsername} setUserId={setUserId} />
              <p style={{ marginTop: '1rem' }}>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#646cff',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 'bold'
                  }}
                  onClick={() => setShowSignup(true)}
                >
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <>
              <Signup />
              <p style={{ marginTop: '1rem' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#646cff',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 'bold'
                  }}
                  onClick={() => setShowSignup(false)}
                >
                  Log In
                </button>
              </p>
            </>
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
          <li onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li onClick={() => setActiveTab('history')}>History</li>
          <li onClick={() => setActiveTab('profile')}>Profile</li>
          <li onClick={() => window.location.reload()}>Logout</li>
        </ul>
      </aside>
      <main className="dashboard-main">
        {activeTab === 'dashboard' && <Interview userId={userId} />}
        {activeTab === 'history' && <History userId={userId} />}
        {activeTab === 'profile' && <Profile userId={userId} username={username} />}
      </main>
    </div>
  );
}

export default App;