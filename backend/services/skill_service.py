"""Skill service for retrieving, extracting, and persisting skills (Phase 6 / Sections 19, 47)."""
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.exc import IntegrityError
from backend.extensions import db
from backend.models.job import Job
from backend.models.skill import Skill, JobSkill
from backend.models.career import CareerRole
from backend.utils.normalization import normalize_skill_name, get_canonical_skill_display
from backend.ai.skill_extractor import extract_skills_from_text

logger = logging.getLogger(__name__)

class SkillService:
    @staticmethod
    def get_all_skills() -> List[Skill]:
        """Fetch all canonical skills."""
        return Skill.query.order_by(Skill.name).all()

    @staticmethod
    def get_or_create_skill(name: str, category: Optional[str] = None) -> Skill:
        """Find existing skill by normalized name / canonical name or create a new canonical entry (Phase 7)."""
        clean_name = name.strip()[:150]
        normalized = normalize_skill_name(clean_name)[:150]
        canonical = get_canonical_skill_display(clean_name)[:150]

        skill = Skill.query.filter(
            (Skill.normalized_name == normalized) | (Skill.name == clean_name) | (Skill.name == canonical)
        ).first()

        if not skill:
            try:
                skill = Skill(
                    name=canonical,
                    normalized_name=normalized,
                    category=(category or "Technical")[:100]
                )
                db.session.add(skill)
                db.session.commit()
            except IntegrityError:
                db.session.rollback()
                skill = Skill.query.filter(
                    (Skill.normalized_name == normalized) | (Skill.name == clean_name) | (Skill.name == canonical)
                ).first()

        return skill

    @staticmethod
    def extract_and_store_job_skills(job: Job) -> List[JobSkill]:
        """Run LangChain skill extraction on a job description and persist extracted skills in MySQL."""
        text_to_analyze = job.cleaned_description or job.raw_description or ""
        if not text_to_analyze.strip():
            return []

        extracted_skills = extract_skills_from_text(text_to_analyze)
        if not extracted_skills:
            return []

        saved_job_skills: List[JobSkill] = []

        for item in extracted_skills:
            if not item.name or not item.name.strip():
                continue

            skill = SkillService.get_or_create_skill(
                name=item.name,
                category=item.category
            )

            # Check if JobSkill already exists
            job_skill = JobSkill.query.filter_by(
                job_id=job.id,
                skill_id=skill.id
            ).first()

            if not job_skill:
                job_skill = JobSkill(
                    job_id=job.id,
                    skill_id=skill.id,
                    category=(item.category or skill.category or "Technical")[:100],
                    importance=item.importance if item.importance in ("required", "preferred") else "required",
                    confidence=float(item.confidence) if item.confidence is not None else 1.0
                )
                db.session.add(job_skill)
                saved_job_skills.append(job_skill)
            else:
                # Update category and importance if newly provided
                job_skill.category = (item.category or job_skill.category)[:100]
                job_skill.importance = item.importance if item.importance in ("required", "preferred") else job_skill.importance
                saved_job_skills.append(job_skill)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

        return saved_job_skills

    @staticmethod
    def extract_skills_for_career(
        career_role_id: int,
        limit: int = 50,
        reextract: bool = False
    ) -> Dict[str, Any]:
        """Batch extract skills for all jobs belonging to a career role (Phase 6)."""
        career = db.session.get(CareerRole, career_role_id)
        if not career:
            raise ValueError(f"Career role with id {career_role_id} not found")

        query = Job.query.filter(Job.career_role_id == career_role_id)
        if not reextract:
            # Filter to jobs that have no job_skills recorded yet
            query = query.filter(~Job.skills.any())

        jobs_to_process = query.order_by(Job.id.asc()).limit(limit).all()

        processed_jobs = 0
        total_skills_saved = 0
        job_results = []

        for job in jobs_to_process:
            try:
                job_skills = SkillService.extract_and_store_job_skills(job)
                processed_jobs += 1
                total_skills_saved += len(job_skills)
                job_results.append({
                    "job_id": job.id,
                    "title": job.title,
                    "skills_count": len(job_skills)
                })
            except Exception as e:
                logger.error(f"Error extracting skills for job {job.id}: {e}")
                continue

        return {
            "career_role_id": career_role_id,
            "career_role_name": career.name,
            "jobs_processed": processed_jobs,
            "total_skills_extracted": total_skills_saved,
            "jobs": job_results
        }

    @staticmethod
    def get_job_skills(job_id: int) -> List[Dict[str, Any]]:
        """Retrieve all extracted skills for a specific job."""
        job = db.session.get(Job, job_id)
        if not job:
            return []

        return [
            {
                "id": js.skill.id,
                "name": js.skill.name,
                "normalized_name": js.skill.normalized_name,
                "category": js.category or js.skill.category,
                "importance": js.importance,
                "confidence": js.confidence,
            }
            for js in job.skills
        ]
