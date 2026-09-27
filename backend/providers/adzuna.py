"""Adzuna Job Data Provider implementation (Phase 4 / Section 15, 17)."""
import os
import requests
from typing import List, Dict, Any
from backend.providers.base import JobDataProvider
from backend.config import Config

class AdzunaProvider(JobDataProvider):
    """Fetches job postings from the Adzuna API."""

    def __init__(self, app_id: str = None, app_key: str = None):
        self.app_id = app_id or Config.ADZUNA_APP_ID
        self.app_key = app_key or Config.ADZUNA_APP_KEY
        self.base_url = "https://api.adzuna.com/v1/api/jobs"

    def search(self, career: str, location: str = "US", experience: str = "entry_level", limit: int = 30) -> List[Dict[str, Any]]:
        """Search jobs from Adzuna API matching the career title."""
        if not self.app_id or not self.app_key:
            return []

        country_code = location.lower() if len(location) == 2 else "us"
        url = f"{self.base_url}/{country_code}/search/1"
        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "what": career,
            "results_per_page": min(limit, 50),
            "content-type": "application/json",
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("results", []):
                    results.append({
                        "title": item.get("title", ""),
                        "company": item.get("company", {}).get("display_name", "Unknown"),
                        "location": item.get("location", {}).get("display_name", location),
                        "country": country_code.upper(),
                        "source": "adzuna",
                        "external_id": str(item.get("id")),
                        "job_url": item.get("redirect_url", ""),
                        "raw_description": item.get("description", ""),
                        "experience_level": experience
                    })
                return results
            return []
        except Exception:
            return []
