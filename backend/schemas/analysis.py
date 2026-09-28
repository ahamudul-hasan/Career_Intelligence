"""Pydantic schemas for market analyses and skill gap evaluations."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from backend.schemas.skill import SkillFrequencyItem

class AnalysisCreateRequest(BaseModel):
    career_role_id: int
    target_location: Optional[str] = "All"
    experience_level: Optional[str] = "All"
    sources: Optional[str] = "adzuna"

class AnalysisResponse(BaseModel):
    id: int
    career_role_id: int
    target_location: Optional[str]
    experience_level: Optional[str]
    jobs_analyzed: int
    sources: Optional[str]
    analysis_date: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class SkillGapItem(BaseModel):
    skill_id: int
    skill_name: str
    category: Optional[str]
    market_frequency: float
    user_proficiency: int
    gap_priority: str  # "high", "medium", "low"
    explanation: str
