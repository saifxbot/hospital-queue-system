import React, { useEffect, useState } from "react";
import api from "../../api/api";

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/api/appointment/")
      .then(res => {
        setAppointments(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to fetch appointments.");
        setLoading(false);
      });
  }, []);

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'canceled': return 'status-canceled';
      case 'waiting': return 'status-waiting';
      default: return 'status-scheduled';
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="loading"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2>📋 Your Appointments</h2>
      {error && <p style={{color:"red"}}>{error}</p>}
      
      {appointments.length === 0 ? (
        <div className="card text-center">
          <h3>No appointments found</h3>
          <p>You don't have any appointments scheduled yet.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td>#{a.id}</td>
                  <td>{a.patient_name}</td>
                  <td>{a.doctor_name}</td>
                  <td>{new Date(a.appointment_time).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AppointmentList;