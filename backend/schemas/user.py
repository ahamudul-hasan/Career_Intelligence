"""Pydantic schemas for user profiles and user skills."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class UserSkillBase(BaseModel):
    skill_id: int
    proficiency: int = Field(0, ge=0, le=4, description="0=None, 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert")

class UserSkillResponse(UserSkillBase):
    id: int
    user_id: int
    skill_name: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    skills: List[UserSkillResponse] = []
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
