"""Pydantic schemas for roadmaps, phases, items, and recommended projects."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class RoadmapItemResponse(BaseModel):
    id: int
    skill_id: Optional[int]
    title: str
    description: Optional[str]
    order_index: int
    estimated_hours: Optional[int]
    status: str

    model_config = ConfigDict(from_attributes=True)

class RoadmapPhaseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    phase_order: int
    items: List[RoadmapItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: Optional[str]
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class RoadmapGenerateRequest(BaseModel):
    user_id: Optional[int] = 1
    career_role_id: int
    analysis_id: Optional[int] = None
    target_timeline_weeks: Optional[int] = Field(12, ge=2, le=52)

class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    career_role_id: int
    title: str
    summary: Optional[str]
    created_at: Optional[datetime]
    phases: List[RoadmapPhaseResponse] = []

    model_config = ConfigDict(from_attributes=True)
