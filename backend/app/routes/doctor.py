from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Doctor
from app.utils import role_required

doctor_bp = Blueprint("doctor", __name__)

# Doctor add koro
@doctor_bp.route("/", methods=["POST"])
@role_required("admin")
def add_doctor():
    # Only admin can add doctor
    data = request.get_json()
    name = data.get("name")
    specialization = data.get("specialization")
    phone = data.get("phone")
    chamber = data.get("chamber")
    available_days = data.get("available_days")
    if not name or not specialization:
        return jsonify({"msg": "Name & specialization lagbe"}), 400
    doctor = Doctor(
        name=name,
        specialization=specialization,
        phone=phone,
        chamber=chamber,
        available_days=available_days
    )
    db.session.add(doctor)
    db.session.commit()
    return jsonify({"msg": "Doctor add hoyeche", "id": doctor.id}), 201

# Shob doctor dekhao
@doctor_bp.route("/", methods=["GET"])
def get_doctors():
    doctors = Doctor.query.all()
    data = []
    for d in doctors:
        data.append({
            "id": d.id,
            "name": d.name,
            "specialization": d.specialization,
            "phone": d.phone,
            "chamber": d.chamber,
            "available_days": d.available_days
        })
    return jsonify(data), 200

# Specific doctor dekhao
@doctor_bp.route("/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    d = Doctor.query.get_or_404(doctor_id)
    data = {
        "id": d.id,
        "name": d.name,
        "specialization": d.specialization,
        "phone": d.phone,
        "chamber": d.chamber,
        "available_days": d.available_days
    }
    return jsonify(data), 200

# Doctor update koro
@doctor_bp.route("/<int:doctor_id>", methods=["PUT"])
def update_doctor(doctor_id):
    d = Doctor.query.get_or_404(doctor_id)
    data = request.get_json()
    d.name = data.get("name", d.name)
    d.specialization = data.get("specialization", d.specialization)
    d.phone = data.get("phone", d.phone)
    d.chamber = data.get("chamber", d.chamber)
    d.available_days = data.get("available_days", d.available_days)
    db.session.commit()
    return jsonify({"msg": "Doctor update hoyeche"}), 200

# Doctor delete koro
@doctor_bp.route("/<int:doctor_id>", methods=["DELETE"])
def delete_doctor(doctor_id):
    d = Doctor.query.get_or_404(doctor_id)
    db.session.delete(d)
    db.session.commit()
    return jsonify({"msg": "Doctor delete hoyeche"}), 200