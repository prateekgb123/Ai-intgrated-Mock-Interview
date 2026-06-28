import { Link } from "react-router-dom";
import logo from "../icons/ai.jpg";

const Navbar = () => {
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">

      <div className="navbar-logo">

        <img
          src={logo}
          alt="AI Interview Copilot"
          className="logo-image"
        />

        <h2>AI Interview Copilot</h2>

      </div>

      <div className="nav-links">

        <Link to="/home">Home</Link>

        {token && (
          <>
            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/interview">
              Interview
            </Link>

            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}

        {!token && (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/signup">
              Signup
            </Link>
          </>
        )}

      </div>

    </nav>
  );
};

export default Navbar;