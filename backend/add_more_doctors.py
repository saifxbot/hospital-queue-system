#!/usr/bin/env python3
"""
Add comprehensive set of doctors to reach 100+ doctors total
"""
from app import create_app
from app.extensions import db
from app.models import User, Doctor

app = create_app()

# Comprehensive list of doctors with various specializations
doctors_data = [
    # Cardiology
    {"name": "Dr. Michael Chen", "specialization": "Cardiology", "chamber": "Cardio Wing - Room 201", "phone": "555-0201"},
    {"name": "Dr. Emma Rodriguez", "specialization": "Cardiology", "chamber": "Cardio Wing - Room 202", "phone": "555-0202"},
    {"name": "Dr. James Wilson", "specialization": "Interventional Cardiology", "chamber": "Cardio Wing - Room 203", "phone": "555-0203"},
    {"name": "Dr. Lisa Thompson", "specialization": "Pediatric Cardiology", "chamber": "Cardio Wing - Room 204", "phone": "555-0204"},
    
    # Neurology
    {"name": "Dr. Robert Kumar", "specialization": "Neurology", "chamber": "Neuro Wing - Room 301", "phone": "555-0301"},
    {"name": "Dr. Anna Petrov", "specialization": "Neuropsychology", "chamber": "Neuro Wing - Room 302", "phone": "555-0302"},
    {"name": "Dr. David Park", "specialization": "Neurosurgery", "chamber": "Neuro Wing - Room 303", "phone": "555-0303"},
    {"name": "Dr. Maria Santos", "specialization": "Pediatric Neurology", "chamber": "Neuro Wing - Room 304", "phone": "555-0304"},
    
    # Orthopedics
    {"name": "Dr. Steven Mitchell", "specialization": "Orthopedic Surgery", "chamber": "Ortho Wing - Room 401", "phone": "555-0401"},
    {"name": "Dr. Jennifer Lee", "specialization": "Sports Medicine", "chamber": "Ortho Wing - Room 402", "phone": "555-0402"},
    {"name": "Dr. Anthony Davis", "specialization": "Spine Surgery", "chamber": "Ortho Wing - Room 403", "phone": "555-0403"},
    {"name": "Dr. Rachel Green", "specialization": "Pediatric Orthopedics", "chamber": "Ortho Wing - Room 404", "phone": "555-0404"},
    
    # Internal Medicine
    {"name": "Dr. William Garcia", "specialization": "Internal Medicine", "chamber": "Internal Med - Room 501", "phone": "555-0501"},
    {"name": "Dr. Sarah Johnson", "specialization": "Gastroenterology", "chamber": "Internal Med - Room 502", "phone": "555-0502"},
    {"name": "Dr. Kevin O'Connor", "specialization": "Endocrinology", "chamber": "Internal Med - Room 503", "phone": "555-0503"},
    {"name": "Dr. Laura Zhang", "specialization": "Rheumatology", "chamber": "Internal Med - Room 504", "phone": "555-0504"},
    
    # Emergency Medicine
    {"name": "Dr. Mark Anderson", "specialization": "Emergency Medicine", "chamber": "Emergency Dept - Room 601", "phone": "555-0601"},
    {"name": "Dr. Nicole Wright", "specialization": "Emergency Medicine", "chamber": "Emergency Dept - Room 602", "phone": "555-0602"},
    {"name": "Dr. Thomas Miller", "specialization": "Trauma Surgery", "chamber": "Emergency Dept - Room 603", "phone": "555-0603"},
    {"name": "Dr. Amanda Taylor", "specialization": "Critical Care", "chamber": "Emergency Dept - Room 604", "phone": "555-0604"},
    
    # Obstetrics & Gynecology
    {"name": "Dr. Patricia Moore", "specialization": "Obstetrics & Gynecology", "chamber": "OB/GYN Wing - Room 701", "phone": "555-0701"},
    {"name": "Dr. Jessica Brown", "specialization": "Maternal-Fetal Medicine", "chamber": "OB/GYN Wing - Room 702", "phone": "555-0702"},
    {"name": "Dr. Michelle Clark", "specialization": "Reproductive Endocrinology", "chamber": "OB/GYN Wing - Room 703", "phone": "555-0703"},
    {"name": "Dr. Susan Lewis", "specialization": "Gynecologic Oncology", "chamber": "OB/GYN Wing - Room 704", "phone": "555-0704"},
    
    # Pediatrics
    {"name": "Dr. Christopher Young", "specialization": "Pediatrics", "chamber": "Pediatric Wing - Room 801", "phone": "555-0801"},
    {"name": "Dr. Ashley Hall", "specialization": "Pediatric Infectious Disease", "chamber": "Pediatric Wing - Room 802", "phone": "555-0802"},
    {"name": "Dr. Jason Allen", "specialization": "Pediatric Endocrinology", "chamber": "Pediatric Wing - Room 803", "phone": "555-0803"},
    {"name": "Dr. Stephanie King", "specialization": "Neonatology", "chamber": "Pediatric Wing - Room 804", "phone": "555-0804"},
    
    # Oncology
    {"name": "Dr. Richard Scott", "specialization": "Medical Oncology", "chamber": "Cancer Center - Room 901", "phone": "555-0901"},
    {"name": "Dr. Catherine Adams", "specialization": "Radiation Oncology", "chamber": "Cancer Center - Room 902", "phone": "555-0902"},
    {"name": "Dr. Daniel Baker", "specialization": "Surgical Oncology", "chamber": "Cancer Center - Room 903", "phone": "555-0903"},
    {"name": "Dr. Melissa Carter", "specialization": "Hematology", "chamber": "Cancer Center - Room 904", "phone": "555-0904"},
    
    # Psychiatry
    {"name": "Dr. Brian Robinson", "specialization": "Psychiatry", "chamber": "Mental Health - Room 1001", "phone": "555-1001"},
    {"name": "Dr. Kimberly Phillips", "specialization": "Child Psychiatry", "chamber": "Mental Health - Room 1002", "phone": "555-1002"},
    {"name": "Dr. Ryan Campbell", "specialization": "Addiction Medicine", "chamber": "Mental Health - Room 1003", "phone": "555-1003"},
    {"name": "Dr. Heather Evans", "specialization": "Geriatric Psychiatry", "chamber": "Mental Health - Room 1004", "phone": "555-1004"},
    
    # Dermatology
    {"name": "Dr. Gregory Turner", "specialization": "Dermatology", "chamber": "Dermatology - Room 1101", "phone": "555-1101"},
    {"name": "Dr. Samantha Collins", "specialization": "Pediatric Dermatology", "chamber": "Dermatology - Room 1102", "phone": "555-1102"},
    {"name": "Dr. Andrew Stewart", "specialization": "Dermatopathology", "chamber": "Dermatology - Room 1103", "phone": "555-1103"},
    {"name": "Dr. Tiffany Morris", "specialization": "Mohs Surgery", "chamber": "Dermatology - Room 1104", "phone": "555-1104"},
    
    # Ophthalmology
    {"name": "Dr. Jonathan Reed", "specialization": "Ophthalmology", "chamber": "Eye Center - Room 1201", "phone": "555-1201"},
    {"name": "Dr. Christina Cook", "specialization": "Retinal Surgery", "chamber": "Eye Center - Room 1202", "phone": "555-1202"},
    {"name": "Dr. Matthew Rogers", "specialization": "Corneal Disease", "chamber": "Eye Center - Room 1203", "phone": "555-1203"},
    {"name": "Dr. Lauren Powell", "specialization": "Pediatric Ophthalmology", "chamber": "Eye Center - Room 1204", "phone": "555-1204"},
    
    # ENT
    {"name": "Dr. Brandon Ward", "specialization": "Otolaryngology", "chamber": "ENT Department - Room 1301", "phone": "555-1301"},
    {"name": "Dr. Vanessa Cox", "specialization": "Head and Neck Surgery", "chamber": "ENT Department - Room 1302", "phone": "555-1302"},
    {"name": "Dr. Eric Richardson", "specialization": "Pediatric ENT", "chamber": "ENT Department - Room 1303", "phone": "555-1303"},
    {"name": "Dr. Natalie Hughes", "specialization": "Rhinology", "chamber": "ENT Department - Room 1304", "phone": "555-1304"},
    
    # Urology
    {"name": "Dr. Patrick Wood", "specialization": "Urology", "chamber": "Urology - Room 1401", "phone": "555-1401"},
    {"name": "Dr. Kelly Peterson", "specialization": "Pediatric Urology", "chamber": "Urology - Room 1402", "phone": "555-1402"},
    {"name": "Dr. Sean Ross", "specialization": "Urologic Oncology", "chamber": "Urology - Room 1403", "phone": "555-1403"},
    {"name": "Dr. Diana Foster", "specialization": "Female Urology", "chamber": "Urology - Room 1404", "phone": "555-1404"},
    
    # Radiology
    {"name": "Dr. Charles Murphy", "specialization": "Diagnostic Radiology", "chamber": "Radiology - Room 1501", "phone": "555-1501"},
    {"name": "Dr. Julie Sanders", "specialization": "Interventional Radiology", "chamber": "Radiology - Room 1502", "phone": "555-1502"},
    {"name": "Dr. Adam Price", "specialization": "Nuclear Medicine", "chamber": "Radiology - Room 1503", "phone": "555-1503"},
    {"name": "Dr. Rebecca Butler", "specialization": "Neuroradiology", "chamber": "Radiology - Room 1504", "phone": "555-1504"},
    
    # Anesthesiology
    {"name": "Dr. Tyler Barnes", "specialization": "Anesthesiology", "chamber": "Surgery - Room 1601", "phone": "555-1601"},
    {"name": "Dr. Megan Fisher", "specialization": "Pediatric Anesthesiology", "chamber": "Surgery - Room 1602", "phone": "555-1602"},
    {"name": "Dr. Jacob Henderson", "specialization": "Cardiac Anesthesiology", "chamber": "Surgery - Room 1603", "phone": "555-1603"},
    {"name": "Dr. Brittany Coleman", "specialization": "Pain Management", "chamber": "Surgery - Room 1604", "phone": "555-1604"},
    
    # Pathology
    {"name": "Dr. Nathan Jenkins", "specialization": "Anatomic Pathology", "chamber": "Laboratory - Room 1701", "phone": "555-1701"},
    {"name": "Dr. Courtney Perry", "specialization": "Clinical Pathology", "chamber": "Laboratory - Room 1702", "phone": "555-1702"},
    {"name": "Dr. Austin Simmons", "specialization": "Forensic Pathology", "chamber": "Laboratory - Room 1703", "phone": "555-1703"},
    {"name": "Dr. Morgan Russell", "specialization": "Cytopathology", "chamber": "Laboratory - Room 1704", "phone": "555-1704"},
    
    # Pulmonology
    {"name": "Dr. Victor Alexander", "specialization": "Pulmonology", "chamber": "Respiratory - Room 1801", "phone": "555-1801"},
    {"name": "Dr. Alexis Griffin", "specialization": "Critical Care Pulmonology", "chamber": "Respiratory - Room 1802", "phone": "555-1802"},
    {"name": "Dr. Jordan Washington", "specialization": "Interventional Pulmonology", "chamber": "Respiratory - Room 1803", "phone": "555-1803"},
    {"name": "Dr. Danielle Butler", "specialization": "Sleep Medicine", "chamber": "Respiratory - Room 1804", "phone": "555-1804"},
    
    # Nephrology
    {"name": "Dr. Cameron Hayes", "specialization": "Nephrology", "chamber": "Kidney Center - Room 1901", "phone": "555-1901"},
    {"name": "Dr. Sierra Myers", "specialization": "Pediatric Nephrology", "chamber": "Kidney Center - Room 1902", "phone": "555-1902"},
    {"name": "Dr. Blake Ford", "specialization": "Transplant Nephrology", "chamber": "Kidney Center - Room 1903", "phone": "555-1903"},
    {"name": "Dr. Paige Wells", "specialization": "Dialysis", "chamber": "Kidney Center - Room 1904", "phone": "555-1904"},
    
    # Infectious Disease
    {"name": "Dr. Javier Cruz", "specialization": "Infectious Disease", "chamber": "ID Department - Room 2001", "phone": "555-2001"},
    {"name": "Dr. Brooke Stone", "specialization": "Hospital Epidemiology", "chamber": "ID Department - Room 2002", "phone": "555-2002"},
    {"name": "Dr. Ian Burke", "specialization": "Travel Medicine", "chamber": "ID Department - Room 2003", "phone": "555-2003"},
    {"name": "Dr. Crystal Spencer", "specialization": "HIV/AIDS Specialist", "chamber": "ID Department - Room 2004", "phone": "555-2004"},
    
    # Geriatrics
    {"name": "Dr. Preston Webb", "specialization": "Geriatric Medicine", "chamber": "Geriatrics - Room 2101", "phone": "555-2101"},
    {"name": "Dr. Destiny Stone", "specialization": "Geriatric Psychiatry", "chamber": "Geriatrics - Room 2102", "phone": "555-2102"},
    {"name": "Dr. Marcus Kennedy", "specialization": "Memory Care", "chamber": "Geriatrics - Room 2103", "phone": "555-2103"},
    {"name": "Dr. Jasmine Porter", "specialization": "Palliative Care", "chamber": "Geriatrics - Room 2104", "phone": "555-2104"},
    
    # Plastic Surgery
    {"name": "Dr. Connor Wells", "specialization": "Plastic Surgery", "chamber": "Cosmetic Surgery - Room 2201", "phone": "555-2201"},
    {"name": "Dr. Skylar Hunter", "specialization": "Reconstructive Surgery", "chamber": "Cosmetic Surgery - Room 2202", "phone": "555-2202"},
    {"name": "Dr. Garrett Mason", "specialization": "Hand Surgery", "chamber": "Cosmetic Surgery - Room 2203", "phone": "555-2203"},
    {"name": "Dr. Jade Ellis", "specialization": "Burn Surgery", "chamber": "Cosmetic Surgery - Room 2204", "phone": "555-2204"},
    
    # Family Medicine
    {"name": "Dr. Hunter Black", "specialization": "Family Medicine", "chamber": "Family Care - Room 2301", "phone": "555-2301"},
    {"name": "Dr. Savannah Ray", "specialization": "Family Medicine", "chamber": "Family Care - Room 2302", "phone": "555-2302"},
    {"name": "Dr. Colton Gray", "specialization": "Family Medicine", "chamber": "Family Care - Room 2303", "phone": "555-2303"},
    {"name": "Dr. Haley Brooks", "specialization": "Family Medicine", "chamber": "Family Care - Room 2304", "phone": "555-2304"},
    
    # Additional General Medicine
    {"name": "Dr. Peyton James", "specialization": "General Medicine", "chamber": "General Ward - Room 2401", "phone": "555-2401"},
    {"name": "Dr. Jenna Howard", "specialization": "General Medicine", "chamber": "General Ward - Room 2402", "phone": "555-2402"},
    {"name": "Dr. Bryce Long", "specialization": "General Medicine", "chamber": "General Ward - Room 2403", "phone": "555-2403"},
    {"name": "Dr. Chloe Patterson", "specialization": "General Medicine", "chamber": "General Ward - Room 2404", "phone": "555-2404"},
    
    # Rehabilitation Medicine
    {"name": "Dr. Landon Torres", "specialization": "Physical Medicine", "chamber": "Rehab Center - Room 2501", "phone": "555-2501"},
    {"name": "Dr. Maya Flores", "specialization": "Sports Rehabilitation", "chamber": "Rehab Center - Room 2502", "phone": "555-2502"},
    {"name": "Dr. Carson Rivera", "specialization": "Occupational Medicine", "chamber": "Rehab Center - Room 2503", "phone": "555-2503"},
    {"name": "Dr. Addison Cooper", "specialization": "Pediatric Rehabilitation", "chamber": "Rehab Center - Room 2504", "phone": "555-2504"},
]

