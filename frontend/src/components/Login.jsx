import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';

function Login({ setToken, setUsername, setUserId, onSignupClick }) {
  const [data, setData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await axios.post('https://ai-intgrated-mock-interview.onrender.com/login', data);
      setToken(res.data.token);
      setUsername(res.data.username);
      setUserId(res.data.userId);
    } catch (error) {
      if (error.response?.status === 404) {
        setMsg('No such user found. Please signup first!');
      } else {
        setMsg('Login failed: ' + (error.response?.data || error.message));
      }
    }
    setLoading(false);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Sign In</h2>
      {msg && <div className="form-msg">{msg}</div>}
      <label>Username</label>
      <input
        type="text"
        required
        autoComplete="username"
        onChange={e => setData({ ...data, username: e.target.value })}
      />
      <label>Password</label>
      <input
        type="password"
        required
        autoComplete="current-password"
        onChange={e => setData({ ...data, password: e.target.value })}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <div className="auth-switch">
        <span>Don't have an account? </span>
        <button type="button" className="link-btn" onClick={onSignupClick}>
          Sign up
        </button>
      </div>
    </form>
  );
}

export default Login;