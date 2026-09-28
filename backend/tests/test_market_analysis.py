"""Unit and integration tests for Phase 8 Deterministic Market Analysis (Sections 7, 40, 49)."""
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.career import CareerRole
from backend.models.job import Job
from backend.models.skill import Skill, JobSkill
from backend.models.analysis import Analysis
from backend.services.analysis_service import AnalysisService

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def market_fixture(client):
    """Create a controlled fixture with known job-to-skill distribution to verify deterministic math.
    Setup:
    - 1 Test Career Role
    - 10 Jobs
    - Python: in 8/10 jobs (80.0%), 6 required, 2 preferred
    - Docker: in 5/10 jobs (50.0%), 5 required, 0 preferred
    - FastAPI: in 3/10 jobs (30.0%), 2 required, 1 preferred
    """
    with client.application.app_context():
        # Create a unique test career role
        role = CareerRole(
            name="Deterministic Test Role",
            category="Quality",
            description="Role used strictly for testing deterministic market percentage formulas."
        )
        db.session.add(role)
        db.session.commit()
        role_id = role.id

        # Create skills
        python_skill = Skill(name="Python", normalized_name="python", category="Language")
        docker_skill = Skill(name="Docker", normalized_name="docker", category="Tool")
        fastapi_skill = Skill(name="FastAPI", normalized_name="fastapi", category="Framework")
        db.session.add_all([python_skill, docker_skill, fastapi_skill])
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            python_skill = Skill.query.filter_by(normalized_name="python").first()
            docker_skill = Skill.query.filter_by(normalized_name="docker").first()
            fastapi_skill = Skill.query.filter_by(normalized_name="fastapi").first()

        # Create 10 distinct jobs
        jobs = []
        for i in range(1, 11):
            j = Job(
                career_role_id=role_id,
                title=f"Test Engineer {i}",
                company="QA Labs",
                location="San Francisco, CA",
                experience_level="mid_level",
                source="test",
                external_id=f"test-qa-{role_id}-{i}",
                cleaned_description="Test job description"
            )
            db.session.add(j)
            jobs.append(j)
        db.session.commit()

        # Link skills to jobs:
        # Python: in 8 jobs (jobs 0..7) -> 6 required (0..5), 2 preferred (6..7)
        for i in range(8):
            importance = "required" if i < 6 else "preferred"
            db.session.add(JobSkill(
                job_id=jobs[i].id,
                skill_id=python_skill.id,
                importance=importance,
                confidence=1.0
            ))

        # Docker: in 5 jobs (jobs 0..4) -> 5 required
        for i in range(5):
            db.session.add(JobSkill(
                job_id=jobs[i].id,
                skill_id=docker_skill.id,
                importance="required",
                confidence=1.0
            ))

        # FastAPI: in 3 jobs (jobs 0..2) -> 2 required (0..1), 1 preferred (2)
        for i in range(3):
            importance = "required" if i < 2 else "preferred"
            db.session.add(JobSkill(
                job_id=jobs[i].id,
                skill_id=fastapi_skill.id,
                importance=importance,
                confidence=1.0
            ))

        db.session.commit()

        yield role_id

        # Teardown
        Job.query.filter_by(career_role_id=role_id).delete()
        CareerRole.query.filter_by(id=role_id).delete()
        db.session.commit()

def test_deterministic_frequency_and_percentage_calculation(market_fixture, client):
    """Phase 8 Requirement: Market percentages are 100% deterministic (no LLM hallucination)."""
    role_id = market_fixture

    frequencies = AnalysisService.calculate_skill_frequencies(role_id)
    assert len(frequencies) == 3

    # Results must be ordered by percentage DESC
    py = next(f for f in frequencies if f["normalized_name"] == "python")
    dk = next(f for f in frequencies if f["normalized_name"] == "docker")
    fa = next(f for f in frequencies if f["normalized_name"] == "fastapi")

    # Assert exact counts and percentages
    assert py["skill_count"] == 8
    assert py["total_jobs"] == 10
    assert py["percentage"] == 80.0
    assert py["required_count"] == 6
    assert py["preferred_count"] == 2

    assert dk["skill_count"] == 5
    assert dk["total_jobs"] == 10
    assert dk["percentage"] == 50.0
    assert dk["required_count"] == 5
    assert dk["preferred_count"] == 0

    assert fa["skill_count"] == 3
    assert fa["total_jobs"] == 10
    assert fa["percentage"] == 30.0
    assert fa["required_count"] == 2
    assert fa["preferred_count"] == 1

def test_get_top_skills_endpoint(market_fixture, client):
    """Verify GET /api/skills/top returns exact percentages."""
    role_id = market_fixture
    response = client.get(f"/api/skills/top?career_role_id={role_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 3

    assert data[0]["percentage"] == 80.0
    assert data[0]["skill_name"] == "Python"
    assert data[1]["percentage"] == 50.0
    assert data[1]["skill_name"] == "Docker"
    assert data[2]["percentage"] == 30.0
    assert data[2]["skill_name"] == "FastAPI"

def test_create_and_get_analysis_run(market_fixture, client):
    """Verify POST /api/analysis creates snapshot record and GET retrieves it."""
    role_id = market_fixture
    payload = {
        "career_role_id": role_id,
        "target_location": "San Francisco, CA",
        "experience_level": "mid_level",
        "sources": "adzuna,manual"
    }
    create_res = client.post("/api/analysis", json=payload)
    assert create_res.status_code == 201
    res_data = create_res.get_json()
    assert "analysis" in res_data
    assert res_data["analysis"]["jobs_analyzed"] == 10
    assert res_data["analysis"]["target_location"] == "San Francisco, CA"
    analysis_id = res_data["analysis"]["id"]

    # Verify GET /api/analysis/<id>
    get_res = client.get(f"/api/analysis/{analysis_id}")
    assert get_res.status_code == 200
    assert get_res.get_json()["jobs_analyzed"] == 10

    # Verify GET /api/analysis/<id>/skills
    skills_res = client.get(f"/api/analysis/{analysis_id}/skills")
    assert skills_res.status_code == 200
    skills_data = skills_res.get_json()
    assert len(skills_data) == 3
    assert skills_data[0]["percentage"] == 80.0
