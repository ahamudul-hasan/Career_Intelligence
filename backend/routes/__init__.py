"""Flask blueprints package."""
from backend.routes.health import health_bp
from backend.routes.careers import careers_bp
from backend.routes.jobs import jobs_bp
from backend.routes.skills import skills_bp
from backend.routes.analysis import analysis_bp
from backend.routes.roadmap import roadmap_bp
from backend.routes.profile import profile_bp
from backend.routes.projects import projects_bp

__all__ = [
    "health_bp",
    "careers_bp",
    "jobs_bp",
    "skills_bp",
    "analysis_bp",
    "roadmap_bp",
    "profile_bp",
    "projects_bp",
]
