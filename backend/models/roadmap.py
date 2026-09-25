from datetime import datetime
from backend.extensions import db

class Roadmap(db.Model):
    __tablename__ = "roadmaps"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_role_id = db.Column(db.Integer, db.ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    analysis_id = db.Column(db.Integer, db.ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="roadmaps")
    career_role = db.relationship("CareerRole", back_populates="roadmaps")
    phases = db.relationship("RoadmapPhase", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapPhase.phase_number")

class RoadmapPhase(db.Model):
    __tablename__ = "roadmap_phases"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    roadmap_id = db.Column(db.Integer, db.ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    phase_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    estimated_duration = db.Column(db.String(100), nullable=True)

    roadmap = db.relationship("Roadmap", back_populates="phases")
    items = db.relationship("RoadmapItem", back_populates="phase", cascade="all, delete-orphan")

class RoadmapItem(db.Model):
    __tablename__ = "roadmap_items"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    phase_id = db.Column(db.Integer, db.ForeignKey("roadmap_phases.id", ondelete="CASCADE"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    importance_reason = db.Column(db.Text, nullable=True)
    estimated_hours = db.Column(db.Integer, default=0)

    phase = db.relationship("RoadmapPhase", back_populates="items")
    skill = db.relationship("Skill")

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.Enum("beginner", "intermediate", "advanced", name="difficulty_levels"), default="intermediate")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RoadmapProject(db.Model):
    __tablename__ = "roadmap_projects"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    roadmap_id = db.Column(db.Integer, db.ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    phase_id = db.Column(db.Integer, db.ForeignKey("roadmap_phases.id", ondelete="SET NULL"), nullable=True)
