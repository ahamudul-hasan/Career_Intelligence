"""Jooble Job Data Provider stub (Optional secondary provider)."""
from typing import List, Dict, Any
from backend.providers.base import JobDataProvider

class JoobleProvider(JobDataProvider):
    """Stub implementation for Jooble Job search."""
    def search(self, career: str, location: str = "US", experience: str = "entry_level", limit: int = 30) -> List[Dict[str, Any]]:
        return []
