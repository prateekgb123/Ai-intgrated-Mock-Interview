import { useState } from "react";

import { Link } from "react-router-dom";
import "../styles/auth.css";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
const Login = () => {

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await API.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Login Successful");

      navigate("/home");

    } catch (error) {

      alert("Login Failed");

    }
  };

  return (
    <div className="auth-container">

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">
          Login
        </button>

      </form>

      <p className="auth-switch">

        Don't have an account?

        <Link to="/signup">
          Signup
        </Link>

      </p>

    </div>
  );
};

export default Login;