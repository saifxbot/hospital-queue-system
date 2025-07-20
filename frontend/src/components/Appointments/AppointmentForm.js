import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { isLoggedIn } from "../../utils/auth";

function AppointmentForm() {
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch available doctors
  useEffect(() => {
    api.get("/api/doctor/")
      .then(res => {
        setDoctors(res.data);
        setFilteredDoctors(res.data);
        console.log("✅ Loaded doctors:", res.data.length);
      })
      .catch(() => setError("Unable to fetch doctors."));
  }, []);

  // Filter doctors based on search and specialty
  useEffect(() => {
    let filtered = doctors;
    
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => 
        doctor.specialization.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }
    
    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialty]);

  // Get unique specialties for filter
  const getSpecialties = () => {
    const specialties = [...new Set(doctors.map(doctor => doctor.specialization))];
    return specialties.sort();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(""); 
    setMessage("");
    setLoading(true);
    
    // Validate form data
    if (!doctorId) {
      setError("❌ Please select a doctor first.");
      setLoading(false);
      return;
    }
    
    if (!appointmentDate) {
      setError("❌ Please select an appointment date.");
      setLoading(false);
      return;
    }
    
    if (!appointmentTimeSlot) {
      setError("❌ Please select a time slot.");
      setLoading(false);
      return;
    }
    
    // Combine date and time
    const fullDateTime = `${appointmentDate}T${appointmentTimeSlot}:00`;
    
    console.log("📝 Booking appointment with:", {
      doctor_id: parseInt(doctorId),
      appointment_time: fullDateTime,
      selectedDoctor: selectedDoctor
    });
    
    try {
      const response = await api.post("/api/appointment/", {
        doctor_id: parseInt(doctorId),
        appointment_time: fullDateTime,
      });
      
      console.log("✅ Appointment created successfully:", response.data);
      
      // Show success confirmation
      setMessage("🎉 Appointment booked successfully!");
      setShowConfirmation(true);
      
      // Clear form after successful booking
      setTimeout(() => {
        setDoctorId("");
        setSelectedDoctor(null);
        setAppointmentDate("");
        setAppointmentTimeSlot("");
        setShowConfirmation(false);
        setMessage("");
      }, 4000);
      
    } catch (err) {
      console.error("❌ Appointment booking error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);
      
      if (err.response?.data?.msg) {
        setError(`❌ ${err.response.data.msg}`);
      } else if (err.response?.status === 401) {
        setError("❌ Please login to book appointments.");
      } else if (err.response?.status === 403) {
        setError("❌ You don't have permission to book appointments. Please login as a patient.");
      } else {
        setError("❌ Failed to book appointment. Please check your selection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle doctor selection - Open booking modal
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorId(doctor.id.toString());
    setShowBookingModal(true);
    setError("");
    setMessage("");
    // Reset form fields
    setAppointmentDate("");
    setAppointmentTimeSlot("");
  };

  // Handle booking modal close
  const handleCloseModal = () => {
    setShowBookingModal(false);
    setAppointmentDate("");
    setAppointmentTimeSlot("");
  };

  // Handle direct appointment booking from modal
  const handleBookFromModal = async () => {
    setError(""); 
    setMessage("");
    setLoading(true);
    
    // Validate form data
    if (!selectedDoctor) {
      setError("❌ Please select a doctor first.");
      setLoading(false);
      return;
    }
    
    if (!appointmentDate) {
      setError("❌ Please select an appointment date.");
      setLoading(false);
      return;
    }
    
    if (!appointmentTimeSlot) {
      setError("❌ Please select a time slot.");
      setLoading(false);
      return;
    }
    
    // Combine date and time
    const fullDateTime = `${appointmentDate}T${appointmentTimeSlot}:00`;
    
    console.log("📝 Booking appointment with:", {
      doctor_id: parseInt(selectedDoctor.id),
      appointment_time: fullDateTime,
      selectedDoctor: selectedDoctor
    });
    
    try {
      const response = await api.post("/api/appointment/", {
        doctor_id: parseInt(selectedDoctor.id),
        appointment_time: fullDateTime,
      });
      
      console.log("✅ Appointment created successfully:", response.data);
      
      // Close modal and show success
      setShowBookingModal(false);
      setShowConfirmation(true);
      setMessage("🎉 Appointment booked successfully!");
      
      // Clear form after successful booking
      setTimeout(() => {
        setDoctorId("");
        setSelectedDoctor(null);
        setAppointmentDate("");
        setAppointmentTimeSlot("");
        setShowConfirmation(false);
        setMessage("");
      }, 4000);
      
    } catch (err) {
      console.error("❌ Appointment booking error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);
      
      if (err.response?.data?.msg) {
        setError(`❌ ${err.response.data.msg}`);
      } else if (err.response?.status === 401) {
        setError("❌ Please login to book appointments.");
      } else if (err.response?.status === 403) {
        setError("❌ You don't have permission to book appointments. Please login as a patient.");
      } else {
        setError("❌ Failed to book appointment. Please check your selection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today) for date input
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get available time slots
  const getTimeSlots = () => {
    const slots = [];
    // Morning slots (9 AM to 12 PM)
    for (let hour = 9; hour <= 11; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    // Afternoon slots (2 PM to 6 PM)
    for (let hour = 14; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    // Evening slots (7 PM to 9 PM)
    for (let hour = 19; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Format time slot for display
  const formatTimeSlot = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2>📅 Book New Appointment</h2>
        <Link 
          to="/appointments" 
          style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          📋 View My Appointments
        </Link>
      </div>
      
      {/* Login Status Check */}
      {!isLoggedIn() && (
        <div className="card" style={{backgroundColor: "#f8d7da", borderColor: "#f5c6cb", marginBottom: "1rem"}}>
          <div className="text-center">
            <p style={{color: "#721c24", margin: "0.5rem 0"}}>
              ⚠️ <strong>Please login to book appointments.</strong>
            </p>
            <p style={{color: "#721c24", fontSize: "0.9rem"}}>
              You need to be logged in as a patient to book appointments with our doctors.
            </p>
          </div>
        </div>
      )}
      
      {/* Success Confirmation Modal */}
      {showConfirmation && (
        <div className="card" style={{backgroundColor: "#d4edda", borderColor: "#c3e6cb", marginBottom: "1rem"}}>
          <div className="text-center">
            <div style={{fontSize: "3rem", marginBottom: "1rem"}}>🎉</div>
            <h3 style={{color: "#155724"}}>Appointment Confirmed!</h3>
            <p style={{color: "#155724", fontSize: "1.1rem"}}>
              Your appointment with <strong>Dr. {selectedDoctor?.name}</strong> has been successfully booked.
            </p>
            <p style={{color: "#155724"}}>
              📅 <strong>Date:</strong> {new Date(appointmentDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p style={{color: "#155724"}}>
              🕐 <strong>Time:</strong> {formatTimeSlot(appointmentTimeSlot)}
            </p>
            <p style={{color: "#155724"}}>
              📍 <strong>Location:</strong> {selectedDoctor?.chamber}
            </p>
            <p style={{color: "#155724", fontSize: "0.9rem", fontStyle: "italic"}}>
              You can view all your appointments in the "View Appointments" section.
            </p>
          </div>
        </div>
      )}
      
      {/* Doctors Directory Section */}
      <div className="card mb-2">
        <h3>👨‍⚕️ Our Medical Specialists ({filteredDoctors.length} doctors)</h3>
        <p className="text-center mb-2">Browse our qualified doctors and their specializations</p>
        
        {/* Search and Filter Controls */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr auto', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          alignItems: 'end'
        }}>
          <div>
            <label>🔍 Search Doctors:</label>
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label>🩺 Filter by Specialty:</label>
            <select 
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              style={{ 
                width: '100%',
                background: 'white !important',
                color: '#333 !important',
                border: '2px solid #ddd',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="" style={{ background: 'white', color: '#333' }}>All Specialties</option>
              {getSpecialties().map(specialty => (
                <option key={specialty} value={specialty} style={{ background: 'white', color: '#333' }}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedSpecialty("");
            }}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
        
        {filteredDoctors.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
            {doctors.length === 0 ? (
              <>
                <div className="loading"></div>
                <p>Loading doctors...</p>
              </>
            ) : (
              <>
                <p>No doctors found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSpecialty("");
                  }}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  Clear Filters & Show All Doctors
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="dashboard">
            {filteredDoctors.map(doctor => (
              <div key={doctor.id} className={`dashboard-card doctor-info-card ${doctorId === doctor.id.toString() ? 'selected-doctor' : ''}`}>
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
                  className={`btn-select-doctor ${doctorId === doctor.id.toString() ? 'selected' : ''}`}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  {doctorId === doctor.id.toString() ? '✅ Selected' : `Select Dr. ${doctor.name}`}
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
          {message && <p style={{color:"green", textAlign: "center", fontWeight: "bold"}}>{message}</p>}
          {error && <p style={{color:"red", textAlign: "center", fontWeight: "bold"}}>{error}</p>}
          
          <label>👨‍⚕️ Selected Doctor:</label>
          <select
            value={doctorId}
            onChange={e => {
              setDoctorId(e.target.value);
              const doctor = doctors.find(d => d.id.toString() === e.target.value);
              setSelectedDoctor(doctor);
              if (doctor) {
                setMessage(`✅ Dr. ${doctor.name} selected! Please choose your appointment time.`);
              }
            }}
            required
            style={{
              background: 'white !important',
              color: '#333 !important',
              border: '2px solid #ddd',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '1rem',
              width: '100%'
            }}
          >
            <option value="" style={{ background: 'white', color: '#333' }}>Choose a doctor from above...</option>
            {filteredDoctors.map(doctor => (
              <option key={doctor.id} value={doctor.id} style={{ background: 'white', color: '#333' }}>
                Dr. {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
          
          {selectedDoctor && (
            <div style={{backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", margin: "1rem 0"}}>
              <h4>Selected Doctor Information:</h4>
              <p><strong>👨‍⚕️ Name:</strong> Dr. {selectedDoctor.name}</p>
              <p><strong>🩺 Specialization:</strong> {selectedDoctor.specialization}</p>
              <p><strong>📍 Chamber:</strong> {selectedDoctor.chamber}</p>
              <p><strong>📞 Contact:</strong> {selectedDoctor.phone}</p>
            </div>
          )}
          
          {/* Date and Time Selection Section */}
          {selectedDoctor && (
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '2px solid #667eea',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>
                📅 Schedule Your Appointment with Dr. {selectedDoctor.name}
              </h4>
              
              <label>🗓️ Select Date:</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                min={getMinDate()}
                required
                style={{ 
                  fontSize: '1rem', 
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                  width: '100%',
                  marginBottom: '1rem'
                }}
              />
              
              {appointmentDate && (
                <>
                  <label>🕐 Select Time Slot:</label>
                  <select
                    value={appointmentTimeSlot}
                    onChange={e => setAppointmentTimeSlot(e.target.value)}
                    required
                    style={{ 
                      fontSize: '1rem', 
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      backgroundColor: 'white !important',
                      color: '#333 !important',
                      width: '100%'
                    }}
                  >
                    <option value="" style={{ background: 'white', color: '#333' }}>Choose your preferred time...</option>
                    <optgroup label="🌅 Morning Slots (9:00 AM - 12:00 PM)" style={{ background: '#f8f9fa', color: '#333', fontWeight: '600' }}>
                      {getTimeSlots().slice(0, 6).map(slot => (
                        <option key={`morning-${slot}`} value={slot} style={{ background: 'white', color: '#333' }}>
                          {formatTimeSlot(slot)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌇 Afternoon Slots (2:00 PM - 6:00 PM)" style={{ background: '#f8f9fa', color: '#333', fontWeight: '600' }}>
                      {getTimeSlots().slice(6, 14).map(slot => (
                        <option key={`afternoon-${slot}`} value={slot} style={{ background: 'white', color: '#333' }}>
                          {formatTimeSlot(slot)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌙 Evening Slots (7:00 PM - 9:00 PM)" style={{ background: '#f8f9fa', color: '#333', fontWeight: '600' }}>
                      {getTimeSlots().slice(14).map(slot => (
                        <option key={`evening-${slot}`} value={slot} style={{ background: 'white', color: '#333' }}>
                          {formatTimeSlot(slot)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  
                  {appointmentTimeSlot && (
                    <div style={{
                      backgroundColor: '#e8f4fd',
                      border: '1px solid #bee5eb',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginTop: '1rem'
                    }}>
                      <h4 style={{ color: '#0c5460', margin: '0 0 0.5rem 0' }}>📅 Appointment Summary</h4>
                      <p style={{ color: '#0c5460', margin: '0.25rem 0' }}>
                        <strong>Date:</strong> {new Date(appointmentDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p style={{ color: '#0c5460', margin: '0.25rem 0' }}>
                        <strong>Time:</strong> {formatTimeSlot(appointmentTimeSlot)}
                      </p>
                      <p style={{ color: '#0c5460', margin: '0.25rem 0' }}>
                        <strong>Doctor:</strong> Dr. {selectedDoctor.name} ({selectedDoctor.specialization})
                      </p>
                      <p style={{ color: '#0c5460', margin: '0.25rem 0' }}>
                        <strong>Location:</strong> {selectedDoctor.chamber || 'Hospital Main Building'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          <button type="submit" disabled={loading || !doctorId || !appointmentDate || !appointmentTimeSlot}>
            {loading ? (
              <>
                <span className="loading"></span> Booking Your Appointment...
              </>
            ) : (
              "📅 Book Appointment"
            )}
          </button>
        </form>
      </div>
      
      {/* Booking Modal Popup */}
      {showBookingModal && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666 !important'
              }}
            >
              ✕
            </button>
            
            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3>📅 Book Appointment</h3>
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '2px solid #667eea',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h4>👨‍⚕️ Dr. {selectedDoctor.name}</h4>
                <p><strong>🩺 Specialization:</strong> {selectedDoctor.specialization}</p>
                <p><strong>📍 Chamber:</strong> {selectedDoctor.chamber || 'Hospital Main Building'}</p>
                <p><strong>📞 Contact:</strong> {selectedDoctor.phone || 'N/A'}</p>
              </div>
            </div>
            
            {/* Error Display */}
            {error && (
              <div style={{
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#721c24 !important',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            {/* Date Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <label>🗓️ Select Date:</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                min={getMinDate()}
                required
              />
            </div>
            
            {/* Time Selection */}
            {appointmentDate && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label>🕐 Select Time:</label>
                <select
                  value={appointmentTimeSlot}
                  onChange={e => setAppointmentTimeSlot(e.target.value)}
                  required
                >
                  <option value="">Choose your preferred time...</option>
                  <optgroup label="🌅 Morning Slots (9:00 AM - 12:00 PM)">
                    {getTimeSlots().slice(0, 6).map(slot => (
                      <option key={`morning-${slot}`} value={slot}>
                        {formatTimeSlot(slot)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌇 Afternoon Slots (2:00 PM - 6:00 PM)">
                    {getTimeSlots().slice(6, 14).map(slot => (
                      <option key={`afternoon-${slot}`} value={slot}>
                        {formatTimeSlot(slot)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌙 Evening Slots (7:00 PM - 9:00 PM)">
                    {getTimeSlots().slice(14).map(slot => (
                      <option key={`evening-${slot}`} value={slot}>
                        {formatTimeSlot(slot)}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
            
            {/* Appointment Summary */}
            {appointmentDate && appointmentTimeSlot && (
              <div style={{
                backgroundColor: '#e8f4fd',
                border: '1px solid #bee5eb',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ color: '#0c5460 !important', margin: '0 0 0.5rem 0' }}>
                  📅 Appointment Summary
                </h4>
                <p style={{ color: '#0c5460 !important', margin: '0.25rem 0' }}>
                  <strong>Date:</strong> {new Date(appointmentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p style={{ color: '#0c5460 !important', margin: '0.25rem 0' }}>
                  <strong>Time:</strong> {formatTimeSlot(appointmentTimeSlot)}
                </p>
                <p style={{ color: '#0c5460 !important', margin: '0.25rem 0' }}>
                  <strong>Doctor:</strong> Dr. {selectedDoctor.name}
                </p>
              </div>
            )}
            
            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #6c757d',
                  backgroundColor: 'white',
                  color: '#6c757d !important',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBookFromModal}
                disabled={loading || !appointmentDate || !appointmentTimeSlot}
                style={{
                  flex: 2,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: appointmentDate && appointmentTimeSlot 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#ccc',
                  color: 'white !important',
                  cursor: appointmentDate && appointmentTimeSlot ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <span className="loading"></span> Booking...
                  </>
                ) : (
                  "📅 Confirm Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentForm;