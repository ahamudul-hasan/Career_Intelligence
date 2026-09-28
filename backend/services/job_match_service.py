"""Job-Specific Matching Service (Phase 13 / Section 44)."""
from typing import Dict, Any, List, Optional
from backend.extensions import db
from backend.models.job import Job
from backend.models.user import UserSkill
from backend.models.skill import JobSkill

PROFICIENCY_LABELS = {
    0: "None / Not in Profile",
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert"
}

SECTION_44_DISCLAIMER = (
    "Transparency Notice (Section 44): This is an objective skills alignment breakdown based on "
    "stated job requirements and your self-reported proficiency. This platform strictly does not "
    "generate algorithmic hire/no-hire predictions, interview odds, or candidate rankings."
)

class JobMatchService:
    @staticmethod
    def calculate_job_match(job_id: int, user_id: int = 1) -> Dict[str, Any]:
        """
        Compare a single job's extracted skills against the user's skill profile.
        Categorizes each skill into:
          - 'matched' (✓): Meets requirement
          - 'partially_matched' (~): Beginner familiarity on a required skill
          - 'missing' (✗): Absent or level 0
        Explicitly does NOT output a hire/no-hire prediction (Section 44).
        """
        job = db.session.get(Job, job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found.")

        # Fetch user's skills
        user_skills = UserSkill.query.filter_by(user_id=user_id).all()
        user_skill_map = {us.skill_id: us.proficiency for us in user_skills}

        # Fetch job's extracted skills
        job_skills: List[JobSkill] = JobSkill.query.filter_by(job_id=job.id).all()

        matches = []
        required_total = 0
        required_matched = 0
        required_partial = 0
        required_missing = 0

        preferred_total = 0
        preferred_matched = 0
        preferred_missing = 0

        for js in job_skills:
            skill = js.skill
            if not skill:
                continue

            importance = (js.importance or "required").lower()
            user_prof = user_skill_map.get(skill.id, 0)
            user_label = PROFICIENCY_LABELS.get(user_prof, "None")

            # Deterministic Match Classification (Section 44)
            if importance == "required":
                required_total += 1
                if user_prof >= 2:
                    status = "matched"
                    status_symbol = "✓"
                    required_matched += 1
                    status_reason = f"Meets core requirement with {user_label} proficiency (Level {user_prof})."
                elif user_prof == 1:
                    status = "partially_matched"
                    status_symbol = "~"
                    required_partial += 1
                    status_reason = "Basic familiarity (Level 1) reported, but role requires working proficiency (Level 2+)."
                else:
                    status = "missing"
                    status_symbol = "✗"
                    required_missing += 1
                    status_reason = "Critical required skill not yet demonstrated in your profile."
            else:
                preferred_total += 1
                if user_prof >= 1:
                    status = "matched"
                    status_symbol = "✓"
                    preferred_matched += 1
                    status_reason = f"Bonus qualification met with {user_label} proficiency."
                else:
                    status = "missing"
                    status_symbol = "✗"
                    preferred_missing += 1
                    status_reason = "Preferred bonus skill not present in your current profile."

            matches.append({
                "skill_id": skill.id,
                "skill_name": skill.name,
                "category": js.category or skill.category or "General",
                "importance": importance,
                "confidence": js.confidence,
                "user_proficiency": user_prof,
                "user_proficiency_label": user_label,
                "status": status,
                "status_symbol": status_symbol,
                "status_reason": status_reason,
            })

        # Summary statistics
        total_skills = len(matches)
        matched_count = required_matched + preferred_matched
        partially_matched_count = required_partial
        missing_count = required_missing + preferred_missing

        required_coverage_pct = round((required_matched / required_total * 100), 1) if required_total > 0 else 100.0
        overall_coverage_pct = round(((matched_count + 0.5 * partially_matched_count) / total_skills * 100), 1) if total_skills > 0 else 0.0

        return {
            "job_id": job.id,
            "job_title": job.title,
            "company": job.company,
            "career_role_id": job.career_role_id,
            "career_role_name": job.career_role.name if job.career_role else None,
            "user_id": user_id,
            "summary": {
                "total_skills": total_skills,
                "matched_count": matched_count,
                "partially_matched_count": partially_matched_count,
                "missing_count": missing_count,
                "required_total": required_total,
                "required_matched": required_matched,
                "required_partial": required_partial,
                "required_missing": required_missing,
                "preferred_total": preferred_total,
                "preferred_matched": preferred_matched,
                "preferred_missing": preferred_missing,
                "required_coverage_pct": required_coverage_pct,
                "overall_coverage_pct": overall_coverage_pct,
            },
            "matches": matches,
            "disclaimer": SECTION_44_DISCLAIMER
        }
