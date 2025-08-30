import React, { useState } from 'react';
import axios from 'axios';
import './Authform.css';

function Signup({ onBackToLogin }) {
  const [data, setData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Trim inputs before sending
    const trimmedData = {
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password.trim(),
    };

    try {
      await axios.post('https://ai-intgrated-mock-interview.onrender.com/signup', trimmedData);
      setMsg('Signup successful! You can now sign in.');
      setTimeout(() => {
        onBackToLogin();
      }, 1300);
    } catch (error) {
      setMsg('Signup failed: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {msg && <div className="form-msg">{msg}</div>}
      <label>Username</label>
      <input
        type="text"
        required
        autoComplete="username"
        onChange={e => setData({ ...data, username: e.target.value })}
      />
      <label>Email</label>
      <input
        type="email"
        required
        autoComplete="email"
        onChange={e => setData({ ...data, email: e.target.value })}
      />
      <label>Password</label>
      <input
        type="password"
        required
        autoComplete="new-password"
        onChange={e => setData({ ...data, password: e.target.value })}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      <div className="auth-switch">
        <span>Already have an account? </span>
        <button type="button" className="link-btn" onClick={onBackToLogin}>
          Sign in
        </button>
      </div>
    </form>
  );
}

export default Signup;
