"""AI Orchestration modules using LangChain and Google Gemini."""
from backend.ai.llm import get_llm
from backend.ai.prompts import SKILL_EXTRACTION_SYSTEM_PROMPT
from backend.ai.skill_extractor import extract_skills_from_text
from backend.ai.roadmap_generator import generate_personalized_roadmap
from backend.ai.project_recommender import recommend_projects_for_gaps

__all__ = [
    "get_llm",
    "SKILL_EXTRACTION_SYSTEM_PROMPT",
    "extract_skills_from_text",
    "generate_personalized_roadmap",
    "recommend_projects_for_gaps",
]
