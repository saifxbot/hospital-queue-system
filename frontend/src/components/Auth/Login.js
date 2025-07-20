import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { setToken } from '../../utils/auth';

const Login = () => {
  const [step, setStep] = useState(1); // 1: credentials, 2: verification
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    verificationCode: ''
  });
  const [userId, setUserId] = useState(null); // Store user ID for 2FA
  const [devCode, setDevCode] = useState(null); // Store development code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', {
        username: formData.username,
        password: formData.password
      });

      if (response.data.two_factor_required) {
        setUserId(response.data.user_id);
        setDevCode(response.data.dev_code || null);
        setStep(2);
      } else if (response.data.access_token) {
        setToken(response.data.access_token);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/verify-2fa', {
        user_id: userId,
        verification_code: formData.verificationCode
      });

      if (response.data.access_token) {
        setToken(response.data.access_token);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const response = await api.post('/api/auth/resend-code', {
        user_id: userId
      });
      setResendMessage('Verification code sent to your email');
      if (response.data.dev_code) {
        setDevCode(response.data.dev_code);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep(1);
    setFormData({ ...formData, verificationCode: '' });
    setError('');
    setResendMessage('');
    setDevCode(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>
            {step === 1 ? 'Sign In' : 'Email Verification'}
          </h2>
          <p>
            {step === 1 
              ? 'Welcome back! Please sign in to your account.'
              : 'Please enter the verification code sent to your email.'
            }
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {resendMessage && <div className="success-message">{resendMessage}</div>}
        {devCode && (
          <div className="dev-code-message" style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            color: '#856404',
            padding: '15px',
            borderRadius: '8px',
            margin: '20px 0',
            fontSize: '16px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            🔧 <strong>Development Mode:</strong><br/>
            Your verification code is: <span style={{fontSize: '24px', color: '#d63384'}}>{devCode}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit}>
            <div className="form-group">
              <label htmlFor="verificationCode">Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleInputChange}
                required
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="[0-9]{6}"
              />
              <small className="form-text">
                Check your email for the verification code
              </small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <div className="verification-actions">
              <button
                type="button"
                className="btn-link"
                onClick={handleResendCode}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>

              <button
                type="button"
                className="btn-link"
                onClick={handleBackToLogin}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
