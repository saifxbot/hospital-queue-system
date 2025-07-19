from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Appointment, Patient, Doctor
from datetime import datetime

from app.utils import role_required
from flask_jwt_extended import get_jwt_identity

appointment_bp = Blueprint("appointment", __name__)

# Create appointment
@appointment_bp.route("/", methods=["POST"])
@role_required("patient")
def create_appointment():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)  # Convert string back to integer
    
    # Get the patient profile for the logged-in user
    patient = Patient.query.filter_by(user_id=user_id).first()
    if not patient:
        # Auto-create patient profile if it doesn't exist
        from app.models import User
        user = User.query.get(user_id)
        patient = Patient(
            user_id=user_id,
            name=user.username,
            age=0,
            gender="Not specified",
            phone="",
            address=""
        )
        db.session.add(patient)
        db.session.commit()

    data = request.get_json()
    doctor_id = data.get("doctor_id")
    appointment_time = data.get("appointment_time")  # Expect ISO string

    if not all([doctor_id, appointment_time]):
        return jsonify({"msg": "doctor_id, appointment_time lagbe"}), 400

    # Verify doctor exists
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"msg": "Doctor not found"}), 404

    try:
        # Handle different datetime formats
        if 'T' in appointment_time:
            appointment_dt = datetime.fromisoformat(appointment_time.replace('Z', '+00:00'))
        else:
            appointment_dt = datetime.strptime(appointment_time, '%Y-%m-%dT%H:%M')
    except Exception as e:
        return jsonify({"msg": "appointment_time format thik na (ISO)"}), 400

    try:
        appointment = Appointment(
            patient_id=patient.id,
            doctor_id=doctor_id,
            appointment_time=appointment_dt,
        )
        db.session.add(appointment)
        db.session.commit()
        return jsonify({"msg": "Appointment booked", "id": appointment.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Database error occurred"}), 500

# List appointments based on user role and permissions
@appointment_bp.route("/", methods=["GET"])
def list_appointments():
    # Check JWT token and get user
    try:
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request()
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
    except Exception as e:
        return jsonify({"msg": "Authentication required"}), 401
    
    from app.models import User
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Filter appointments based on user role
    q = Appointment.query
    
    if user.role == "patient":
        # Patients can only see their own appointments
        patient = Patient.query.filter_by(user_id=user_id).first()
        if not patient:
            return jsonify([]), 200  # No patient profile, return empty list
        q = q.filter_by(patient_id=patient.id)
        
    elif user.role == "doctor":
        # Doctors can only see appointments for themselves
        doctor = Doctor.query.filter_by(user_id=user_id).first()
        if not doctor:
            return jsonify([]), 200  # No doctor profile, return empty list
        q = q.filter_by(doctor_id=doctor.id)
        
    # Admins can see all appointments (no additional filtering)
    
    # Optional additional filters from query parameters
    doctor_id = request.args.get("doctor_id")
    patient_id = request.args.get("patient_id")
    if doctor_id and user.role == "admin":  # Only admins can filter by doctor
        q = q.filter_by(doctor_id=doctor_id)
    if patient_id and user.role == "admin":  # Only admins can filter by patient
        q = q.filter_by(patient_id=patient_id)
    
    appts = q.order_by(Appointment.appointment_time).all()
    data = []
    for a in appts:
        data.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "patient_name": a.patient.name,
            "doctor_id": a.doctor_id,
            "doctor_name": a.doctor.name,
            "appointment_time": a.appointment_time.isoformat(),
            "status": a.status,
        })
    return jsonify(data), 200

# Update appointment status or time
@appointment_bp.route("/<int:appointment_id>", methods=["PUT"])
def update_appointment(appointment_id):
    # Check JWT token and get user
    try:
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request()
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
    except Exception as e:
        return jsonify({"msg": "Authentication required"}), 401
    
    from app.models import User
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    a = Appointment.query.get_or_404(appointment_id)
    
    # Check if user has permission to update this appointment
    if user.role == "patient":
        patient = Patient.query.filter_by(user_id=user_id).first()
        if not patient or a.patient_id != patient.id:
            return jsonify({"msg": "Access denied"}), 403
    elif user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=user_id).first()
        if not doctor or a.doctor_id != doctor.id:
            return jsonify({"msg": "Access denied"}), 403
    # Admins can update any appointment
    
    data = request.get_json()
    status = data.get("status")
    appointment_time = data.get("appointment_time")
    if appointment_time:
        try:
            a.appointment_time = datetime.fromisoformat(appointment_time)
        except Exception:
            return jsonify({"msg": "appointment_time format thik na (ISO)"}), 400
    if status:
        a.status = status
    db.session.commit()
    return jsonify({"msg": "Appointment update hoyeche"}), 200

# Delete appointment
@appointment_bp.route("/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    # Check JWT token and get user
    try:
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request()
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
    except Exception as e:
        return jsonify({"msg": "Authentication required"}), 401
    
    from app.models import User
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    a = Appointment.query.get_or_404(appointment_id)
    
    # Check if user has permission to delete this appointment
    if user.role == "patient":
        patient = Patient.query.filter_by(user_id=user_id).first()
        if not patient or a.patient_id != patient.id:
            return jsonify({"msg": "Access denied"}), 403
    elif user.role == "doctor":
        doctor = Doctor.query.filter_by(user_id=user_id).first()
        if not doctor or a.doctor_id != doctor.id:
            return jsonify({"msg": "Access denied"}), 403
    # Admins can delete any appointment
    
    db.session.delete(a)
    db.session.commit()
    return jsonify({"msg": "Appointment delete hoyeche"}), 200