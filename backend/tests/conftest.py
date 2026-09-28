"""Pytest configuration and teardown fixtures to prevent test DB pollution."""
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.skill import Skill, JobSkill
from backend.models.career import CareerRole
from backend.models.job import Job
from backend.models.user import User, UserSkill
from backend.models.roadmap import Roadmap, RoadmapPhase, Project, RoadmapProject
from backend.models.analysis import Analysis

@pytest.fixture(autouse=True)
def clean_db_after_each_test():
    """Autouse fixture to clean up any test-created records from the shared DB."""
    yield
    # Teardown logic
    try:
        from backend.app import app
        with app.app_context():
            # 1. Clean test skills with hex suffix or test pattern
            test_skills = Skill.query.filter(Skill.id > 52).all()
            for s in test_skills:
                parts = s.name.split()
                is_hex_test = len(parts) > 1 and len(parts[-1]) == 6 and all(c in "0123456789abcdef" for c in parts[-1].lower())
                is_named_test = any(marker in s.name.lower() for marker in ["test skill", "roadmap skill", "diff skill"])
                if is_hex_test or is_named_test:
                    JobSkill.query.filter_by(skill_id=s.id).delete()
                    UserSkill.query.filter_by(skill_id=s.id).delete()
                    db.session.delete(s)

            # 2. Clean test careers with hex suffix or test pattern
            test_careers = CareerRole.query.filter(CareerRole.id > 25).all()
            for c in test_careers:
                parts = c.name.split()
                is_hex_test = len(parts) > 1 and len(parts[-1]) == 6 and all(c in "0123456789abcdef" for c in parts[-1].lower())
                is_named_test = any(marker in c.name.lower() for marker in ["test role", "differentiator role", "upload career", "empty career"])
                if is_hex_test or is_named_test:
                    for job in Job.query.filter_by(career_role_id=c.id).all():
                        JobSkill.query.filter_by(job_id=job.id).delete()
                        db.session.delete(job)
                    Analysis.query.filter_by(career_role_id=c.id).delete()
                    db.session.delete(c)

            # 3. Clean test users
            test_users = User.query.filter(
                (User.email.like("%@example.com")) | (User.email.like("%@test.com"))
            ).all()
            for u in test_users:
                UserSkill.query.filter_by(user_id=u.id).delete()
                for rm in Roadmap.query.filter_by(user_id=u.id).all():
                    RoadmapProject.query.filter_by(roadmap_id=rm.id).delete()
                    RoadmapPhase.query.filter_by(roadmap_id=rm.id).delete()
                    db.session.delete(rm)
                db.session.delete(u)

            db.session.commit()
    except Exception:
        db.session.rollback()
