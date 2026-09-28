"""LangChain structured roadmap generation module (Phase 11 / Sections 10, 43, 48)."""
import logging
from typing import List, Dict, Any, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from backend.ai.llm import get_llm
from backend.ai.prompts import ROADMAP_SYSTEM_PROMPT, build_roadmap_user_prompt
from backend.schemas.roadmap import (
    RoadmapOutputSchema,
    RoadmapPhaseSchema,
    RoadmapItemSchema,
    RoadmapProjectSchema,
)

logger = logging.getLogger(__name__)

def generate_personalized_roadmap(
    target_career: str,
    market_frequencies: List[Dict[str, Any]],
    user_skills: List[Dict[str, Any]],
    gaps: List[Dict[str, Any]],
    available_time: Optional[str] = "10-15 hours/week"
) -> RoadmapOutputSchema:
    """Convenience wrapper for RoadmapGenerator.generate_roadmap."""
    return RoadmapGenerator.generate_roadmap(
        target_career=target_career,
        market_frequencies=market_frequencies,
        user_skills=user_skills,
        gaps=gaps,
        available_time=available_time
    )

class RoadmapGenerator:
    @staticmethod
    def generate_roadmap(
        target_career: str,
        market_frequencies: List[Dict[str, Any]],
        user_skills: List[Dict[str, Any]],
        gaps: List[Dict[str, Any]],
        available_time: Optional[str] = "10-15 hours/week"
    ) -> RoadmapOutputSchema:
        """Generate structured personalized roadmap using Google Gemini with structured output (Section 48)."""
        prompt = build_roadmap_user_prompt(
            target_career=target_career,
            market_frequencies=market_frequencies,
            user_skills=user_skills,
            gaps=gaps,
            available_time=available_time
        )

        try:
            llm = get_llm()
            structured_llm = llm.with_structured_output(RoadmapOutputSchema)

            messages = [
                SystemMessage(content=ROADMAP_SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]

            logger.info(f"Generating personalized roadmap for '{target_career}' ({len(gaps)} gaps)...")
            result = structured_llm.invoke(messages)

            if isinstance(result, RoadmapOutputSchema) and len(result.phases) > 0:
                logger.info(f"Roadmap generated successfully with {len(result.phases)} phases.")
                return result

            # If result is empty or dict, parse
            if isinstance(result, dict):
                return RoadmapOutputSchema(**result)

        except Exception as exc:
            logger.warning(f"LLM roadmap generation encountered error ({exc}). Falling back to deterministic gap synthesis.")

        # Fallback to deterministic synthesis if API limits or errors occur
        return RoadmapGenerator._fallback_deterministic_roadmap(
            target_career=target_career,
            gaps=gaps,
            available_time=available_time
        )

    @staticmethod
    def _fallback_deterministic_roadmap(
        target_career: str,
        gaps: List[Dict[str, Any]],
        available_time: Optional[str] = None
    ) -> RoadmapOutputSchema:
        """Deterministic curriculum synthesizer used as a resilient fallback."""
        high_gaps = [g for g in gaps if g.get("gap_priority") == "high"]
        med_gaps = [g for g in gaps if g.get("gap_priority") == "medium"]
        low_gaps = [g for g in gaps if g.get("gap_priority") == "low"]

        phases: List[RoadmapPhaseSchema] = []
        phase_num = 1

        # Phase 1: High Priority Core Gaps
        if high_gaps:
            items = []
            for g in high_gaps:
                items.append(RoadmapItemSchema(
                    skill_name=g["skill_name"],
                    title=f"Master Core {g['skill_name']} Fundamentals & Patterns",
                    description=f"Deep-dive into {g['skill_name']} core syntax, ecosystem tooling, and idiomatic best practices.",
                    importance_reason=f"Demanded by {g.get('market_frequency', 50)}% of job postings. Critical hiring prerequisite.",
                    estimated_hours=30
                ))
            top_skill = high_gaps[0]["skill_name"]
            phases.append(RoadmapPhaseSchema(
                phase_number=phase_num,
                title="Phase 1: Core Foundation & High-Priority Prerequisites",
                estimated_duration="4-6 Weeks",
                items=items,
                project=RoadmapProjectSchema(
                    title=f"Production-Ready {top_skill} Microservice Application",
                    description=f"Architect and deploy a containerized service demonstrating proficiency in {top_skill}.",
                    difficulty="intermediate",
                    skills_demonstrated=[top_skill]
                )
            ))
            phase_num += 1

        # Phase 2: Medium Priority Competencies
        if med_gaps or not phases:
            target_gaps = med_gaps if med_gaps else gaps[:3]
            items = []
            for g in target_gaps:
                items.append(RoadmapItemSchema(
                    skill_name=g["skill_name"],
                    title=f"System Integration & Intermediate {g['skill_name']}",
                    description=f"Implement robust interfaces, test suites, and data models using {g['skill_name']}.",
                    importance_reason=f"Found in {g.get('market_frequency', 30)}% of market postings. Essential for competitive technical interviews.",
                    estimated_hours=25
                ))
            phases.append(RoadmapPhaseSchema(
                phase_number=phase_num,
                title=f"Phase {phase_num}: Secondary Systems & Framework Integration",
                estimated_duration="3-4 Weeks",
                items=items,
                project=RoadmapProjectSchema(
                    title="Distributed Data Pipeline & API Integration",
                    description=f"Build an automated data ingestion and caching layer utilizing {', '.join(g['skill_name'] for g in target_gaps[:2])}.",
                    difficulty="intermediate",
                    skills_demonstrated=[g['skill_name'] for g in target_gaps[:2]]
                )
            ))
            phase_num += 1

        # Phase 3: Low Priority / Advanced Polish
        if low_gaps:
            items = []
            for g in low_gaps[:4]:
                items.append(RoadmapItemSchema(
                    skill_name=g["skill_name"],
                    title=f"Advanced {g['skill_name']} Optimization & CI/CD",
                    description=f"Explore performance tuning, observability, and automated deployment pipelines with {g['skill_name']}.",
                    importance_reason=f"Present in {g.get('market_frequency', 15)}% of jobs. Good differentiator on senior candidate resumes.",
                    estimated_hours=20
                ))
            phases.append(RoadmapPhaseSchema(
                phase_number=phase_num,
                title=f"Phase {phase_num}: Production Hardening, DevOps & Portfolio Capstone",
                estimated_duration="2-3 Weeks",
                items=items,
                project=RoadmapProjectSchema(
                    title="Full-Stack Capstone with Automated CI/CD & Monitoring",
                    description="Deliver an end-to-end cloud-native system with comprehensive testing, containerization, and Prometheus/Grafana metrics.",
                    difficulty="advanced",
                    skills_demonstrated=[g["skill_name"] for g in low_gaps[:2]]
                )
            ))

        return RoadmapOutputSchema(
            title=f"Personalized {target_career} Learning Roadmap",
            summary=f"Tailored milestone roadmap engineered to close {len(gaps)} identified skill gaps for {target_career} roles with verified market demand.",
            phases=phases
        )
