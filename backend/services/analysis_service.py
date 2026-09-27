"""Market analysis and deterministic skill gap engine service (Sections 7, 49, 50)."""
from typing import List, Dict, Any, Optional
from sqlalchemy import func
from backend.extensions import db
from backend.models.job import Job
from backend.models.skill import Skill, JobSkill
from backend.models.analysis import Analysis
from backend.config.settings import GAP_THRESHOLDS

class AnalysisService:
    @staticmethod
    def calculate_skill_frequencies(career_role_id: int) -> List[Dict[str, Any]]:
        """Calculate deterministic skill frequencies and percentages from real job data."""
        total_jobs_cnt = db.session.query(func.count(func.distinct(Job.id))).filter(
            Job.career_role_id == career_role_id
        ).scalar() or 0

        if total_jobs_cnt == 0:
            return []

        results = (
            db.session.query(
                Skill.id.label("skill_id"),
                Skill.name.label("skill_name"),
                Skill.normalized_name.label("normalized_name"),
                Skill.category.label("category"),
                func.count(func.distinct(JobSkill.job_id)).label("skill_count"),
                func.sum(db.case((JobSkill.importance == "required", 1), else_=0)).label("required_count"),
                func.sum(db.case((JobSkill.importance == "preferred", 1), else_=0)).label("preferred_count")
            )
            .join(JobSkill, JobSkill.skill_id == Skill.id)
            .join(Job, JobSkill.job_id == Job.id)
            .filter(Job.career_role_id == career_role_id)
            .group_by(Skill.id, Skill.name, Skill.normalized_name, Skill.category)
            .order_by(func.count(func.distinct(JobSkill.job_id)).desc())
            .all()
        )

        output = []
        for r in results:
            percentage = round((r.skill_count * 100.0) / total_jobs_cnt, 2)
            output.append({
                "skill_id": r.skill_id,
                "skill_name": r.skill_name,
                "normalized_name": r.normalized_name,
                "category": r.category,
                "skill_count": r.skill_count,
                "percentage": percentage,
                "required_count": int(r.required_count or 0),
                "preferred_count": int(r.preferred_count or 0),
            })
        return output

    @staticmethod
    def calculate_skill_gaps(market_frequencies: List[Dict[str, Any]], user_skills_map: Dict[int, int]) -> List[Dict[str, Any]]:
        """Deterministic skill gap calculation based on GAP_THRESHOLDS."""
        gaps = []
        for item in market_frequencies:
            skill_id = item["skill_id"]
            user_prof = user_skills_map.get(skill_id, 0)
            pct = item["percentage"]

            if pct >= GAP_THRESHOLDS["HIGH_GAP_MIN_FREQUENCY"] and user_prof <= GAP_THRESHOLDS["HIGH_GAP_MAX_PROFICIENCY"]:
                priority = "high"
                explanation = f"Demanded by {pct}% of jobs in the market. Current proficiency is beginner or none."
            elif pct >= GAP_THRESHOLDS["MEDIUM_GAP_MIN_FREQUENCY"] and user_prof <= GAP_THRESHOLDS["MEDIUM_GAP_MAX_PROFICIENCY"]:
                priority = "medium"
                explanation = f"Appears in {pct}% of postings. Building higher fluency will increase hireability."
            elif pct >= GAP_THRESHOLDS["LOW_GAP_MIN_FREQUENCY"]:
                priority = "low"
                explanation = f"Valuable secondary skill found in {pct}% of jobs."
            else:
                continue

            gaps.append({
                "skill_id": skill_id,
                "skill_name": item["skill_name"],
                "category": item["category"],
                "market_frequency": pct,
                "user_proficiency": user_prof,
                "gap_priority": priority,
                "explanation": explanation
            })
        return gaps
