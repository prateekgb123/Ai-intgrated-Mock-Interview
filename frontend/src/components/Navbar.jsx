import { Link } from "react-router-dom";

const Navbar = () => {
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <h2>AI Interview Copilot</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {token && (
          <>
            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/interview">
              Interview
            </Link>

            <button onClick={logout}>
              Logout
            </button>
          </>
        )}

        {!token && (
          <>
            <Link to="/login">Login</Link>

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