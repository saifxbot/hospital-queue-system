import React, { useState, useEffect } from "react";
import api from "../../api/api";

function AppointmentForm() {
  const [doctorId, setDoctorId] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available doctors
  useEffect(() => {
    api.get("/api/doctor/")
      .then(res => setDoctors(res.data))
      .catch(() => setError("Unable to fetch doctors."));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(""); 
    setMessage("");
    setLoading(true);
    
    try {
      await api.post("/api/appointment/", {
        doctor_id: doctorId,
        appointment_time: appointmentTime,
      });
      setMessage("🎉 Appointment booked successfully!");
      setDoctorId("");
      setAppointmentTime("");
    } catch (err) {
      setError("❌ Failed to book appointment. Please check your selection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today) for datetime input
  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fade-in">
      <h2>📅 Book New Appointment</h2>
      
      {/* Doctors Directory Section */}
      <div className="card mb-2">
        <h3>👨‍⚕️ Our Medical Specialists</h3>
        <p className="text-center mb-2">Browse our qualified doctors and their specializations</p>
        
        {doctors.length === 0 ? (
          <div className="text-center">
            <div className="loading"></div>
            <p>Loading doctors...</p>
          </div>
        ) : (
          <div className="dashboard">
            {doctors.map(doctor => (
              <div key={doctor.id} className="dashboard-card doctor-info-card">
                <div className="medical-icon">👨‍⚕️</div>
                <h4>Dr. {doctor.name}</h4>
                <div className="doctor-specialty">
                  <span className="status-badge status-scheduled">
                    {doctor.specialization}
                  </span>
                </div>
                {doctor.chamber && (
                  <p><strong>📍 Chamber:</strong> {doctor.chamber}</p>
                )}
                {doctor.available_days && (
                  <p><strong>📅 Available:</strong> {doctor.available_days}</p>
                )}
                {doctor.phone && (
                  <p><strong>📞 Contact:</strong> {doctor.phone}</p>
                )}
                <button 
                  type="button" 
                  className="btn-select-doctor"
                  onClick={() => setDoctorId(doctor.id.toString())}
                >
                  Select Dr. {doctor.name}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Appointment Booking Form */}
      <div className="card">
        <h3>📝 Appointment Booking Form</h3>
        <form onSubmit={handleSubmit}>
          {message && <p style={{color:"green"}}>{message}</p>}
          {error && <p style={{color:"red"}}>{error}</p>}
          
          <label>👨‍⚕️ Selected Doctor:</label>
          <select
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
            required
          >
            <option value="">Choose a doctor from above...</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
          
          <label>🗓️ Appointment Date & Time:</label>
          <input
            type="datetime-local"
            value={appointmentTime}
            onChange={e => setAppointmentTime(e.target.value)}
            min={getMinDateTime()}
            required
          />
          
          <button type="submit" disabled={loading || !doctorId}>
            {loading ? (
              <>
                <span className="loading"></span> Booking...
              </>
            ) : (
              "📅 Book Appointment"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;