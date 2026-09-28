"""Job management and ingestion service."""
import uuid
from typing import List, Optional, Dict, Any, Set, Tuple
from sqlalchemy import or_, and_
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
        """Create and persist a single job posting with cleaned text."""
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
    def ingest_jobs_from_provider(
        career_role_id: int,
        raw_jobs: List[Dict[str, Any]],
        source: str = "adzuna"
    ) -> Dict[str, Any]:
        """Pipeline (Phase 4):
        1. Normalize field names
        2. Deduplicate against database and batch (by source+external_id, job_url, title+company)
        3. Clean descriptions
        4. Bulk insert into MySQL
        """
        career_role = db.session.get(CareerRole, career_role_id)
        if not career_role:
            raise ValueError(f"Career role with id {career_role_id} does not exist.")

        if not raw_jobs:
            return {
                "jobs_found": 0,
                "jobs_ingested": 0,
                "jobs_duplicate": 0,
                "jobs": []
            }

        # Pre-fetch existing external_ids, job_urls, and (title, company) pairs for deduplication
        existing_external_ids: Set[str] = set(
            row[0] for row in db.session.query(Job.external_id).filter(
                and_(Job.source == source, Job.external_id.isnot(None))
            ).all()
        )

        existing_urls: Set[str] = set(
            row[0] for row in db.session.query(Job.job_url).filter(
                Job.job_url.isnot(None)
            ).all()
        )

        existing_title_company: Set[Tuple[str, str]] = set(
            (row[0].strip().lower(), (row[1] or '').strip().lower())
            for row in db.session.query(Job.title, Job.company).filter(
                Job.career_role_id == career_role_id
            ).all()
        )

        batch_external_ids: Set[str] = set()
        batch_urls: Set[str] = set()
        batch_title_company: Set[Tuple[str, str]] = set()

        ingested_jobs: List[Job] = []
        duplicate_count = 0

        for item in raw_jobs:
            ext_id = str(item.get("external_id") or "").strip()
            job_url = str(item.get("job_url") or "").strip()
            title = str(item.get("title") or "").strip()
            company = str(item.get("company") or "Unknown").strip()
            title_comp_key = (title.lower(), company.lower())

            # Deduplication checks
            is_duplicate = False
            if ext_id and (ext_id in existing_external_ids or ext_id in batch_external_ids):
                is_duplicate = True
            elif job_url and (job_url in existing_urls or job_url in batch_urls):
                is_duplicate = True
            elif title_comp_key in existing_title_company or title_comp_key in batch_title_company:
                is_duplicate = True

            if is_duplicate:
                duplicate_count += 1
                continue

            # Record in batch deduplication sets
            if ext_id:
                batch_external_ids.add(ext_id)
            if job_url:
                batch_urls.add(job_url)
            batch_title_company.add(title_comp_key)

            raw_desc = item.get("raw_description") or ""
            cleaned = clean_job_text(raw_desc)

            job = Job(
                career_role_id=career_role_id,
                title=title[:255],
                company=company[:255],
                location=(item.get("location") or "Remote")[:255],
                country=(item.get("country") or "US")[:10],
                experience_level=(item.get("experience_level") or "entry_level")[:50],
                source=source,
                external_id=ext_id or f"{source}-{uuid.uuid4().hex[:12]}",
                job_url=job_url or None,
                raw_description=raw_desc,
                cleaned_description=cleaned,
                posted_date=item.get("posted_date")
            )
            db.session.add(job)
            ingested_jobs.append(job)

        db.session.commit()

        return {
            "jobs_found": len(raw_jobs),
            "jobs_ingested": len(ingested_jobs),
            "jobs_duplicate": duplicate_count,
            "jobs": [j.to_dict() for j in ingested_jobs]
        }

    @staticmethod
    def delete_job(job_id: int) -> bool:
        """Delete a job by primary key ID."""
        job = db.session.get(Job, job_id)
        if not job:
            return False
        db.session.delete(job)
        db.session.commit()
        return True
