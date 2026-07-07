import { useState } from "react";

import { Link } from "react-router-dom";
import "../styles/auth.css";
import API from "../services/api";
import { useNavigate } from "react-router-dom";


const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] =
    useState({
      name: "",
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

      await API.post(
        "/auth/signup",
        formData
      );

      alert("Signup Successful");
      navigate("/login");

    } catch (error) {

      alert("Signup Failed");

    }
  };

  return (
    <div className="auth-container">

      <h2>Signup</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />

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
          Signup
        </button>

      </form>

      <p className="auth-switch">

        Already have an account?

        <Link to="/login">
          Login
        </Link>

      </p>

    </div>
  );
};

export default Signup;