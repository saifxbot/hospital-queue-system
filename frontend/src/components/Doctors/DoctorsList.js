import React, { useEffect, useState } from "react";
import api from "../../api/api";

function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/api/doctor/");
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        setError("Unable to fetch doctors information.");
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <div className="loading"></div>
        <p>Loading doctors information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <h3>⚠️ Unable to Load Doctors</h3>
        <p style={{color: "red"}}>{error}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2>👨‍⚕️ Our Medical Team</h2>
      <p className="text-center mb-2">Meet our qualified doctors and their areas of expertise</p>
      
      {doctors.length === 0 ? (
        <div className="card text-center">
          <h3>No doctors available</h3>
          <p>Currently, no doctors are registered in our system.</p>
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
                <p><strong>📅 Available Days:</strong> {doctor.available_days}</p>
              )}
              
              {doctor.phone && (
                <p><strong>📞 Contact:</strong> {doctor.phone}</p>
              )}
              
              <div className="doctor-actions">
                <p style={{fontSize: "0.9rem", color: "#666", fontStyle: "italic", marginTop: "1rem"}}>
                  To book an appointment with Dr. {doctor.name}, please login to your account.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorsList;
