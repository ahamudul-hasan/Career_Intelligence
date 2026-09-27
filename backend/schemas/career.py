"""Pydantic schemas for career roles."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class CareerRoleBase(BaseModel):
    name: str = Field(..., max_length=150, description="Role title, e.g. 'Backend Developer'")
    category: str = Field(..., max_length=100, description="Career category, e.g. 'Software Development'")
    description: Optional[str] = Field(None, description="Detailed career description and focus")

class CareerRoleCreate(CareerRoleBase):
    pass

class CareerRoleResponse(CareerRoleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
