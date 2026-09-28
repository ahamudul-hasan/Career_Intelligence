import os
from flask import Flask
from backend.config import Config
from backend.extensions import db, migrate, cors
from backend.routes import (
    health_bp,
    careers_bp,
    jobs_bp,
    skills_bp,
    analysis_bp,
    roadmap_bp,
    profile_bp,
    projects_bp,
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Import models so SQLAlchemy metadata registers them
    import backend.models

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
        supports_credentials=True
    )

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(careers_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(skills_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(projects_bp)

    # Register standardized error handlers (Phase 14 / Section 56/57)
    from backend.utils.errors import register_error_handlers
    register_error_handlers(app)

    return app

# Application instance for flask CLI / WSGI
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
