"""Job management and ingestion service."""
from typing import List, Optional, Dict, Any
from backend.extensions import db
from backend.models.job import Job
from backend.utils.text_cleaner import clean_job_text

class JobService:
    @staticmethod
    def get_jobs_by_career(career_role_id: int, limit: int = 50) -> List[Job]:
        """Fetch stored jobs for a specific career role."""
        return Job.query.filter_by(career_role_id=career_role_id).order_by(Job.id.desc()).limit(limit).all()

    @staticmethod
    def get_job_by_id(job_id: int) -> Optional[Job]:
        """Fetch a specific job by ID."""
        return Job.query.get(job_id)

    @staticmethod
    def create_job(
        career_role_id: int,
        title: str,
        company: str,
        description: str,
        location: str = "Remote",
        experience_level: str = "entry_level",
        source: str = "manual",
        external_id: Optional[str] = None,
        job_url: Optional[str] = None
    ) -> Job:
        """Create and persist a new job posting with cleaned text."""
        cleaned = clean_job_text(description)
        job = Job(
            career_role_id=career_role_id,
            title=title,
            company=company,
            location=location,
            experience_level=experience_level,
            source=source,
            external_id=external_id,
            job_url=job_url,
            raw_description=description,
            cleaned_description=cleaned
        )
        db.session.add(job)
        db.session.commit()
        return job
