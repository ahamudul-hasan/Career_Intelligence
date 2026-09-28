"""Batch skill extraction runner for stored jobs (Phase 6)."""
from backend.app import create_app
from backend.services.skill_service import SkillService
from backend.models.job import Job

def main():
    app = create_app()
    with app.app_context():
        roles = set(row[0] for row in Job.query.with_entities(Job.career_role_id).all())
        print(f"[*] Found jobs across career role IDs: {roles}")
        for role_id in sorted(roles):
            res = SkillService.extract_skills_for_career(role_id, limit=50)
            print(f"[+] Role {role_id} ({res['career_role_name']}): processed {res['jobs_processed']} jobs, extracted {res['total_skills_extracted']} skills.")

if __name__ == "__main__":
    main()
