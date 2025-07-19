import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { isLoggedIn, getToken } from '../../utils/auth';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [deletingAppointment, setDeletingAppointment] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    console.log('AppointmentList - Component mounted');
    console.log('AppointmentList - Authentication status:', isLoggedIn());
    
    if (isLoggedIn()) {
      fetchAppointments();
    } else {
      console.log('AppointmentList - User not authenticated');
      setError('Please log in to view your appointments');
      setLoading(false);
    }

    // Set up auto-refresh every 30 seconds to catch new appointments
    const refreshInterval = setInterval(() => {
      if (isLoggedIn()) {
        console.log('AppointmentList - Auto-refreshing appointments...');
        fetchAppointments();
      }
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchAppointments = async () => {
    try {
      console.log('AppointmentList - Fetching appointments...');
      const token = getToken();
      console.log('AppointmentList - Token available:', !!token);
      
      const response = await api.get('/api/appointment/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('AppointmentList - API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
        
        // Extract user info from the first appointment if available
        if (response.data.length > 0) {
          console.log('AppointmentList - Setting user info from appointment data');
          setUserInfo({
            name: response.data[0].patient_name || 'Current User',
            user_id: 'Current User',
            total_appointments: response.data.length
          });
        }
      } else {
        console.log('AppointmentList - Unexpected response format:', response.data);
        setAppointments([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('AppointmentList - Error fetching appointments:', err);
      if (err.response) {
        console.error('AppointmentList - Error response:', err.response.data);
        if (err.response.status === 401) {
          setError('Please login to view your appointments');
        } else {
          setError(`Error: ${err.response.data.message || 'Failed to fetch appointments'}`);
        }
      } else {
        setError('Network error - please check your connection');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setSuccessMessage("");
    fetchAppointments();
  };

  // Check if appointment is expired
  const isAppointmentExpired = (appointmentTime) => {
    if (!appointmentTime) return false;
    const appointmentDate = new Date(appointmentTime);
    const now = new Date();
    return appointmentDate < now;
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId, doctorName) => {
    if (!window.confirm(`Are you sure you want to cancel your appointment with Dr. ${doctorName}?`)) {
      return;
    }

    setDeletingAppointment(appointmentId);
    setError("");
    
    try {
      const token = getToken();
      await api.delete(`/api/appointment/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove the appointment from the list
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      setSuccessMessage(`✅ Appointment with Dr. ${doctorName} has been cancelled successfully.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

    } catch (err) {
      console.error('Error cancelling appointment:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to cancel this appointment.');
      } else if (err.response?.status === 404) {
        setError('Appointment not found. It may have already been cancelled.');
      } else {
        setError('Failed to cancel appointment. Please try again.');
      }
    } finally {
      setDeletingAppointment(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch (error) {
      console.error('AppointmentList - Error formatting date:', error);
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('AppointmentList - Error formatting time:', error);
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-container">
        <div className="error-message">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2>My Appointments</h2>
        <p className="appointments-subtitle">
          Manage and track your medical appointments
        </p>
        <button 
          onClick={handleRefresh} 
          className="btn-refresh"
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            marginTop: '1rem'
          }}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Appointments'}
        </button>
      </div>

      {userInfo && (
        <div className="user-info">
          <h3>👤 Patient Information</h3>
          <p><strong>Name:</strong> {userInfo.name || 'N/A'}</p>
          <p><strong>User ID:</strong> {userInfo.user_id || 'N/A'}</p>
          <p><strong>Total Appointments:</strong> {appointments.length}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#155724',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          {successMessage}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <div className="no-appointments-icon">📅</div>
          <h3>No Appointments Found</h3>
          <p>
            You don't have any appointments yet. 
            <br />
            Book your first appointment to get started!
          </p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => {
            const isExpired = isAppointmentExpired(appointment.appointment_time);
            const isDeleting = deletingAppointment === appointment.id;
            
            return (
              <div key={appointment.id} className={`appointment-card ${isExpired ? 'expired' : ''}`}>
                {/* Expiration Alert */}
                {isExpired && (
                  <div style={{
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    marginBottom: '1rem',
                    color: '#721c24',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ <span>This appointment has expired</span>
                  </div>
                )}

                <div className="appointment-header">
                  <span className="appointment-id">
                    ID: {appointment.id}
                  </span>
                  <span className={`appointment-status ${(appointment.status || 'scheduled').toLowerCase()} ${isExpired ? 'expired' : ''}`}>
                    {isExpired ? 'Expired' : (appointment.status || 'Scheduled')}
                  </span>
                </div>

                <div className="doctor-info">
                  <div className="doctor-name">
                    {appointment.doctor_name || 'Doctor information not available'}
                  </div>
                  {appointment.doctor_specialty && (
                    <div className="doctor-specialty">
                      {appointment.doctor_specialty}
                    </div>
                  )}
                </div>

                <div className="appointment-date">
                  📅 {formatDate(appointment.appointment_time)}
                </div>

                <div className="appointment-details">
                  <div className="detail-row">
                    <span className="detail-label">🕐 Time:</span>
                    <span className="detail-value">
                      {formatTime(appointment.appointment_time)}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">👤 Patient:</span>
                    <span className="detail-value">
                      {appointment.patient_name || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">📋 Type:</span>
                    <span className="detail-value">
                      {appointment.appointment_type || 'General Consultation'}
                    </span>
                  </div>
                  
                  {appointment.notes && (
                    <div className="detail-row">
                      <span className="detail-label">📝 Notes:</span>
                      <span className="detail-value">{appointment.notes}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">📅 Created:</span>
                    <span className="detail-value">
                      {formatDate(appointment.created_at)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'space-between'
                }}>
                  {!isExpired && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id, appointment.doctor_name)}
                      disabled={isDeleting}
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: isDeleting ? '#ccc' : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                        color: 'white',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: isDeleting ? 'none' : '0 4px 15px rgba(220, 53, 69, 0.3)'
                      }}
                    >
                      {isDeleting ? (
                        <>
                          <span className="loading" style={{ width: '16px', height: '16px' }}></span> Cancelling...
                        </>
                      ) : (
                        '🗑️ Cancel Appointment'
                      )}
                    </button>
                  )}
                  
                  {isExpired && (
                    <div style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      color: '#6c757d',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      📋 Appointment Completed
                    </div>
                  )}
                  
                  <button
                    onClick={handleRefresh}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '2px solid #667eea',
                      background: 'white',
                      color: '#667eea',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;