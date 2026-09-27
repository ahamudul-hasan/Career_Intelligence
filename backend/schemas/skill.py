"""Pydantic schemas for skills and extracted skills."""
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field

class ExtractedSkill(BaseModel):
    """Schema enforced for LangChain structured skill extraction output."""
    name: str = Field(..., description="Canonical or extracted name of the skill")
    category: Optional[str] = Field("Technical", description="e.g. Language, Framework, Database, Cloud, Tool, Soft Skill")
    importance: Literal["required", "preferred"] = Field("required", description="required vs preferred requirement")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Confidence score 0.0 - 1.0")

class SkillBase(BaseModel):
    name: str = Field(..., max_length=150)
    normalized_name: str = Field(..., max_length=150)
    category: Optional[str] = Field(None, max_length=100)

class SkillResponse(SkillBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SkillFrequencyItem(BaseModel):
    skill_id: int
    skill_name: str
    normalized_name: str
    category: Optional[str]
    skill_count: int
    percentage: float
    required_count: int
    preferred_count: int
