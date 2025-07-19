#!/usr/bin/env python3
"""
Create test appointments with expired dates to test expiration functionality
"""
from app import create_app
from app.extensions import db
from app.models import Appointment, Patient, Doctor
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Get some patients and doctors
    patients = Patient.query.limit(3).all()
    doctors = Doctor.query.limit(3).all()
    
    if len(patients) < 1 or len(doctors) < 1:
        print("Not enough patients or doctors to create test appointments")
        exit()
    
    print("Creating test expired appointments...")
    
    # Create expired appointments for testing
    test_expired_appointments = [
        {
            "patient": patients[0],
            "doctor": doctors[0],
            "time": datetime.now() - timedelta(days=1, hours=2),  # Yesterday
            "description": "Expired - Cardiology consultation"
        },
        {
            "patient": patients[0],
            "doctor": doctors[1],
            "time": datetime.now() - timedelta(days=3, hours=5),  # 3 days ago
            "description": "Expired - General checkup"
        },
        {
            "patient": patients[0],
            "doctor": doctors[2],
            "time": datetime.now() - timedelta(weeks=1),  # 1 week ago
            "description": "Expired - Pediatric consultation"
        }
    ]
    
    for apt_data in test_expired_appointments:
        # Check if similar appointment already exists
        existing = Appointment.query.filter_by(
            patient_id=apt_data["patient"].id,
            doctor_id=apt_data["doctor"].id
        ).filter(
            Appointment.appointment_time < datetime.now()
        ).first()
        
        if not existing:
            appointment = Appointment(
                patient_id=apt_data["patient"].id,
                doctor_id=apt_data["doctor"].id,
                appointment_time=apt_data["time"],
                status="expired"
            )
            db.session.add(appointment)
            print(f"✅ Created expired appointment: {apt_data['patient'].name} with Dr. {apt_data['doctor'].name} on {apt_data['time'].strftime('%Y-%m-%d %H:%M')}")
        else:
            print(f"❌ Similar expired appointment already exists for {apt_data['patient'].name} with Dr. {apt_data['doctor'].name}")
    
    try:
        db.session.commit()
        print("\n🎉 Test expired appointments created successfully!")
        
        # Show summary
        total_expired = Appointment.query.filter(
            Appointment.appointment_time < datetime.now()
        ).count()
        print(f"📊 Total expired appointments in database: {total_expired}")
        
        # Show recent expired appointments
        recent_expired = Appointment.query.filter(
            Appointment.appointment_time < datetime.now()
        ).order_by(Appointment.appointment_time.desc()).limit(5).all()
        
        print("\n🕐 Recent Expired Appointments:")
        for apt in recent_expired:
            print(f"  - ID {apt.id}: {apt.patient.name} → Dr. {apt.doctor.name} ({apt.appointment_time.strftime('%Y-%m-%d %H:%M')})")
            
    except Exception as e:
        print(f"❌ Error creating expired appointments: {e}")
        db.session.rollback()
