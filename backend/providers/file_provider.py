"""File Job Data Provider for uploaded job descriptions (TXT / PDF)."""
from typing import List, Dict, Any
from backend.providers.base import JobDataProvider

class FileProvider(JobDataProvider):
    """Provider for extracting job postings from uploaded documents."""

    def search(self, career: str, location: str = "US", experience: str = "entry_level", limit: int = 10) -> List[Dict[str, Any]]:
        return []
