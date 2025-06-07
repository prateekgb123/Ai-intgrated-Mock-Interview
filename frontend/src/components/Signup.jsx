import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [data, setData] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/signup', data);
    alert('Signup successful');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" onChange={(e) => setData({ ...data, username: e.target.value })} />
      <input type="email" placeholder="Email" onChange={(e) => setData({ ...data, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setData({ ...data, password: e.target.value })} />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default Signup;