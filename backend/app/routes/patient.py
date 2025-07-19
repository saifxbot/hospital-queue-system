from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Patient
from app.utils import role_required

patient_bp = Blueprint("patient", __name__)

# Notoon patient add
@patient_bp.route("/", methods=["POST"])
def add_patient():
    data = request.get_json()
    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")
    phone = data.get("phone")
    address = data.get("address")
    if not name or not age or not gender:
        return jsonify({"msg": "Name, age, gender lagbe"}), 400
    patient = Patient(name=name, age=age, gender=gender, phone=phone, address=address)
    db.session.add(patient)
    db.session.commit()
    return jsonify({"msg": "Patient add hoyeche", "id": patient.id}), 201

# Shob patient dekhao
@patient_bp.route("/", methods=["GET"])
def get_patients():
    patients = Patient.query.all()
    data = []
    for p in patients:
        data.append({
            "id": p.id,
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "phone": p.phone,
            "address": p.address,
        })
    return jsonify(data), 200

# Specific patient dekhao
@patient_bp.route("/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    p = Patient.query.get_or_404(patient_id)
    data = {
        "id": p.id,
        "name": p.name,
        "age": p.age,
        "gender": p.gender,
        "phone": p.phone,
        "address": p.address,
    }
    return jsonify(data), 200

# Patient update koro
@patient_bp.route("/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    p = Patient.query.get_or_404(patient_id)
    data = request.get_json()
    p.name = data.get("name", p.name)
    p.age = data.get("age", p.age)
    p.gender = data.get("gender", p.gender)
    p.phone = data.get("phone", p.phone)
    p.address = data.get("address", p.address)
    db.session.commit()
    return jsonify({"msg": "Patient update hoyeche"}), 200

# Patient delete koro
@patient_bp.route("/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    p = Patient.query.get_or_404(patient_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({"msg": "Patient delete hoyeche"}), 200