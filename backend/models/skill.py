from datetime import datetime
from backend.extensions import db

class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False, unique=True)
    normalized_name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    job_skills = db.relationship("JobSkill", back_populates="skill", cascade="all, delete-orphan")
    user_skills = db.relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "normalized_name": self.normalized_name,
            "category": self.category,
        }

class JobSkill(db.Model):
    __tablename__ = "job_skills"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    importance = db.Column(db.Enum("required", "preferred", "nice_to_have", name="importance_types"), default="required")
    confidence = db.Column(db.Float, default=1.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("job_id", "skill_id", name="uq_job_skill"),
    )

    job = db.relationship("Job", back_populates="skills")
    skill = db.relationship("Skill", back_populates="job_skills")
