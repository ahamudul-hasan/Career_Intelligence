"""Pydantic schemas for jobs, imports, and searches."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class JobBase(BaseModel):
    title: str = Field(..., max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    country: Optional[str] = Field("US", max_length=10)
    experience_level: Optional[str] = Field("entry_level", max_length=50)
    source: Optional[str] = Field("manual", max_length=50)
    external_id: Optional[str] = Field(None, max_length=255)
    job_url: Optional[str] = None
    raw_description: Optional[str] = None
    cleaned_description: Optional[str] = None

class JobImportRequest(BaseModel):
    """Schema for manual job paste-in import."""
    career_role_id: int = Field(..., description="Target career role ID")
    title: str = Field(..., max_length=255)
    company: Optional[str] = Field("Manual Entry", max_length=255)
    description: str = Field(..., min_length=10, description="Job posting description")
    location: Optional[str] = Field("Remote", max_length=255)
    experience_level: Optional[str] = Field("entry_level", max_length=50)

class JobSearchRequest(BaseModel):
    """Schema for querying job providers."""
    career_role_id: int
    location: Optional[str] = "US"
    experience_level: Optional[str] = "entry_level"
    limit: Optional[int] = Field(30, ge=1, le=100)
    source: Optional[str] = "adzuna"

class JobResponse(JobBase):
    id: int
    career_role_id: int
    posted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
