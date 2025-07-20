from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets

# Single User model: authentication + role based access
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="patient")  # patient, doctor, admin
    
    # 2FA Email Verification Fields
    is_email_verified = db.Column(db.Boolean, default=False, nullable=False)
    email_verification_code = db.Column(db.String(6), nullable=True)
    email_verification_expires = db.Column(db.DateTime, nullable=True)
    two_factor_enabled = db.Column(db.Boolean, default=True, nullable=False)  # Enable 2FA by default
    
    # Login attempt tracking
    failed_login_attempts = db.Column(db.Integer, default=0, nullable=False)
    account_locked_until = db.Column(db.DateTime, nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_verification_code(self):
        """Generate a 6-digit verification code and set expiration"""
        self.email_verification_code = str(secrets.randbelow(999999)).zfill(6)
        self.email_verification_expires = datetime.utcnow() + timedelta(minutes=10)  # Expires in 10 minutes
        return self.email_verification_code
    
    def verify_email_code(self, code):
        """Verify the email verification code"""
        if not self.email_verification_code or not self.email_verification_expires:
            return False
        
        if datetime.utcnow() > self.email_verification_expires:
            return False  # Code expired
        
        if self.email_verification_code == code:
            self.is_email_verified = True
            self.email_verification_code = None
            self.email_verification_expires = None
            self.failed_login_attempts = 0  # Reset failed attempts on successful verification
            self.last_login = datetime.utcnow()
            return True
        
        return False
    
    def is_account_locked(self):
        """Check if account is locked due to too many failed attempts"""
        if self.account_locked_until and datetime.utcnow() < self.account_locked_until:
            return True
        return False
    
    def increment_failed_attempts(self):
        """Increment failed login attempts and lock account if necessary"""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:  # Lock after 5 failed attempts
            self.account_locked_until = datetime.utcnow() + timedelta(minutes=30)  # Lock for 30 minutes

# Patient profile (linked with User)
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(200), nullable=True)
    user = db.relationship('User', backref='patient_profile', uselist=False)

# Doctor profile (linked with User)
class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)
    name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    chamber = db.Column(db.String(200), nullable=True)
    available_days = db.Column(db.String(100), nullable=True)
    user = db.relationship('User', backref='doctor_profile', uselist=False)

class Queue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    serial = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default="waiting")  # waiting/served/canceled
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    patient = db.relationship('Patient', backref='queues')
    doctor = db.relationship('Doctor', backref='queues')

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    appointment_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default="scheduled")  # scheduled/completed/canceled

    patient = db.relationship('Patient', backref='appointments')
    doctor = db.relationship('Doctor', backref='appointments')