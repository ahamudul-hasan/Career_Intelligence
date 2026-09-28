"""Project recommendation generator using LangChain (Phase 12 / Sections 45, 33)."""
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from backend.ai.llm import get_llm
from backend.ai.prompts import (
    PROJECT_RECOMMENDATION_SYSTEM_PROMPT,
    build_project_recommendation_user_prompt,
)

logger = logging.getLogger(__name__)

class ProjectSuggestion(BaseModel):
    title: str = Field(..., description="Evocative, professional title of the portfolio project")
    description: str = Field(..., description="Detailed architectural scope, tools, design patterns, and concrete problem solved")
    difficulty: str = Field("intermediate", description="beginner, intermediate, or advanced")
    skills_demonstrated: List[str] = Field(default_factory=list, description="List of technical skills demonstrated by completing this project")
    target_gap_skill: Optional[str] = Field(None, description="Primary skill gap addressed by this project")
    why_it_matters: Optional[str] = Field(None, description="Resume differentiator and technical interview talking points")
    estimated_duration: Optional[str] = Field("2-3 weeks", description="Estimated time to complete the project")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "description": self.description,
            "difficulty": self.difficulty,
            "skills_demonstrated": self.skills_demonstrated,
            "target_gap_skill": self.target_gap_skill,
            "why_it_matters": self.why_it_matters,
            "estimated_duration": self.estimated_duration,
        }

class ProjectRecommendationsListSchema(BaseModel):
    projects: List[ProjectSuggestion] = Field(
        default_factory=list,
        description="Comprehensive collection of recommended portfolio projects bridging identified skill gaps"
    )

