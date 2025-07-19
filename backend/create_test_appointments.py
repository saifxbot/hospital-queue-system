#!/usr/bin/env python3
"""
Create test appointments for different users to test individual visibility
"""
from app import create_app
from app.extensions import db
from app.models import Appointment, Patient, Doctor
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Get some patients and doctors
    patients = Patient.query.limit(4).all()
    doctors = Doctor.query.limit(3).all()
    
    if len(patients) < 2 or len(doctors) < 1:
        print("Not enough patients or doctors to create test appointments")
        exit()
    
    print("Creating test appointments for different users...")
    
    # Create appointments for different patients
    test_appointments = [
        {
            "patient": patients[0],  # saif
            "doctor": doctors[0],
            "time": datetime.now() + timedelta(days=1, hours=10),
            "description": "Cardiology consultation"
        },
        {
            "patient": patients[1],  # imam  
            "doctor": doctors[1],
            "time": datetime.now() + timedelta(days=2, hours=14),
            "description": "General checkup"
        },
        {
            "patient": patients[2],  # newuser
            "doctor": doctors[2],
            "time": datetime.now() + timedelta(days=3, hours=9),
            "description": "Pediatric consultation"
        }
    ]
    
    for apt_data in test_appointments:
        # Check if appointment already exists for this patient and doctor
        existing = Appointment.query.filter_by(
            patient_id=apt_data["patient"].id,
            doctor_id=apt_data["doctor"].id
        ).first()
        
        if not existing:
            appointment = Appointment(
                patient_id=apt_data["patient"].id,
                doctor_id=apt_data["doctor"].id,
                appointment_time=apt_data["time"],
                status="scheduled"
            )
            db.session.add(appointment)
            print(f"✅ Created appointment for {apt_data['patient'].name} with Dr. {apt_data['doctor'].name}")
        else:
            print(f"⚠️ Appointment already exists for {apt_data['patient'].name} with Dr. {apt_data['doctor'].name}")
    
    try:
        db.session.commit()
        print("\n🎉 Test appointments created successfully!")
        
        # Show summary
        all_appointments = Appointment.query.all()
        print(f"\n📊 Total appointments in database: {len(all_appointments)}")
        print("Appointments by patient:")
        for apt in all_appointments:
            print(f"  - {apt.patient.name} → Dr. {apt.doctor.name} on {apt.appointment_time}")
            
    except Exception as e:
        print(f"❌ Error creating appointments: {e}")
        db.session.rollback()
