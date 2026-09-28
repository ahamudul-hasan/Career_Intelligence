"""File Job Data Provider for uploaded job descriptions (TXT / PDF) (Phase 4 / Section 17)."""
import uuid
from typing import List, Dict, Any, Optional
from backend.providers.base import JobDataProvider

class FileProvider(JobDataProvider):
    """Provider for extracting job postings from uploaded text or documents."""

    def search(
        self,
        career: str,
        location: str = "US",
        experience: str = "entry_level",
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """FileProvider returns stored or empty results when queried as an external search API."""
        return []

    def parse_text_file(
        self,
        content: str,
        filename: str = "uploaded_job.txt",
        default_career: str = "Software Engineer",
        experience: str = "entry_level"
    ) -> List[Dict[str, Any]]:
        """Parse raw file text into standardized job dictionaries.
        Supports single job description or multiple job descriptions separated by '---' or '==='.
        """
        if not content or not content.strip():
            return []

        # Check for multi-job delimiters
        raw_sections = [s.strip() for s in content.split("---") if s.strip()]
        if len(raw_sections) <= 1:
            raw_sections = [s.strip() for s in content.split("===") if s.strip()]
        if not raw_sections:
            raw_sections = [content.strip()]

        jobs: List[Dict[str, Any]] = []
        for idx, section in enumerate(raw_sections, 1):
            lines = [l.strip() for l in section.splitlines() if l.strip()]
            title = lines[0] if lines else default_career
            # If the first line is very long, it's probably part of description rather than a title
            if len(title) > 80:
                title = f"{default_career} (Document #{idx})"

            jobs.append({
                "title": title[:255],
                "company": "Uploaded File",
                "location": "Document Ingestion",
                "country": "US",
                "source": "file",
                "external_id": f"file-{uuid.uuid4().hex[:12]}",
                "job_url": filename,
                "raw_description": section,
                "experience_level": experience
            })

        return jobs
