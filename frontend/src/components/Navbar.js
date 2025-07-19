import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, removeToken } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/doctors">Our Doctors</Link>
      {isLoggedIn() ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/appointments">Appointments</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;