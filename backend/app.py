import os
from flask import Flask
from backend.config import Config
from backend.extensions import db, migrate, cors
from backend.routes.health import health_bp

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

    return app

# Application instance for flask CLI / WSGI
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
