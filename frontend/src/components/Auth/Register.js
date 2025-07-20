import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

function Register() {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    role: "patient" 
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (form.password !== form.confirmPassword) {
      setError("❌ Passwords don't match!");
      return false;
    }
    
    if (form.password.length < 6) {
      setError("❌ Password must be at least 6 characters long!");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("❌ Please enter a valid email address!");
      return false;
    }

    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Send only the required fields to backend
      const { confirmPassword, ...registerData } = form;
      await api.post("/api/auth/register", registerData);
      setSuccess("🎉 Registration successful! You can now login with email verification.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err.response?.data?.msg) {
        setError(`❌ ${err.response.data.msg}`);
      } else {
        setError("❌ Registration failed. Please try again.");
      }
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
          disabled={loading}
        />
        
        <label>� Email Address:</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email address"
          value={form.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        
        <label>�🔒 Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Create a secure password (min 6 characters)"
          value={form.password}
          onChange={handleChange}
          required
          disabled={loading}
          minLength={6}
        />
        
        <label>🔒 Confirm Password:</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
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