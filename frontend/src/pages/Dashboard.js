import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="fade-in">
      <h2>Welcome to Your Dashboard</h2>
      <p className="text-center mb-2">What would you like to do today?</p>
      
      <div className="dashboard">
        <div className="dashboard-card">
          <div className="medical-icon">📅</div>
          <h3>Book New Appointment</h3>
          <p>Schedule an appointment with your preferred doctor at a convenient time.</p>
          <Link to="/appointments/new">Book Appointment</Link>
        </div>
        
        <div className="dashboard-card">
          <div className="medical-icon">📋</div>
          <h3>View Appointments</h3>
          <p>Check your upcoming appointments, past visits, and appointment status.</p>
          <Link to="/appointments">View Appointments</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;