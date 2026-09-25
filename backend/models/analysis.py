from datetime import datetime
from backend.extensions import db

class Analysis(db.Model):
    __tablename__ = "analyses"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    career_role_id = db.Column(db.Integer, db.ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    target_location = db.Column(db.String(255), nullable=True)
    experience_level = db.Column(db.String(50), nullable=True)
    jobs_analyzed = db.Column(db.Integer, nullable=False, default=0)
    sources = db.Column(db.String(255), default="adzuna")
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)

    career_role = db.relationship("CareerRole", back_populates="analyses")

    def to_dict(self):
        return {
            "id": self.id,
            "career_role_id": self.career_role_id,
            "career_role_name": self.career_role.name if self.career_role else None,
            "target_location": self.target_location,
            "experience_level": self.experience_level,
            "jobs_analyzed": self.jobs_analyzed,
            "sources": self.sources,
            "analysis_date": self.analysis_date.isoformat() if self.analysis_date else None,
        }
