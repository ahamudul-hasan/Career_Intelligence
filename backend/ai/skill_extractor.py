"""LangChain structured skill extraction module (Phase 6 / Section 19, 47)."""
import re
import time
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from backend.ai.llm import get_llm
from backend.ai.prompts import SKILL_EXTRACTION_SYSTEM_PROMPT
from backend.schemas.skill import ExtractedSkill
from backend.config import Config

logger = logging.getLogger(__name__)

class SkillsExtractionOutput(BaseModel):
    skills: List[ExtractedSkill] = Field(default_factory=list, description="List of skills extracted from job text")

# Canonical dictionary for resilient fallback extraction when API rate limits occur
KNOWN_TAXONOMY = {
    "python": ("Python", "Language"),
    "javascript": ("JavaScript", "Language"),
    "typescript": ("TypeScript", "Language"),
    "golang": ("Go", "Language"),
    "go": ("Go", "Language"),
    "java": ("Java", "Language"),
    "c++": ("C++", "Language"),
    "c#": ("C#", "Language"),
    "rust": ("Rust", "Language"),
    "ruby": ("Ruby", "Language"),
    "php": ("PHP", "Language"),
    "sql": ("SQL", "Language"),
    "html": ("HTML", "Language"),
    "css": ("CSS", "Language"),
    "fastapi": ("FastAPI", "Framework"),
    "flask": ("Flask", "Framework"),
    "django": ("Django", "Framework"),
    "react": ("React", "Framework"),
    "react.js": ("React", "Framework"),
    "reactjs": ("React", "Framework"),
    "node": ("Node.js", "Framework"),
    "node.js": ("Node.js", "Framework"),
    "nodejs": ("Node.js", "Framework"),
    "express": ("Express", "Framework"),
    "spring": ("Spring Boot", "Framework"),
    "spring boot": ("Spring Boot", "Framework"),
    "next.js": ("Next.js", "Framework"),
    "vue": ("Vue.js", "Framework"),
    "angular": ("Angular", "Framework"),
    "postgresql": ("PostgreSQL", "Database"),
    "postgres": ("PostgreSQL", "Database"),
    "mysql": ("MySQL", "Database"),
    "mongodb": ("MongoDB", "Database"),
    "redis": ("Redis", "Database"),
    "sqlite": ("SQLite", "Database"),
    "snowflake": ("Snowflake", "Database"),
    "dynamodb": ("DynamoDB", "Database"),
    "elasticsearch": ("Elasticsearch", "Database"),
    "docker": ("Docker", "Tool"),
    "kubernetes": ("Kubernetes", "Tool"),
    "git": ("Git", "Tool"),
    "github": ("GitHub", "Tool"),
    "jenkins": ("Jenkins", "Tool"),
    "terraform": ("Terraform", "Tool"),
    "aws": ("AWS", "Cloud"),
    "gcp": ("GCP", "Cloud"),
    "azure": ("Azure", "Cloud"),
    "ci/cd": ("CI/CD", "Methodology"),
    "rest": ("REST APIs", "Architecture"),
    "rest api": ("REST APIs", "Architecture"),
    "rest apis": ("REST APIs", "Architecture"),
    "restful": ("REST APIs", "Architecture"),
    "graphql": ("GraphQL", "Architecture"),
    "microservices": ("Microservices", "Architecture"),
    "distributed systems": ("Distributed Systems", "Architecture"),
    "agile": ("Agile", "Methodology"),
    "scrum": ("Scrum", "Methodology"),
    "system design": ("System Design", "Architecture"),
}

def _fallback_extract_skills(text: str) -> List[ExtractedSkill]:
    """Heuristic extraction based on canonical taxonomy when API rate limit / 429 is encountered."""
    found_skills: List[ExtractedSkill] = []
    seen = set()
    lower_text = text.lower()

    for pattern, (canonical_name, category) in KNOWN_TAXONOMY.items():
        # Match as whole word / token boundary
        regex = r"(?:\b|_)" + re.escape(pattern) + r"(?:\b|_)"
        if re.search(regex, lower_text):
            if canonical_name.lower() in seen:
                continue
            seen.add(canonical_name.lower())

            # Determine importance based on surrounding context
            importance = "required"
            if re.search(r"(?:preferred|nice\s+to\s+have|plus|bonus)[^\n.]*" + re.escape(pattern), lower_text):
                importance = "preferred"

            found_skills.append(
                ExtractedSkill(
                    name=canonical_name,
                    category=category,
                    importance=importance,
                    confidence=0.95
                )
            )

    return found_skills

def extract_skills_from_text(job_text: str, max_retries: int = 1) -> List[ExtractedSkill]:
    """Extract structured skills from job description text using Gemini via LangChain.
    Enforces Section 19 schema: name, category, importance, confidence.
    Gracefully falls back to heuristic taxonomy extraction if external quota limits (429) occur.
    """
    if not job_text or len(job_text.strip()) < 20:
        return []

    clean_text = job_text.strip()[:12000]
    prompt = f"{SKILL_EXTRACTION_SYSTEM_PROMPT}\n\nJob Posting Text:\n{clean_text}"

    primary_model = Config.GEMINI_MODEL or "gemini-flash-latest"
    models_to_try = [primary_model]

    for model_name in models_to_try:
        try:
            llm = get_llm(model=model_name, temperature=0.1)
            structured_llm = llm.with_structured_output(SkillsExtractionOutput)
            result = structured_llm.invoke(prompt)

            if isinstance(result, SkillsExtractionOutput) and result.skills:
                return result.skills
            elif isinstance(result, dict) and "skills" in result:
                raw_skills = result["skills"]
                extracted = [ExtractedSkill(**s) if isinstance(s, dict) else s for s in raw_skills]
                if extracted:
                    return extracted
        except Exception as exc:
            err_msg = str(exc)
            logger.warning(f"Gemini API skill extraction ({model_name}) error: {err_msg[:120]}")
            # If rate limited (429) or quota exceeded, fall back to heuristic extraction
            break

    # Fallback to deterministic taxonomy extraction if LLM is unavailable or rate-limited
    return _fallback_extract_skills(clean_text)
