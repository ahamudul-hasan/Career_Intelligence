from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from backend.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    skills = db.relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    roadmaps = db.relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str):
        """Hash and store a secure salted password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify password against stored salt and hash."""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "skills": [s.to_dict() for s in self.skills]
        }

class UserSkill(db.Model):
    __tablename__ = "user_skills"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = db.Column(db.SmallInteger, nullable=False, default=0) # 0-4
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    user = db.relationship("User", back_populates="skills")
    skill = db.relationship("Skill", back_populates="user_skills")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skill_id": self.skill_id,
            "skill_name": self.skill.name if self.skill else None,
            "normalized_name": self.skill.normalized_name if self.skill else None,
            "category": self.skill.category if self.skill else "General",
            "proficiency": self.proficiency,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
