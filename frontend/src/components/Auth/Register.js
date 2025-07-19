import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function Register() {
  const [form, setForm] = useState({ username: "", password: "", role: "patient" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      await api.post("/api/auth/register", form);
      setSuccess("🎉 Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("❌ Registration failed. Username might already exist.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'patient': return '🤒';
      case 'doctor': return '👨‍⚕️';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  const getRoleDescription = (role) => {
    switch(role) {
      case 'patient': return 'Book appointments and manage your healthcare';
      case 'doctor': return 'Manage patient appointments and provide healthcare';
      case 'admin': return 'Oversee the entire hospital system';
      default: return '';
    }
  };

  return (
    <div className="fade-in">
      <h2>📝 Create New Account</h2>
      
      <form onSubmit={handleSubmit}>
        {error && <p style={{color:"red"}}>{error}</p>}
        {success && <p style={{color:"green"}}>{success}</p>}
        
        <label>👤 Username:</label>
        <input
          type="text"
          name="username"
          placeholder="Choose a unique username"
          value={form.username}
          onChange={handleChange}
          required
        />
        
        <label>🔒 Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Create a secure password"
          value={form.password}
          onChange={handleChange}
          required
        />
        
        <label>🎭 Account Type:</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="patient">🤒 Patient</option>
          <option value="doctor">👨‍⚕️ Doctor</option>
          <option value="admin">👨‍💼 Administrator</option>
        </select>
        
        <div className="card mt-1">
          <p>
            <strong>{getRoleIcon(form.role)} {form.role.charAt(0).toUpperCase() + form.role.slice(1)}:</strong> {getRoleDescription(form.role)}
          </p>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="loading"></span> Creating Account...
            </>
          ) : (
            "🎯 Create Account"
          )}
        </button>
      </form>
      
      <div className="card mt-2">
        <h3>👥 Account Types</h3>
        <div className="dashboard">
          <div className="dashboard-card">
            <div className="medical-icon">🤒</div>
            <h4>Patient</h4>
            <p>Book appointments, view medical records, and manage your healthcare journey.</p>
          </div>
          <div className="dashboard-card">
            <div className="medical-icon">👨‍⚕️</div>
            <h4>Doctor</h4>
            <p>Manage patient appointments, view schedules, and provide medical services.</p>
          </div>
          <div className="dashboard-card">
            <div className="medical-icon">👨‍💼</div>
            <h4>Administrator</h4>
            <p>Oversee system operations, manage users, and ensure smooth functionality.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;