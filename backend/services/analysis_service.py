"""Market analysis and deterministic skill gap engine service (Sections 7, 49, 50)."""
from typing import List, Dict, Any, Optional
from sqlalchemy import func
from backend.extensions import db
from backend.models.job import Job
from backend.models.skill import Skill, JobSkill
from backend.models.career import CareerRole
from backend.models.analysis import Analysis
from backend.config.settings import GAP_THRESHOLDS

class AnalysisService:
    @staticmethod
    def calculate_skill_frequencies(
        career_role_id: int,
        location: Optional[str] = None,
        experience_level: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Calculate deterministic skill frequencies and percentages from real job data.
        100% deterministic mathematical aggregation: skill_count / total_jobs_cnt.
        No LLM hallucinations or invented numbers (Section 7, 49).
        """
        # Base query for distinct jobs count
        job_filter = [Job.career_role_id == career_role_id]
        if location and location.lower() != "all":
            job_filter.append(Job.location.ilike(f"%{location.strip()}%"))
        if experience_level and experience_level.lower() != "all":
            job_filter.append(Job.experience_level == experience_level.strip())

        total_jobs_cnt = db.session.query(func.count(func.distinct(Job.id))).filter(
            *job_filter
        ).scalar() or 0

        if total_jobs_cnt == 0:
            return []

        # Join Job -> JobSkill -> Skill
        query = (
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
            .filter(*job_filter)
            .group_by(Skill.id, Skill.name, Skill.normalized_name, Skill.category)
            .order_by(func.count(func.distinct(JobSkill.job_id)).desc(), Skill.name.asc())
        )

        if limit:
            query = query.limit(limit)

        results = query.all()

        output = []
        for r in results:
            percentage = round((r.skill_count * 100.0) / total_jobs_cnt, 1)
            output.append({
                "skill_id": r.skill_id,
                "skill_name": r.skill_name,
                "normalized_name": r.normalized_name,
                "category": r.category or "Technical",
                "skill_count": int(r.skill_count),
                "total_jobs": total_jobs_cnt,
                "percentage": percentage,
                "required_count": int(r.required_count or 0),
                "preferred_count": int(r.preferred_count or 0),
            })

        return output

    @staticmethod
    def create_analysis(
        career_role_id: int,
        target_location: Optional[str] = "All",
        experience_level: Optional[str] = "All",
        sources: str = "adzuna"
    ) -> Dict[str, Any]:
        """Create and persist an Analysis snapshot record in MySQL (Section 49, 56)."""
        career = db.session.get(CareerRole, career_role_id)
        if not career:
            raise ValueError(f"Career role with id {career_role_id} does not exist.")

        # Calculate frequencies
        frequencies = AnalysisService.calculate_skill_frequencies(
            career_role_id=career_role_id,
            location=target_location if target_location != "All" else None,
            experience_level=experience_level if experience_level != "All" else None
        )

        total_jobs = db.session.query(func.count(func.distinct(Job.id))).filter(
            Job.career_role_id == career_role_id
        ).scalar() or 0

        # Create Analysis snapshot record
        analysis = Analysis(
            career_role_id=career_role_id,
            target_location=target_location or "All",
            experience_level=experience_level or "All",
            jobs_analyzed=total_jobs,
            sources=sources or "adzuna"
        )
        db.session.add(analysis)
        db.session.commit()

        return {
            "analysis": analysis.to_dict(),
            "skills": frequencies,
            "total_jobs_analyzed": total_jobs
        }

    @staticmethod
    def get_analysis_by_id(analysis_id: int) -> Optional[Analysis]:
        """Fetch a specific Analysis record."""
        return db.session.get(Analysis, analysis_id)

    @staticmethod
    def get_analyses_history(career_role_id: Optional[int] = None, limit: int = 20) -> List[Analysis]:
        """Retrieve recent market analyses."""
        query = Analysis.query
        if career_role_id:
            query = query.filter(Analysis.career_role_id == career_role_id)
        return query.order_by(Analysis.id.desc()).limit(limit).all()

    @staticmethod
    def calculate_skill_gaps(market_frequencies: List[Dict[str, Any]], user_skills_map: Dict[int, int]) -> List[Dict[str, Any]]:
        """Deterministic skill gap calculation based on GAP_THRESHOLDS (Section 50)."""
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
