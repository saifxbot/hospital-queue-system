import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, removeToken } from "../utils/auth";

function Navbar({ isDarkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <nav>
      <div className="nav-left">
        <Link to="/">Home</Link>
        <Link to="/doctors">Our Doctors</Link>
        {isLoggedIn() ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/appointments">Appointments</Link>
          </>
        ) : null}
      </div>
      
      <div className="nav-right">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleDarkMode}
          className="nav-theme-toggle"
          type="button"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        
        {isLoggedIn() ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;