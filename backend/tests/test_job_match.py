"""Unit and integration tests for Job-Specific Matching (Phase 13 / Section 44)."""
import uuid
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.career import CareerRole
from backend.models.job import Job
from backend.models.skill import Skill, JobSkill
from backend.models.user import User, UserSkill
from backend.services.job_match_service import JobMatchService

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def app_context(client):
    with client.application.app_context():
        yield

def test_job_matching_classification_and_metrics(app_context):
    """
    CRITICAL ACCEPTANCE CRITERION (Phase 13 / Section 44):
    Verify that skills are classified into matched (✓), partially matched (~), and missing (✗),
    and verify exact deterministic statistics without hire/no-hire predictions.
    """
    uid = uuid.uuid4().hex[:6]
    career = CareerRole(name=f"Match Role {uid}", category="Software Development")
    db.session.add(career)
    db.session.flush()

    user = User(email=f"match_user_{uid}@example.com", name="Match Tester")
    db.session.add(user)
    db.session.flush()

    # Create 5 distinct skills
    s_matched_req = Skill(name=f"Python {uid}", normalized_name=f"python {uid}", category="Languages")
    s_partial_req = Skill(name=f"FastAPI {uid}", normalized_name=f"fastapi {uid}", category="Framework")
    s_missing_req = Skill(name=f"Docker {uid}", normalized_name=f"docker {uid}", category="DevOps")
    s_matched_pref = Skill(name=f"PostgreSQL {uid}", normalized_name=f"postgresql {uid}", category="Database")
    s_missing_pref = Skill(name=f"Kubernetes {uid}", normalized_name=f"kubernetes {uid}", category="DevOps")

    db.session.add_all([s_matched_req, s_partial_req, s_missing_req, s_matched_pref, s_missing_pref])
    db.session.flush()

    # User proficiencies
    # s_matched_req: proficiency 3 (Advanced -> Matched for required)
    # s_partial_req: proficiency 1 (Beginner -> Partially Matched for required)
    # s_missing_req: proficiency 0 (Missing for required)
    # s_matched_pref: proficiency 2 (Intermediate -> Matched for preferred)
    # s_missing_pref: not in profile (Missing for preferred)
    us1 = UserSkill(user_id=user.id, skill_id=s_matched_req.id, proficiency=3)
    us2 = UserSkill(user_id=user.id, skill_id=s_partial_req.id, proficiency=1)
    us3 = UserSkill(user_id=user.id, skill_id=s_missing_req.id, proficiency=0)
    us4 = UserSkill(user_id=user.id, skill_id=s_matched_pref.id, proficiency=2)
    db.session.add_all([us1, us2, us3, us4])

    # Job Posting with Extracted Skills
    job = Job(
        career_role_id=career.id,
        title=f"Backend Lead {uid}",
        company="Fintech Co",
        cleaned_description="Building modern financial systems."
    )
    db.session.add(job)
    db.session.flush()

    # Attach skills to Job: 3 required, 2 preferred
    js1 = JobSkill(job_id=job.id, skill_id=s_matched_req.id, importance="required", confidence=0.95)
    js2 = JobSkill(job_id=job.id, skill_id=s_partial_req.id, importance="required", confidence=0.90)
    js3 = JobSkill(job_id=job.id, skill_id=s_missing_req.id, importance="required", confidence=0.85)
    js4 = JobSkill(job_id=job.id, skill_id=s_matched_pref.id, importance="preferred", confidence=0.80)
    js5 = JobSkill(job_id=job.id, skill_id=s_missing_pref.id, importance="preferred", confidence=0.75)
    db.session.add_all([js1, js2, js3, js4, js5])
    db.session.commit()

    # Run Job Matching
    result = JobMatchService.calculate_job_match(job_id=job.id, user_id=user.id)

    assert result["job_id"] == job.id
    assert result["user_id"] == user.id

    summary = result["summary"]
    assert summary["total_skills"] == 5
    assert summary["required_total"] == 3
    assert summary["required_matched"] == 1
    assert summary["required_partial"] == 1
    assert summary["required_missing"] == 1
    assert summary["preferred_total"] == 2
    assert summary["preferred_matched"] == 1
    assert summary["preferred_missing"] == 1
    assert summary["matched_count"] == 2
    assert summary["partially_matched_count"] == 1
    assert summary["missing_count"] == 2
    assert summary["required_coverage_pct"] == 33.3

    # Check each individual skill match status and symbols
    match_map = {m["skill_id"]: m for m in result["matches"]}

    assert match_map[s_matched_req.id]["status"] == "matched"
    assert match_map[s_matched_req.id]["status_symbol"] == "✓"

    assert match_map[s_partial_req.id]["status"] == "partially_matched"
    assert match_map[s_partial_req.id]["status_symbol"] == "~"

    assert match_map[s_missing_req.id]["status"] == "missing"
    assert match_map[s_missing_req.id]["status_symbol"] == "✗"

    assert match_map[s_matched_pref.id]["status"] == "matched"
    assert match_map[s_matched_pref.id]["status_symbol"] == "✓"

    assert match_map[s_missing_pref.id]["status"] == "missing"
    assert match_map[s_missing_pref.id]["status_symbol"] == "✗"

    # SECTION 44 GUARDRAIL: Prohibit hire/no-hire prediction
    forbidden_keys = ["hire", "no_hire", "hire_prediction", "verdict", "hire_probability", "decision"]
    for k in forbidden_keys:
        assert k not in result
        assert k not in summary

    assert "Transparency Notice (Section 44)" in result["disclaimer"]

def test_job_match_api_endpoint(client, app_context):
    """Test GET /api/jobs/<job_id>/match endpoint."""
    uid = uuid.uuid4().hex[:6]
    career = CareerRole(name=f"API Match Role {uid}", category="AI/ML")
    db.session.add(career)
    db.session.flush()

    job = Job(
        career_role_id=career.id,
        title=f"ML Engineer {uid}",
        company="Open AI Lab",
        cleaned_description="Deep learning models."
    )
    db.session.add(job)
    db.session.commit()

    # Call /api/jobs/<id>/match
    res = client.get(f"/api/jobs/{job.id}/match?user_id=1")
    assert res.status_code == 200
    data = res.get_json()
    assert data["job_id"] == job.id
    assert "summary" in data
    assert "matches" in data
    assert "disclaimer" in data

    # 404 for invalid job id
    res_404 = client.get("/api/jobs/999999/match")
    assert res_404.status_code == 404
