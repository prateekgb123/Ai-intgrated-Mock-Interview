import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken, setUsername, setUserId }) {
  const [data, setData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/login', data);
    setToken(res.data.token);
    setUsername(res.data.username);
    setUserId(res.data.userId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" onChange={(e) => setData({ ...data, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setData({ ...data, password: e.target.value })} />
      <button type="submit">Log In</button>
    </form>
  );
}

export default Login;