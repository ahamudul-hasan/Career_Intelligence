"""Job management and ingestion service."""
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import or_
from backend.extensions import db
from backend.models.job import Job
from backend.models.career import CareerRole
from backend.utils.text_cleaner import clean_job_text

class JobService:
    @staticmethod
    def get_jobs(
        career_role_id: Optional[int] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Job]:
        """Fetch jobs with optional career_role_id and keyword filtering."""
        query = Job.query

        if career_role_id:
            query = query.filter(Job.career_role_id == career_role_id)

        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Job.title.ilike(term),
                    Job.company.ilike(term),
                    Job.location.ilike(term),
                    Job.cleaned_description.ilike(term)
                )
            )

        return query.order_by(Job.id.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def count_jobs(career_role_id: Optional[int] = None) -> int:
        """Count total stored jobs."""
        query = Job.query
        if career_role_id:
            query = query.filter(Job.career_role_id == career_role_id)
        return query.count()

    @staticmethod
    def get_job_by_id(job_id: int) -> Optional[Job]:
        """Fetch a specific job by primary key ID using SQLAlchemy 2.0 session.get."""
        return db.session.get(Job, job_id)

    @staticmethod
    def create_job(
        career_role_id: int,
        title: str,
        company: Optional[str] = "Manual Entry",
        description: str = "",
        location: Optional[str] = "Remote",
        experience_level: Optional[str] = "entry_level",
        source: str = "manual",
        external_id: Optional[str] = None,
        job_url: Optional[str] = None
    ) -> Job:
        """Create and persist a new job posting with cleaned text."""
        # Verify career_role exists
        career_role = db.session.get(CareerRole, career_role_id)
        if not career_role:
            raise ValueError(f"Career role with id {career_role_id} does not exist.")

        cleaned = clean_job_text(description)
        unique_ext_id = external_id or f"manual-{uuid.uuid4().hex[:12]}"

        job = Job(
            career_role_id=career_role_id,
            title=title.strip(),
            company=(company or "Manual Entry").strip(),
            location=(location or "Remote").strip(),
            experience_level=experience_level or "entry_level",
            source=source,
            external_id=unique_ext_id,
            job_url=job_url,
            raw_description=description,
            cleaned_description=cleaned
        )
        db.session.add(job)
        db.session.commit()
        return job

    @staticmethod
    def delete_job(job_id: int) -> bool:
        """Delete a job by primary key ID."""
        job = db.session.get(Job, job_id)
        if not job:
            return False
        db.session.delete(job)
        db.session.commit()
        return True
