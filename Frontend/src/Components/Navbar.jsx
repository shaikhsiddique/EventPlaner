import React from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, role, logout, isAdmin, isStudent } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo"></Link>
          <span className="brand-name">EventHub</span>
        </div>

        <nav className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {isStudent && (
            <Link to="/student" className="nav-link">
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="nav-link">
              Admin Dashboard
            </Link>
          )}

          <Link to="/contact" className="nav-link">
            Contact
          </Link>

          <Link to="/feedback" className="nav-link">
            Feedback
          </Link>

          <Link to="/about" className="nav-link">
            About
          </Link>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="user-name">
                Hello, {user.name}
              </span>

              <button className="login-btn secondary" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login/student" className="login-btn secondary">
                Student Login
              </Link>
              <Link to="/login/admin" className="login-btn primary">
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;