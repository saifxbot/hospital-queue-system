import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '' // Can be email or user_id
  });
  const [resetData, setResetData] = useState({
    code: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'code'

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setMessage('');
  };

  const handleResetInputChange = (e) => {
    setResetData({
      ...resetData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/api/auth/forgot-password', {
        identifier: formData.identifier.trim()
      });

      setMessage(response.data.msg);
      setSubmitted(true);
      setStep('code'); // Move to code input step
      
      // If there's a dev_code (development mode), show it
      if (response.data.dev_code) {
        setMessage(response.data.msg + ` (Dev Code: ${response.data.dev_code})`);
      }
      // If there's a dev_token (backwards compatibility), show it
      else if (response.data.dev_token) {
        setMessage(response.data.msg + ` (Dev Token: ${response.data.dev_token})`);
      }
      
    } catch (error) {
      setError(error.response?.data?.msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!resetData.code.trim()) {
      setError('Please enter the reset code.');
      setLoading(false);
      return;
    }

    if (resetData.new_password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (resetData.new_password !== resetData.confirm_password) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/reset-password', {
        code: resetData.code.trim(),
        new_password: resetData.new_password
      });

      setMessage('Password reset successful! You can now login with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && step === 'code') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>🔐 Enter Reset Code</h2>
            <p>Enter the 6-digit code sent to your email</p>
          </div>
          
          <div className="auth-content">
            {message && (
              <div className="success-message">
                <p>{message}</p>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleResetSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="code">Reset Code</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={resetData.code}
                  onChange={handleResetInputChange}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  style={{ fontSize: '18px', letterSpacing: '4px', textAlign: 'center' }}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={resetData.new_password}
                  onChange={handleResetInputChange}
                  placeholder="Enter new password"
                  minLength="6"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={resetData.confirm_password}
                  onChange={handleResetInputChange}
                  placeholder="Confirm new password"
                  minLength="6"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-full-width"
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
            
            <div className="auth-actions">
              <button 
                onClick={() => {
                  setStep('email');
                  setSubmitted(false);
                  setMessage('');
                  setError('');
                  setResetData({ code: '', new_password: '', confirm_password: '' });
                }}
                className="btn btn-secondary"
              >
                Back to Email
              </button>
              <Link to="/login" className="btn btn-link">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>📧 Check Your Email</h2>
          </div>
          
          <div className="auth-content">
            <div className="success-message">
              <p>{message}</p>
            </div>
            
            <div className="auth-info">
              <p>We've sent a 6-digit reset code to your email address.</p>
              <p>Please check your inbox and use the code to reset your password.</p>
              <p><strong>Note:</strong> The reset code will expire in 1 hour.</p>
            </div>
            
            <div className="auth-actions">
              <button 
                onClick={() => setStep('code')}
                className="btn btn-primary"
              >
                Enter Reset Code
              </button>
              <Link to="/login" className="btn btn-secondary">
                Back to Login
              </Link>
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setStep('email');
                  setMessage('');
                  setError('');
                  setFormData({ identifier: '' });
                  setResetData({ code: '', new_password: '', confirm_password: '' });
                }}
                className="btn btn-link"
              >
                Send Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔒 Forgot Password</h2>
          <p>Enter your email or user ID to reset your password</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <div className="form-group">
            <label htmlFor="identifier">Email or User ID</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="Enter your email or user ID"
              required
              disabled={loading}
            />
            <small className="form-help">
              You can use either your email address or your user ID
            </small>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading || !formData.identifier.trim()}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>
        
        <div className="auth-footer">
          <div className="auth-links">
            <Link to="/login">← Back to Login</Link>
            <Link to="/register">Don't have an account? Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
