from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Queue, Patient, Doctor
from app.utils import role_required

queue_bp = Blueprint("queue", __name__)

# Notun patient queue te add
@queue_bp.route("/", methods=["POST"])
def add_to_queue():
    data = request.get_json()
    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    if not patient_id or not doctor_id:
        return jsonify({"msg": "patient_id & doctor_id lagbe"}), 400

    # Last serial check
    last_queue = Queue.query.filter_by(doctor_id=doctor_id).order_by(Queue.serial.desc()).first()
    next_serial = 1 if not last_queue else last_queue.serial + 1

    queue_entry = Queue(patient_id=patient_id, doctor_id=doctor_id, serial=next_serial)
    db.session.add(queue_entry)
    db.session.commit()
    return jsonify({"msg": "Queue te add hoyeche", "serial": next_serial, "id": queue_entry.id}), 201

# Ek doctor er shob queue dekha
@queue_bp.route("/doctor/<int:doctor_id>", methods=["GET"])
def get_queue_for_doctor(doctor_id):
    qlist = Queue.query.filter_by(doctor_id=doctor_id).order_by(Queue.serial).all()
    data = []
    for q in qlist:
        data.append({
            "queue_id": q.id,
            "patient_id": q.patient_id,
            "patient_name": q.patient.name,
            "serial": q.serial,
            "status": q.status,
            "created_at": q.created_at
        })
    return jsonify(data), 200

# Queue status update (served/canceled)
@queue_bp.route("/<int:queue_id>", methods=["PUT"])
def update_queue_status(queue_id):
    q = Queue.query.get_or_404(queue_id)
    data = request.get_json()
    status = data.get("status")
    if status not in ["waiting", "served", "canceled"]:
        return jsonify({"msg": "Invalid status"}), 400
    q.status = status
    db.session.commit()
    return jsonify({"msg": "Queue status update hoyeche"}), 200

# Queue theke patient delete koro (optional)
@queue_bp.route("/<int:queue_id>", methods=["DELETE"])
def delete_queue(queue_id):
    q = Queue.query.get_or_404(queue_id)
    db.session.delete(q)
    db.session.commit()
    return jsonify({"msg": "Queue theke delete hoyeche"}), 200