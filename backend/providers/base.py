from abc import ABC, abstractmethod
from typing import List, Dict, Any

class JobDataProvider(ABC):
    """Abstract base class for job data providers."""

    @abstractmethod
    def search(self, career: str, location: str = "US", experience: str = "entry_level", limit: int = 30) -> List[Dict[str, Any]]:
        """Search jobs from provider and return standardized list of job dictionaries."""
        pass
