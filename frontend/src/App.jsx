import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Interview from './components/Interview';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');

  return (
    <div>
      <h1>AI Mock Interview</h1>
      {!token ? (
        <>
          <Login setToken={setToken} setUsername={setUsername} setUserId={setUserId} />
          <Signup />
        </>
      ) : (
        <>
          <h2>Welcome, {username}</h2>
          <Interview userId={userId} />
        </>
      )}
    </div>
  );
}

export default App;
