from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models import User
from app.email_utils import send_verification_email, send_account_locked_email, test_email_configuration
from flask_jwt_extended import create_access_token
from datetime import datetime
import logging

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    user_id = data.get("user_id")  # New unique ID field
    username = data.get("username")  # Display name
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "patient")

    if not user_id or not username or not password or not email:
        return jsonify({"msg": "User ID, name, email, and password are required"}), 400

    # Validate user_id format (alphanumeric, 3-20 characters)
    import re
    if not re.match(r'^[a-zA-Z0-9]{3,20}$', user_id):
        return jsonify({"msg": "User ID must be 3-20 characters long and contain only letters and numbers"}), 400

    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return jsonify({"msg": "Invalid email format"}), 400

    if User.query.filter_by(user_id=user_id).first():
        return jsonify({"msg": "This ID already exists, try another"}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 409

    user = User(user_id=user_id, username=username, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Create Patient or Doctor profile if needed
    if role == "patient":
        from app.models import Patient
        patient = Patient(user_id=user.id, name=username, age=0, gender="", phone="", address="")
        db.session.add(patient)
        db.session.commit()
    elif role == "doctor":
        from app.models import Doctor
        doctor = Doctor(user_id=user.id, name=username, specialization="", phone="", chamber="", available_days="")
        db.session.add(doctor)
        db.session.commit()

    return jsonify({"msg": "User registered successfully. Please verify your email when logging in."}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    """Step 1: Validate credentials and send verification code"""
    data = request.get_json()
    user_id = data.get("user_id")  # Use user_id instead of username
    password = data.get("password")

    if not user_id or not password:
        return jsonify({"msg": "User ID and password required"}), 400

    user = User.query.filter_by(user_id=user_id).first()
    
    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    # Check if account is locked
    if user.is_account_locked():
        remaining_time = (user.account_locked_until - datetime.utcnow()).total_seconds() / 60
        return jsonify({
            "msg": f"Account is locked. Try again in {int(remaining_time)} minutes.",
            "account_locked": True,
            "unlock_time": user.account_locked_until.isoformat()
        }), 423

    # Check password
    if not user.check_password(password):
        user.increment_failed_attempts()
        db.session.commit()
        
        # Send lock notification if account gets locked
        if user.is_account_locked():
            send_account_locked_email(user.email, user.username, user.account_locked_until)
            return jsonify({
                "msg": "Too many failed attempts. Account has been locked for 30 minutes.",
                "account_locked": True
            }), 423
        
        remaining_attempts = 5 - user.failed_login_attempts
        return jsonify({
            "msg": f"Invalid credentials. {remaining_attempts} attempts remaining.",
            "attempts_remaining": remaining_attempts
        }), 401

    # If 2FA is disabled, login directly
    if not user.two_factor_enabled:
        user.failed_login_attempts = 0
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            },
            "two_factor_required": False
        }), 200

    # Generate and send verification code
    verification_code = user.generate_verification_code()
    db.session.commit()

    # In development mode, skip email sending and show code in response
    if current_app.config.get('DEVELOPMENT_MODE', False):
        logger.info(f"DEVELOPMENT MODE: Verification code for {user.username}: {verification_code}")
        return jsonify({
            "msg": f"DEVELOPMENT MODE: Verification code is {verification_code}",
            "two_factor_required": True,
            "user_id": user.id,
            "email_masked": f"{user.email[:3]}***@{user.email.split('@')[1]}",
            "dev_code": verification_code  # Only in development
        }), 200

    # Send verification email (production mode)
    email_sent = send_verification_email(user.email, verification_code, user.username)
    
    if not email_sent:
        # Fallback: provide the code in the response for development
        logger.warning(f"Email failed, providing code in response: {verification_code}")
        return jsonify({
            "msg": f"Email service unavailable. Your verification code is: {verification_code}",
            "two_factor_required": True,
            "user_id": user.id,
            "email_masked": f"{user.email[:3]}***@{user.email.split('@')[1]}",
            "dev_code": verification_code
        }), 200

    logger.info(f"Verification code sent to {user.email} for user {user.username}")

    return jsonify({
        "msg": "Verification code sent to your email. Please check your inbox.",
        "two_factor_required": True,
        "user_id": user.id,
        "email_masked": f"{user.email[:3]}***@{user.email.split('@')[1]}"
    }), 200

@auth_bp.route("/verify-2fa", methods=["POST"])
def verify_2fa():
    """Step 2: Verify the email code and complete login"""
    data = request.get_json()
    user_id = data.get("user_id")
    verification_code = data.get("verification_code")

    if not user_id or not verification_code:
        return jsonify({"msg": "User ID and verification code required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Invalid user"}), 401

    # Check if account is locked
    if user.is_account_locked():
        remaining_time = (user.account_locked_until - datetime.utcnow()).total_seconds() / 60
        return jsonify({
            "msg": f"Account is locked. Try again in {int(remaining_time)} minutes.",
            "account_locked": True
        }), 423

    # Verify the code
    if user.verify_email_code(verification_code):
        db.session.commit()
        
        access_token = create_access_token(identity=str(user.id))
        logger.info(f"2FA verification successful for user {user.username}")
        
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            },
            "msg": "Login successful!"
        }), 200
    else:
        user.increment_failed_attempts()
        db.session.commit()
        
        # Send lock notification if account gets locked
        if user.is_account_locked():
            send_account_locked_email(user.email, user.username, user.account_locked_until)
            return jsonify({
                "msg": "Too many failed attempts. Account has been locked for 30 minutes.",
                "account_locked": True
            }), 423
        
        remaining_attempts = 5 - user.failed_login_attempts
        return jsonify({
            "msg": f"Invalid verification code. {remaining_attempts} attempts remaining.",
            "attempts_remaining": remaining_attempts
        }), 401

@auth_bp.route("/resend-code", methods=["POST"])
def resend_verification_code():
    """Resend verification code"""
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"msg": "User ID required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Invalid user"}), 401

    # Check if account is locked
    if user.is_account_locked():
        return jsonify({"msg": "Account is locked. Cannot resend code."}), 423

    # Generate new code
    verification_code = user.generate_verification_code()
    db.session.commit()

    # In development mode, skip email sending and show code in response
    if current_app.config.get('DEVELOPMENT_MODE', False):
        logger.info(f"DEVELOPMENT MODE: New verification code for {user.username}: {verification_code}")
        return jsonify({
            "msg": f"DEVELOPMENT MODE: New verification code is {verification_code}",
            "dev_code": verification_code
        }), 200

    # Send verification email
    email_sent = send_verification_email(user.email, verification_code, user.username)
    
    if not email_sent:
        # Fallback: provide the code in the response for development
        logger.warning(f"Email failed, providing new code in response: {verification_code}")
        return jsonify({
            "msg": f"Email service unavailable. Your new verification code is: {verification_code}",
            "dev_code": verification_code
        }), 200

    return jsonify({"msg": "New verification code sent to your email."}), 200

@auth_bp.route("/test-email", methods=["GET"])
def test_email():
    """Test email configuration (for development)"""
    success, message = test_email_configuration()
    return jsonify({"success": success, "message": message}), 200 if success else 500
    return jsonify({"msg": "Invalid credentials"}), 401