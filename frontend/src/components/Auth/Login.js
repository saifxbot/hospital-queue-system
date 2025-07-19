import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { setToken } from "../../utils/auth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await api.post("/api/auth/login", { username, password });
      setToken(res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("❌ Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h2>🔐 Welcome Back</h2>
      
      <form onSubmit={handleSubmit}>
        {error && <p style={{color: "red"}}>{error}</p>}
        
        <label>👤 Username:</label>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        
        <label>🔒 Password:</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="loading"></span> Signing In...
            </>
          ) : (
            "🚀 Sign In"
          )}
        </button>
      </form>
    </div>
  );
}

export default Login;