"""Pydantic schemas for LangChain structured roadmap generation and API contracts (Phase 11 / Sections 43, 48)."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# Structured AI Generator Schemas
class RoadmapProjectSchema(BaseModel):
    title: str = Field(description="Title of the resume-worthy portfolio project")
    description: str = Field(description="Detailed project description explaining what to build and skills demonstrated")
    difficulty: str = Field(default="intermediate", description="Project difficulty level: 'beginner', 'intermediate', or 'advanced'")

class RoadmapItemSchema(BaseModel):
    skill_name: str = Field(description="Exact name of the skill targeted by this learning item")
    title: str = Field(description="Actionable milestone title (e.g., 'Async Web APIs & Pydantic Validation')")
    description: str = Field(description="Specific learning tasks, tools, and technical concepts to master")
    importance_reason: str = Field(description="Concrete explanation citing the exact market percentage and gap priority")
    estimated_hours: int = Field(default=20, description="Estimated study and implementation hours")

class RoadmapPhaseSchema(BaseModel):
    phase_number: int = Field(description="Sequential phase index (e.g. 1, 2, 3)")
    title: str = Field(description="Descriptive theme for this phase (e.g., 'Phase 1: Core Foundation & High-Priority Gaps')")
    estimated_duration: str = Field(description="Target completion duration (e.g., '4 Weeks', '1-2 Months')")
    items: List[RoadmapItemSchema] = Field(default_factory=list, description="Targeted learning milestones in this phase")
    project: Optional[RoadmapProjectSchema] = Field(default=None, description="Hands-on portfolio project reinforcing this phase's competencies")

class RoadmapOutputSchema(BaseModel):
    title: str = Field(description="Overarching title of the personalized career roadmap")
    summary: str = Field(description="Executive summary of the career transition plan and strategy")
    phases: List[RoadmapPhaseSchema] = Field(default_factory=list, description="Ordered learning phases")

# API Request & Response Schemas
class RoadmapGenerateRequest(BaseModel):
    career_role_id: int
    user_id: Optional[int] = 1
    analysis_id: Optional[int] = None
    available_time: Optional[str] = "10-15 hours/week"

class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    created_at: Optional[datetime] = None

class RoadmapItemResponse(BaseModel):
    id: int
    phase_id: int
    skill_id: Optional[int] = None
    skill_name: Optional[str] = None
    skill_category: Optional[str] = None
    title: str
    description: Optional[str] = None
    importance_reason: Optional[str] = None
    estimated_hours: int = 0

class RoadmapPhaseResponse(BaseModel):
    id: int
    roadmap_id: int
    phase_number: int
    title: str
    estimated_duration: Optional[str] = None
    items: List[RoadmapItemResponse] = []
    projects: List[ProjectResponse] = []

class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    career_role_id: int
    career_role_name: Optional[str] = None
    analysis_id: Optional[int] = None
    title: str
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    phases: List[RoadmapPhaseResponse] = []
    projects: List[ProjectResponse] = []
