from datetime import datetime
from backend.extensions import db

class CareerRole(db.Model):
    __tablename__ = "career_roles"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False, unique=True)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    jobs = db.relationship("Job", back_populates="career_role", cascade="all, delete-orphan")
    analyses = db.relationship("Analysis", back_populates="career_role", cascade="all, delete-orphan")
    roadmaps = db.relationship("Roadmap", back_populates="career_role", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
