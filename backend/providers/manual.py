"""Manual Job Data Provider for user paste-in job descriptions."""
from typing import List, Dict, Any
from backend.providers.base import JobDataProvider

class ManualProvider(JobDataProvider):
    """Provider for single manual job description submissions."""

    def search(self, career: str, location: str = "Remote", experience: str = "entry_level", limit: int = 1) -> List[Dict[str, Any]]:
        return []
