#!/usr/bin/env python3
"""
Create test data for the hospital queue system
"""
from app import create_app
from app.extensions import db
from app.models import User, Doctor, Patient

app = create_app()

with app.app_context():
    # Create admin user
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Admin user created: username=admin, password=admin123")

    # Create test doctors
    doctor_users = [
        {'username': 'dr_smith', 'name': 'Dr. John Smith', 'specialization': 'Cardiology'},
        {'username': 'dr_jones', 'name': 'Dr. Sarah Jones', 'specialization': 'Pediatrics'},
        {'username': 'dr_brown', 'name': 'Dr. Mike Brown', 'specialization': 'General Medicine'},
    ]

    for doc_data in doctor_users:
        # Check if user already exists
        user = User.query.filter_by(username=doc_data['username']).first()
        if not user:
            # Create user account
            user = User(username=doc_data['username'], role='doctor')
            user.set_password('doctor123')
            db.session.add(user)
            db.session.commit()

            # Create doctor profile
            doctor = Doctor(
                user_id=user.id,
                name=doc_data['name'],
                specialization=doc_data['specialization'],
                phone='555-0123',
                chamber='Room 101',
                available_days='Mon,Tue,Wed,Thu,Fri'
            )
            db.session.add(doctor)
            db.session.commit()
            print(f"Doctor created: {doc_data['name']} ({doc_data['specialization']})")

    # Create a test patient
    patient_user = User.query.filter_by(username='patient1').first()
    if not patient_user:
        patient_user = User(username='patient1', role='patient')
        patient_user.set_password('patient123')
        db.session.add(patient_user)
        db.session.commit()

        patient = Patient(
            user_id=patient_user.id,
            name='John Doe',
            age=30,
            gender='Male',
            phone='555-0456',
            address='123 Main St'
        )
        db.session.add(patient)
        db.session.commit()
        print("Test patient created: username=patient1, password=patient123")

    print("Test data creation completed!")
