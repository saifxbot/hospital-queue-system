import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No reset token provided.');
        setVerifying(false);
        return;
      }

      try {
        const response = await api.post('/api/auth/verify-reset-token', {
          token: token
        });
        
        if (response.data.valid) {
          setTokenValid(true);
          setUserInfo({
            user_id: response.data.user_id,
            username: response.data.username
          });
        }
      } catch (error) {
        setError(error.response?.data?.msg || 'Invalid or expired reset token.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setMessage('');
  };

  const validatePasswords = () => {
    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/api/auth/reset-password', {
        token: token,
        new_password: formData.new_password
      });

      setMessage(response.data.msg);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! You can now login with your new password.' 
          }
        });
      }, 3000);
      
    } catch (error) {
      setError(error.response?.data?.msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>🔄 Verifying Reset Link</h2>
          </div>
          <div className="auth-content">
            <div className="loading-message">
              <p>Please wait while we verify your reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>❌ Invalid Reset Link</h2>
          </div>
          <div className="auth-content">
            <div className="error-message">
              <p>{error}</p>
            </div>
            <div className="auth-info">
              <p>This reset link may have expired or been used already.</p>
              <p>Please request a new password reset if you still need to change your password.</p>
            </div>
            <div className="auth-actions">
              <Link to="/forgot-password" className="btn btn-primary">
                Request New Reset Link
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state after password reset
  if (message) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>✅ Password Reset Successful</h2>
          </div>
          <div className="auth-content">
            <div className="success-message">
              <p>{message}</p>
            </div>
            <div className="auth-info">
              <p>Redirecting you to the login page in a few seconds...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔐 Reset Password</h2>
          {userInfo && (
            <p>Setting new password for: <strong>{userInfo.username}</strong> ({userInfo.user_id})</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              required
              disabled={loading}
              minLength={6}
            />
            <small className="form-help">
              Password must be at least 6 characters long
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm_password">Confirm New Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              required
              disabled={loading}
              minLength={6}
            />
            <small className="form-help">
              Re-enter your new password to confirm
            </small>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading || !formData.new_password || !formData.confirm_password}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="auth-footer">
          <div className="auth-links">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
