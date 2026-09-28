"""Adzuna Job Data Provider implementation (Phase 4 / Sections 15, 17)."""
import os
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.providers.base import JobDataProvider
from backend.config import Config

COUNTRY_CODE_MAP = {
    "us": "us",
    "usa": "us",
    "united states": "us",
    "gb": "gb",
    "uk": "gb",
    "united kingdom": "gb",
    "great britain": "gb",
    "ca": "ca",
    "canada": "ca",
    "au": "au",
    "australia": "au",
    "de": "de",
    "germany": "de",
    "fr": "fr",
    "france": "fr",
    "in": "in",
    "india": "in",
    "nl": "nl",
    "netherlands": "nl",
    "sg": "sg",
    "singapore": "sg",
}

class AdzunaProvider(JobDataProvider):
    """Fetches real job postings from the Adzuna API."""

    def __init__(self, app_id: Optional[str] = None, app_key: Optional[str] = None):
        self.app_id = app_id or Config.ADZUNA_APP_ID
        self.app_key = app_key or Config.ADZUNA_APP_KEY
        self.base_url = "https://api.adzuna.com/v1/api/jobs"

    def _resolve_country(self, location: str) -> str:
        loc_clean = location.strip().lower()
        return COUNTRY_CODE_MAP.get(loc_clean, "us")

    def search(
        self,
        career: str,
        location: str = "US",
        experience: str = "entry_level",
        limit: int = 30
    ) -> List[Dict[str, Any]]:
        """Search jobs from Adzuna API matching the career title and location."""
        if not self.app_id or not self.app_key:
            raise ValueError("ADZUNA_APP_ID or ADZUNA_APP_KEY is not configured in environment.")

        country_code = self._resolve_country(location)
        results: List[Dict[str, Any]] = []
        page = 1
        remaining = max(1, min(limit, 100))

        while remaining > 0 and page <= 3:
            page_size = min(remaining, 50)
            url = f"{self.base_url}/{country_code}/search/{page}"
            params = {
                "app_id": self.app_id,
                "app_key": self.app_key,
                "what": career,
                "results_per_page": page_size,
                "content-type": "application/json",
            }

            # If user provided a specific city/state that isn't just the country name
            if location.lower() not in COUNTRY_CODE_MAP and len(location) > 3:
                params["where"] = location

            try:
                response = requests.get(url, params=params, timeout=12)
                if response.status_code != 200:
                    break

                data = response.json()
                items = data.get("results", [])
                if not items:
                    break

                for item in items:
                    # Parse date if available
                    posted_date = None
                    created_str = item.get("created")
                    if created_str:
                        try:
                            posted_date = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                        except Exception:
                            posted_date = None

                    company_name = item.get("company", {}).get("display_name") or "Unknown Company"
                    loc_display = item.get("location", {}).get("display_name") or location

                    results.append({
                        "title": item.get("title", career).strip(),
                        "company": company_name.strip(),
                        "location": loc_display.strip(),
                        "country": country_code.upper(),
                        "source": "adzuna",
                        "external_id": str(item.get("id")),
                        "job_url": item.get("redirect_url") or "",
                        "raw_description": item.get("description") or "",
                        "experience_level": experience,
                        "posted_date": posted_date
                    })

                remaining -= len(items)
                page += 1
                if len(items) < page_size:
                    break
            except Exception as e:
                # Log and return whatever has been collected so far
                break

        return results[:limit]
