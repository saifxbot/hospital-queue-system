from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Appointment, Patient, Doctor
from datetime import datetime
from flask_jwt_extended import get_jwt_identity
from app.utils import role_required

appointment_bp = Blueprint("appointment", __name__)

# Create appointment
@appointment_bp.route("/", methods=["POST"])
@role_required("patient")
def create_appointment():
    # Only patient can book appointment
    data = request.get_json()
    doctor_id = data.get("doctor_id")
    appointment_time = data.get("appointment_time")  # Expect ISO string
    user_id = get_jwt_identity()

    # Use the logged-in user's patient profile
    patient = Patient.query.filter_by(user_id=user_id).first()
    if not patient:
        return jsonify({"msg": "Patient profile not found"}), 404

    if not all([doctor_id, appointment_time]):
        return jsonify({"msg": "doctor_id, appointment_time lagbe"}), 400

    try:
        appointment_dt = datetime.fromisoformat(appointment_time)
    except Exception:
        return jsonify({"msg": "appointment_time format thik na (ISO)"}), 400

    appointment = Appointment(
        patient_id=patient.id,
        doctor_id=doctor_id,
        appointment_time=appointment_dt,
    )
    db.session.add(appointment)
    db.session.commit()
    return jsonify({"msg": "Appointment booked", "id": appointment.id}), 201

# List all appointments (optionally filter by doctor/patient)
@appointment_bp.route("/", methods=["GET"])
def list_appointments():
    doctor_id = request.args.get("doctor_id")
    patient_id = request.args.get("patient_id")
    q = Appointment.query
    if doctor_id:
        q = q.filter_by(doctor_id=doctor_id)
    if patient_id:
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
@role_required("patient", "admin")
def update_appointment(appointment_id):
    a = Appointment.query.get_or_404(appointment_id)
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
@role_required("patient", "admin")
def delete_appointment(appointment_id):
    a = Appointment.query.get_or_404(appointment_id)
    db.session.delete(a)
    db.session.commit()
    return jsonify({"msg": "Appointment delete hoyeche"}), 200