with app.app_context():
    print("Adding comprehensive set of doctors...")
    added_count = 0
    
    for i, doctor_data in enumerate(doctors_data, 1):
        try:
            # Create a unique username for each doctor
            username = f"doctor{i:03d}"
            
            # Check if user already exists
            existing_user = User.query.filter_by(username=username).first()
            if existing_user:
                print(f"User {username} already exists, skipping...")
                continue
            
            # Create user account for doctor
            user = User(username=username, role='doctor')
            user.set_password('doctor123')
            db.session.add(user)
            db.session.flush()  # Get the user ID
            
            # Create doctor profile
            doctor = Doctor(
                user_id=user.id,
                name=doctor_data['name'],
                specialization=doctor_data['specialization'],
                phone=doctor_data['phone'],
                chamber=doctor_data['chamber'],
                available_days='Mon,Tue,Wed,Thu,Fri'
            )
            db.session.add(doctor)
            added_count += 1
            
            # Commit every 10 doctors to avoid large transactions
            if added_count % 10 == 0:
                db.session.commit()
                print(f"Added {added_count} doctors so far...")
                
        except Exception as e:
            print(f"Error adding doctor {doctor_data['name']}: {str(e)}")
            db.session.rollback()
            continue
    
    # Final commit
    try:
        db.session.commit()
        print(f"\n✅ Successfully added {added_count} new doctors!")
        
        # Get total count
        total_doctors = Doctor.query.count()
        print(f"📊 Total doctors in database: {total_doctors}")
        
        # Show specializations count
        from sqlalchemy import func
        specializations = db.session.query(
            Doctor.specialization, 
            func.count(Doctor.id).label('count')
        ).group_by(Doctor.specialization).all()
        
        print(f"\n📋 Specializations available ({len(specializations)} total):")
        for spec, count in sorted(specializations):
            if spec:  # Only show non-empty specializations
                print(f"  - {spec}: {count} doctor(s)")
                
    except Exception as e:
        print(f"❌ Error during final commit: {str(e)}")
        db.session.rollback()
