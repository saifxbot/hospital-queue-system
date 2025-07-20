from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt, cors, mail
from .routes.auth import auth_bp
from .routes.patient import patient_bp
from .routes.doctor import doctor_bp
from .routes.queue import queue_bp
from .routes.appointment import appointment_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    mail.init_app(app)  # Initialize Flask-Mail

    # sob blueprint register koro
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(patient_bp, url_prefix="/api/patient")
    app.register_blueprint(doctor_bp, url_prefix="/api/doctor")
    app.register_blueprint(queue_bp, url_prefix="/api/queue")
    app.register_blueprint(appointment_bp, url_prefix="/api/appointment")
    
    return app