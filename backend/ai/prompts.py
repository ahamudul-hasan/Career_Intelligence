"""AI Prompts module for Skill Extraction, Roadmaps, and Recommendations (Sections 47, 48)."""
import json
from typing import List, Dict, Any, Optional

SKILL_EXTRACTION_SYSTEM_PROMPT = """You are an expert technical recruiter, engineering taxonomist, and market intelligence analyst.
Your task is to analyze the provided job description and extract a comprehensive, structured list of all technical and professional skills, tools, frameworks, languages, architectures, and core methodologies.

Extraction Guidelines:
1. **Granularity**: Extract concrete, specific skills (e.g., "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "CI/CD", "System Design", "Unit Testing", "Microservices").
2. **Category**: Assign each skill into one of the following standard categories:
   - "Language" (e.g., Python, TypeScript, Go, Java, C++)
   - "Framework" (e.g., FastAPI, Django, React, Express, Spring Boot)
   - "Database" (e.g., PostgreSQL, MySQL, Redis, MongoDB, DynamoDB)
   - "Cloud" (e.g., AWS, GCP, Azure, Terraform, CloudFormation)
   - "Tool" (e.g., Git, Docker, Kubernetes, Jenkins, GitHub Actions)
   - "Architecture" (e.g., Microservices, REST APIs, GraphQL, Event-Driven, Distributed Systems)
   - "Methodology" (e.g., Agile, Scrum, CI/CD, Test-Driven Development)
   - "Soft Skill" (e.g., Problem Solving, Cross-functional Communication, Mentorship)
3. **Importance**:
   - "required": Skills explicitly listed under requirements, prerequisites, "must have", "qualifications", or clearly central to the role.
   - "preferred": Skills mentioned under "bonus", "nice to have", "plus", "preferred qualifications", or desirable context.
4. **Confidence**:
   - Float between 0.0 and 1.0 representing how explicitly the skill was stated in the description (1.0 for explicit naming, 0.8 for strong context).
5. **No Hallucinations**:
   - Only extract skills that are actually stated or directly described in the job text.
   - Do NOT include generic compensation details, company slogans, or non-skill phrases.
"""

ROADMAP_SYSTEM_PROMPT = """You are an elite Senior Engineering Mentor and Curriculum Architect.
Your objective is to generate an actionable, highly personalized, and rigorous career learning roadmap tailored to a developer's specific skill profile and target career role.

CRITICAL INSTRUCTIONS & GUARDRAILS (Section 48):
1. **NO HALLUCINATED METRICS**: NEVER invent market percentages, frequency numbers, or salary estimates. You must strictly reference ONLY the empirical market percentages and gap priorities provided in the input prompt.
2. **GENUINE PERSONALIZATION**: Do not produce generic roadmaps. You must heavily tailor the sequence to the user's specific skill gaps:
   - High-Priority Gaps must be prioritized in Phase 1 (Foundation & Immediate Blockers).
   - Leverage existing skills where the user is already proficient (Level 2-4) as stepping stones.
   - Address Medium and Low Priority Gaps in subsequent phases.
3. **PHASE TIMELINE (Section 43)**: Structure the curriculum into 2 to 4 progressive phases (e.g., "Phase 1: High-Impact Core Gaps", "Phase 2: System Architecture & Ecosystem Integration", "Phase 3: Production Mastery & Portfolio Projects").
4. **CONCRETE ITEMS**: Every roadmap item must be tied to a specific skill, providing a clear title, practical learning tasks, and an explanation of why it matters citing the empirical market percentage.
5. **PRACTICAL PORTFOLIO PROJECTS (Section 45)**: For each phase, attach a concrete, resume-worthy portfolio project that proves mastery of the targeted skills. Include project title, description, and difficulty (beginner, intermediate, or advanced).
"""

def build_roadmap_user_prompt(
    target_career: str,
    market_frequencies: List[Dict[str, Any]],
    user_skills: List[Dict[str, Any]],
    gaps: List[Dict[str, Any]],
    available_time: Optional[str] = "10-15 hours/week"
) -> str:
    """Build structured user prompt feeding deterministic market data into the LLM (Section 48)."""
    return f"""Target Career Role: {target_career}
Available Learning Time: {available_time or '10-15 hours/week'}

--- EMPIRICAL MARKET DEMAND DATA (Phase 8 Verified Numbers) ---
{json.dumps(market_frequencies[:20], indent=2)}

--- CURRENT USER PROFILE & PROFICIENCIES (Phase 9 Portfolio) ---
{json.dumps(user_skills, indent=2)}

--- CALCULATED SKILL GAPS (Phase 10 Deterministic Output) ---
{json.dumps(gaps, indent=2)}

Generate a personalized, progressive learning roadmap that bridges these specific gaps. Format your response strictly according to the requested JSON schema.
"""

PROJECT_RECOMMENDATION_SYSTEM_PROMPT = """You are a Principal Software Architect, Staff Technical Interviewer, and Career Portfolio Strategist.
Your objective is to generate rigorous, highly practical, and candidate-differentiating portfolio project recommendations (Section 45).
Each recommended project must directly resolve identified skill gaps for a candidate seeking a specific target career role.

CRITICAL INSTRUCTIONS & GUARDRAILS (Section 45):
1. **PRODUCTION-GRADE SCOPE**: Prohibit toy applications (e.g., NO basic to-do lists, simple calculator scripts, or trivial tutorials). Projects must emulate real-world systems with realistic architectures (e.g., asynchronous task queues, relational/NoSQL persistence, containerization, API contracts, automated testing, or observability).
2. **GAP TARGETING**: Every recommended project must explicitly focus on bridging one or more identified skill gaps (especially High-Priority and Medium-Priority gaps).
3. **RESUME IMPACT**: Include a clear explanation of how the project demonstrates competency to hiring managers and what specific technical artifacts (e.g. GitHub repo, live demo, Dockerfile, benchmark results) make it stand out.
4. **SKILLS DEMONSTRATED**: Explicitly list all technical skills, libraries, tools, and architectures demonstrated by completing the project.
5. **REALISTIC DIFFICULTY**: Accurately label difficulty as "beginner", "intermediate", or "advanced" based on architectural complexity.
"""

def build_project_recommendation_user_prompt(
    target_career: str,
    gaps: List[Dict[str, Any]],
    user_skills: Optional[List[Dict[str, Any]]] = None,
    desired_difficulty: Optional[str] = None
) -> str:
    """Build structured user prompt for project recommendations targeting specific skill gaps (Section 45)."""
    difficulty_clause = f"\nTarget Difficulty Level: {desired_difficulty}" if desired_difficulty else ""
    return f"""Target Career Role: {target_career}{difficulty_clause}

--- IDENTIFIED SKILL GAPS REQUIRING PROJECT EVIDENCE (High & Medium Priority) ---
{json.dumps(gaps, indent=2)}

--- CURRENT USER CAPABILITIES & FOUNDATIONAL SKILLS ---
{json.dumps(user_skills or [], indent=2)}

For each major skill gap, recommend a concrete, production-oriented portfolio project that provides undeniable proof of competence on the candidate's resume and in technical interviews. Format your response strictly according to the requested JSON schema.
"""
