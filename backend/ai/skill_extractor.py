"""LangChain structured skill extraction module (Phase 6 / Section 19, 47)."""
from typing import List
from pydantic import BaseModel, Field
from backend.ai.llm import get_llm
from backend.ai.prompts import SKILL_EXTRACTION_SYSTEM_PROMPT
from backend.schemas.skill import ExtractedSkill

class SkillsExtractionOutput(BaseModel):
    skills: List[ExtractedSkill] = Field(default_factory=list, description="List of skills extracted from job text")

def extract_skills_from_text(job_text: str) -> List[ExtractedSkill]:
    """Extract structured skills from job description text using Gemini via LangChain."""
    llm = get_llm()
    structured_llm = llm.with_structured_output(SkillsExtractionOutput)
    prompt = f"{SKILL_EXTRACTION_SYSTEM_PROMPT}\n\nJob Posting Text:\n{job_text}"
    result = structured_llm.invoke(prompt)
    if isinstance(result, SkillsExtractionOutput):
        return result.skills
    return []
