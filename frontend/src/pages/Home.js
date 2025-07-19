import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="fade-in">
      <div className="home-hero">
        <h1>🏥 Hospital Queue System</h1>
        <p>Modern, efficient healthcare appointment management</p>
        <p>Please register or login to continue.</p>
        
        <div className="mt-2">
          <Link to="/doctors" className="dashboard-card a" style={{ 
            display: "inline-block", 
            textDecoration: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "0.75rem 2rem",
            borderRadius: "25px",
            fontWeight: "600",
            margin: "0.5rem"
          }}>
            👨‍⚕️ View Our Doctors
          </Link>
        </div>
      </div>
      
      <div className="dashboard">
        <div className="dashboard-card">
          <div className="medical-icon">👨‍⚕️</div>
          <h3>For Patients</h3>
          <p>Book appointments with your preferred doctors, view your medical schedule, and manage your healthcare efficiently.</p>
          <Link to="/doctors">Browse Doctors</Link>
        </div>
        
        <div className="dashboard-card">
          <div className="medical-icon">🩺</div>
          <h3>For Doctors</h3>
          <p>Manage your patient appointments, view your schedule, and provide quality healthcare services.</p>
          <Link to="/register">Join Our Team</Link>
        </div>
        
        <div className="dashboard-card">
          <div className="medical-icon">⚕️</div>
          <h3>For Administrators</h3>
          <p>Oversee the entire system, manage doctors and patients, and ensure smooth operations.</p>
          <Link to="/login">Admin Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;