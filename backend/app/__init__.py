# Ei file-e Flask app create kora hoy
from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt
from .routes.auth import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # sob blueprint register koro
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app