class ProjectRecommender:
    """Orchestrates structured LLM project recommendation generation with deterministic fallback (Section 45)."""

    @classmethod
    def recommend_projects_for_gaps(
        cls,
        target_career: str,
        gaps: List[Dict[str, Any]],
        user_skills: Optional[List[Dict[str, Any]]] = None,
        desired_difficulty: Optional[str] = None
    ) -> List[ProjectSuggestion]:
        """Generate high-impact portfolio project recommendations targeting identified skill gaps."""
        if not gaps:
            return cls._generate_baseline_projects(target_career)

        try:
            llm = get_llm()
            structured_llm = llm.with_structured_output(ProjectRecommendationsListSchema)

            user_prompt = build_project_recommendation_user_prompt(
                target_career=target_career,
                gaps=gaps,
                user_skills=user_skills,
                desired_difficulty=desired_difficulty
            )

            messages = [
                SystemMessage(content=PROJECT_RECOMMENDATION_SYSTEM_PROMPT),
                HumanMessage(content=user_prompt)
            ]

            logger.info("Requesting project recommendations from LLM for career: %s with %d gaps", target_career, len(gaps))
            response = structured_llm.invoke(messages)

            if isinstance(response, ProjectRecommendationsListSchema) and response.projects:
                projects = response.projects
                cls._ensure_high_priority_coverage(projects, gaps, target_career)
                return projects

            logger.warning("LLM returned empty project list. Using deterministic fallback.")
            return cls._generate_fallback_projects(target_career, gaps, desired_difficulty)

        except Exception as e:
            logger.warning("Project recommendation generation failed (%s). Falling back to deterministic generator.", e)
            return cls._generate_fallback_projects(target_career, gaps, desired_difficulty)

    @classmethod
    def _ensure_high_priority_coverage(
        cls,
        projects: List[ProjectSuggestion],
        gaps: List[Dict[str, Any]],
        target_career: str
    ) -> None:
        """Verify that every high-priority gap is represented in projects. Append targeted projects if missing."""
        covered_skills = set()
        for p in projects:
            for s in p.skills_demonstrated:
                covered_skills.add(s.lower())
            if p.target_gap_skill:
                covered_skills.add(p.target_gap_skill.lower())

        high_priority_gaps = [g for g in gaps if g.get("gap_priority", "").upper() == "HIGH"]
        for gap in high_priority_gaps:
            skill_name = gap.get("skill_name", "")
            if skill_name.lower() not in covered_skills:
                fallback_proj = cls._build_single_project_for_skill(skill_name, target_career, "intermediate")
                projects.append(fallback_proj)
                covered_skills.add(skill_name.lower())

    @classmethod
    def _generate_fallback_projects(
        cls,
        target_career: str,
        gaps: List[Dict[str, Any]],
        desired_difficulty: Optional[str] = None
    ) -> List[ProjectSuggestion]:
        """Deterministic generator ensuring every high-priority and medium-priority gap has a project attached."""
        projects: List[ProjectSuggestion] = []
        high_gaps = [g for g in gaps if g.get("gap_priority", "").upper() == "HIGH"]
        med_gaps = [g for g in gaps if g.get("gap_priority", "").upper() == "MEDIUM"]

        target_gaps = high_gaps if high_gaps else med_gaps
        if not target_gaps:
            target_gaps = gaps[:3]

        for gap in target_gaps:
            skill_name = gap.get("skill_name", "Core Engineering")
            diff = desired_difficulty or ("intermediate" if gap.get("gap_priority", "").upper() == "HIGH" else "advanced")
            proj = cls._build_single_project_for_skill(skill_name, target_career, diff)
            projects.append(proj)

        # Capstone synthesizing multiple gap skills if multiple exist
        if len(projects) > 1:
            all_gap_names = [g.get("skill_name", "") for g in target_gaps[:4]]
            capstone = ProjectSuggestion(
                title=f"End-to-End {target_career} Distributed Platform",
                description=(
                    f"Production-ready distributed platform architected specifically for {target_career} roles. "
                    f"Features end-to-end integration of {', '.join(all_gap_names)}, including automated testing, "
                    f"Docker containerization, CI/CD pipeline, and structured observability."
                ),
                difficulty="advanced",
                skills_demonstrated=all_gap_names + ["Docker", "CI/CD", "Testing"],
                target_gap_skill=all_gap_names[0] if all_gap_names else None,
                why_it_matters="Demonstrates comprehensive architectural competency, production readiness, and systems integration.",
                estimated_duration="3-4 weeks"
            )
            projects.append(capstone)

        return projects

    @classmethod
    def _build_single_project_for_skill(cls, skill_name: str, target_career: str, difficulty: str) -> ProjectSuggestion:
        """Construct a high-quality portfolio project tailored to a specific technical skill."""
        clean_skill = skill_name.strip()
        lower_skill = clean_skill.lower()

        if "docker" in lower_skill or "container" in lower_skill or "kubernetes" in lower_skill:
            return ProjectSuggestion(
                title=f"Cloud-Native Microservices Mesh with {clean_skill}",
                description=(
                    f"Architect a containerized microservice cluster using {clean_skill} with automated health checks, "
                    f"horizontal auto-scaling, ingress routing, and zero-downtime rolling deployment strategies."
                ),
                difficulty=difficulty,
                skills_demonstrated=[clean_skill, "Docker", "DevOps", "Microservices", "CI/CD"],
                target_gap_skill=clean_skill,
                why_it_matters=f"Proves hands-on infrastructure engineering and deployment automation skills demanded in {target_career} roles.",
                estimated_duration="2-3 weeks"
            )

        if "aws" in lower_skill or "cloud" in lower_skill or "azure" in lower_skill or "gcp" in lower_skill:
            return ProjectSuggestion(
                title=f"Serverless Event-Driven Pipeline on {clean_skill}",
                description=(
                    f"Design an asynchronous, fault-tolerant data pipeline leveraging {clean_skill} managed services, "
                    f"dead-letter queues, Terraform infrastructure-as-code, and automated CloudWatch/Stackdriver alerting."
                ),
                difficulty=difficulty,
                skills_demonstrated=[clean_skill, "Cloud Architecture", "Terraform", "Event-Driven", "API Design"],
                target_gap_skill=clean_skill,
                why_it_matters="Validates ability to design secure, cost-effective cloud architectures and infrastructure-as-code.",
                estimated_duration="2-3 weeks"
            )

        if "sql" in lower_skill or "postgres" in lower_skill or "mysql" in lower_skill or "database" in lower_skill:
            return ProjectSuggestion(
                title=f"High-Throughput Analytics & Caching Engine with {clean_skill}",
                description=(
                    f"Build an optimized relational data store and caching layer utilizing {clean_skill} and Redis. "
                    f"Includes complex indexing strategies, query plan analysis, partitioning, and transactional integrity guarantees."
                ),
                difficulty=difficulty,
                skills_demonstrated=[clean_skill, "Database Design", "Indexing", "Query Optimization", "Transactions"],
                target_gap_skill=clean_skill,
                why_it_matters="Demonstrates deep understanding of query optimization, indexing, and high-concurrency database workloads.",
                estimated_duration="2 weeks"
            )

        if "react" in lower_skill or "vue" in lower_skill or "frontend" in lower_skill or "typescript" in lower_skill:
            return ProjectSuggestion(
                title=f"Interactive Real-Time Analytics Dashboard with {clean_skill}",
                description=(
                    f"Develop a responsive, high-performance web dashboard in {clean_skill} featuring real-time WebSocket "
                    f"data streams, state management, customizable data visualization charts, and accessibility compliance."
                ),
                difficulty=difficulty,
                skills_demonstrated=[clean_skill, "State Management", "WebSockets", "Data Visualization", "Component Design"],
                target_gap_skill=clean_skill,
                why_it_matters="Proves mastery of modern frontend state management, real-time networking, and UX design.",
                estimated_duration="2 weeks"
            )

        # Default engineering project
        return ProjectSuggestion(
            title=f"Production-Ready {clean_skill} Service & Integration Framework",
            description=(
                f"Design and implement a modular service centered on {clean_skill}. Features robust error handling, "
                f"REST/gRPC interfaces, comprehensive automated test suites (unit and integration), and detailed documentation."
            ),
            difficulty=difficulty,
            skills_demonstrated=[clean_skill, "API Design", "Unit Testing", "System Architecture"],
            target_gap_skill=clean_skill,
            why_it_matters=f"Validates production-ready mastery of {clean_skill} tailored directly to the demands of {target_career}.",
            estimated_duration="2-3 weeks"
        )

    @classmethod
    def _generate_baseline_projects(cls, target_career: str) -> List[ProjectSuggestion]:
        """Baseline project suggestions when no gaps are present."""
        return [
            ProjectSuggestion(
                title=f"Advanced {target_career} Capstone System",
                description=f"Full-stack end-to-end production application demonstrating industry best practices for {target_career}.",
                difficulty="advanced",
                skills_demonstrated=["System Architecture", "API Design", "Testing", "DevOps"],
                why_it_matters="Provides concrete proof of seniority and end-to-end delivery capability.",
                estimated_duration="3-4 weeks"
            )
        ]

def recommend_projects_for_gaps(gap_skills: List[str], target_career: str = "Software Engineer") -> List[ProjectSuggestion]:
    """Generate portfolio project suggestions targeting specific skill gaps."""
    gaps_list = [{"skill_name": s, "gap_priority": "HIGH"} for s in gap_skills]
    return ProjectRecommender.recommend_projects_for_gaps(target_career=target_career, gaps=gaps_list)
