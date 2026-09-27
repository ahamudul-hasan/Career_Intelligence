"""Manual Job Data Provider for user paste-in job descriptions."""
from typing import List, Dict, Any
from backend.providers.base import JobDataProvider
from backend.services.job_service import JobService

class ManualProvider(JobDataProvider):
    """Provider for single manual job description submissions."""

    def search(self, career: str, location: str = "Remote", experience: str = "entry_level", limit: int = 1) -> List[Dict[str, Any]]:
        """Manual provider does not search external APIs, returns empty list on search."""
        return []

    def ingest_manual_job(
        self,
        career_role_id: int,
        title: str,
        description: str,
        company: str = "Manual Entry",
        location: str = "Remote",
        experience_level: str = "entry_level"
    ) -> Dict[str, Any]:
        """Ingest a single manual job posting into MySQL."""
        job = JobService.create_job(
            career_role_id=career_role_id,
            title=title,
            company=company,
            description=description,
            location=location,
            experience_level=experience_level,
            source="manual"
        )
        return job.to_dict()
