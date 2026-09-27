"""Common base schemas and standardized error responses."""
from typing import Optional, Any
from pydantic import BaseModel, Field

class APIErrorResponse(BaseModel):
    """Standardized API Error Response per Section 56/57."""
    error: str = Field(..., description="Error code identifier, e.g. NOT_FOUND, VALIDATION_ERROR")
    message: str = Field(..., description="Human-readable explanation of the error")
    details: Optional[Any] = Field(None, description="Optional debug or validation details")

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    per_page: int = Field(20, ge=1, le=100, description="Items per page")
