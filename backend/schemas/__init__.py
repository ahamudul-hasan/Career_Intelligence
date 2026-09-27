"""Pydantic schemas package."""
from backend.schemas.common import APIErrorResponse, PaginationParams
from backend.schemas.career import CareerRoleBase, CareerRoleCreate, CareerRoleResponse
from backend.schemas.job import JobBase, JobImportRequest, JobSearchRequest, JobResponse
from backend.schemas.skill import SkillBase, SkillResponse, ExtractedSkill, SkillFrequencyItem
from backend.schemas.analysis import AnalysisCreateRequest, AnalysisResponse, SkillGapItem
from backend.schemas.roadmap import (
    RoadmapResponse,
    RoadmapGenerateRequest,
    RoadmapPhaseResponse,
    RoadmapItemResponse,
    ProjectResponse
)
from backend.schemas.user import UserProfileResponse, UserSkillBase, UserSkillResponse

__all__ = [
    "APIErrorResponse",
    "PaginationParams",
    "CareerRoleBase",
    "CareerRoleCreate",
    "CareerRoleResponse",
    "JobBase",
    "JobImportRequest",
    "JobSearchRequest",
    "JobResponse",
    "SkillBase",
    "SkillResponse",
    "ExtractedSkill",
    "SkillFrequencyItem",
    "AnalysisCreateRequest",
    "AnalysisResponse",
    "SkillGapItem",
    "RoadmapResponse",
    "RoadmapGenerateRequest",
    "RoadmapPhaseResponse",
    "RoadmapItemResponse",
    "ProjectResponse",
    "UserProfileResponse",
    "UserSkillBase",
    "UserSkillResponse",
]
