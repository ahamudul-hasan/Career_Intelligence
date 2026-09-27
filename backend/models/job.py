from datetime import datetime
from backend.extensions import db

class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    career_role_id = db.Column(db.Integer, db.ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    country = db.Column(db.String(10), default="US")
    experience_level = db.Column(db.String(50), nullable=True)
    source = db.Column(db.String(50), default="manual")
    external_id = db.Column(db.String(255), nullable=True)
    job_url = db.Column(db.Text, nullable=True)
    raw_description = db.Column(db.Text, nullable=True)
    cleaned_description = db.Column(db.Text, nullable=True)
    posted_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("source", "external_id", name="uq_external_job"),
    )

    career_role = db.relationship("CareerRole", back_populates="jobs")
    skills = db.relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "career_role_id": self.career_role_id,
            "career_role_name": self.career_role.name if self.career_role else None,
            "category": self.career_role.category if self.career_role else None,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "country": self.country,
            "experience_level": self.experience_level,
            "source": self.source,
            "external_id": self.external_id,
            "job_url": self.job_url,
            "raw_description": self.raw_description,
            "cleaned_description": self.cleaned_description,
            "posted_date": self.posted_date.isoformat() if self.posted_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
