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
    phases = db.relationship(
        "RoadmapPhase",
        back_populates="roadmap",
        cascade="all, delete-orphan",
        order_by="RoadmapPhase.phase_number"
    )
    roadmap_projects = db.relationship(
        "RoadmapProject",
        back_populates="roadmap",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "career_role_id": self.career_role_id,
            "career_role_name": self.career_role.name if self.career_role else None,
            "analysis_id": self.analysis_id,
            "title": self.title,
            "summary": self.summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "phases": [p.to_dict() for p in self.phases],
            "projects": [rp.to_dict() for rp in self.roadmap_projects],
        }

class RoadmapPhase(db.Model):
    __tablename__ = "roadmap_phases"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    roadmap_id = db.Column(db.Integer, db.ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    phase_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    estimated_duration = db.Column(db.String(100), nullable=True)

    roadmap = db.relationship("Roadmap", back_populates="phases")
    items = db.relationship(
        "RoadmapItem",
        back_populates="phase",
        cascade="all, delete-orphan"
    )
    roadmap_projects = db.relationship(
        "RoadmapProject",
        back_populates="phase"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "roadmap_id": self.roadmap_id,
            "phase_number": self.phase_number,
            "title": self.title,
            "estimated_duration": self.estimated_duration,
            "items": [item.to_dict() for item in self.items],
            "projects": [rp.to_dict() for rp in self.roadmap_projects],
        }

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

    def to_dict(self):
        return {
            "id": self.id,
            "phase_id": self.phase_id,
            "skill_id": self.skill_id,
            "skill_name": self.skill.name if self.skill else None,
            "skill_category": self.skill.category if self.skill else "General",
            "title": self.title,
            "description": self.description,
            "importance_reason": self.importance_reason,
            "estimated_hours": self.estimated_hours,
        }

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.Enum("beginner", "intermediate", "advanced", name="difficulty_levels"), default="intermediate")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    roadmap_projects = db.relationship("RoadmapProject", back_populates="project", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "difficulty": self.difficulty,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class RoadmapProject(db.Model):
    __tablename__ = "roadmap_projects"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    roadmap_id = db.Column(db.Integer, db.ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    phase_id = db.Column(db.Integer, db.ForeignKey("roadmap_phases.id", ondelete="SET NULL"), nullable=True)

    roadmap = db.relationship("Roadmap", back_populates="roadmap_projects")
    project = db.relationship("Project", back_populates="roadmap_projects")
    phase = db.relationship("RoadmapPhase", back_populates="roadmap_projects")

    def to_dict(self):
        return {
            "id": self.id,
            "roadmap_id": self.roadmap_id,
            "project_id": self.project_id,
            "phase_id": self.phase_id,
            "title": self.project.title if self.project else None,
            "description": self.project.description if self.project else None,
            "difficulty": self.project.difficulty if self.project else "intermediate",
        }
