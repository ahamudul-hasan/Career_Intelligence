"""Unit and integration tests for Phase 6 Skill Extraction (Sections 19, 47)."""
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.job import Job
from backend.models.skill import Skill, JobSkill
from backend.services.skill_service import SkillService
from backend.ai.skill_extractor import extract_skills_from_text
from backend.schemas.skill import ExtractedSkill

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_extract_skills_structured_schema():
    """Verify LangChain skill extractor returns structured schema (name, category, importance, confidence)."""
    sample_text = """
    We are seeking a Senior Backend Engineer.
    Must have extensive experience with Python, FastAPI, and PostgreSQL.
    Experience with Docker and AWS is required.
    Familiarity with Kubernetes and Redis is a strong plus.
    """
    skills = extract_skills_from_text(sample_text)
    assert len(skills) >= 4

    skill_names = [s.name.lower() for s in skills]
    assert any("python" in n for n in skill_names)
    assert any("postgresql" in n or "postgres" in n for n in skill_names)

    # Verify schema fields and bounds
    for s in skills:
        assert isinstance(s, ExtractedSkill)
        assert s.name
        assert s.category in [
            "Language", "Framework", "Database", "Cloud", 
            "Tool", "Architecture", "Methodology", "Soft Skill", "Technical"
        ]
        assert s.importance in ["required", "preferred"]
        assert 0.0 <= s.confidence <= 1.0

def test_extract_and_store_single_job_skills(client):
    """Verify single job extraction stores rows in skills and job_skills tables."""
    # 1. Create a test job
    import uuid
    uid = uuid.uuid4().hex[:6]
    desc = f"Looking for Backend Developer {uid}. Requirements: Python, Flask, Redis, and Git. GraphQL is preferred."
    payload = {
        "career_role_id": 2,
        "title": f"API Developer {uid}",
        "company": "FastAPI Labs",
        "description": desc
    }
    create_res = client.post("/api/jobs/import", json=payload)
    assert create_res.status_code == 201
    job_id = create_res.get_json()["job"]["id"]

    # 2. Extract skills via endpoint POST /api/jobs/<id>/extract
    extract_res = client.post(f"/api/jobs/{job_id}/extract")
    assert extract_res.status_code == 200
    data = extract_res.get_json()
    assert "skills" in data
    assert len(data["skills"]) >= 3

    # 3. Retrieve skills via GET /api/jobs/<id>/skills
    get_res = client.get(f"/api/jobs/{job_id}/skills")
    assert get_res.status_code == 200
    skills_data = get_res.get_json()["skills"]
    assert len(skills_data) == len(data["skills"])

    # 4. Verify job dict in GET /api/jobs/<id> includes skills
    job_res = client.get(f"/api/jobs/{job_id}")
    assert job_res.status_code == 200
    job_dict = job_res.get_json()
    assert "skills" in job_dict
    assert len(job_dict["skills"]) > 0

def test_batch_skill_extraction_endpoint(client):
    """Verify batch extraction endpoint POST /api/skills/extract."""
    payload = {
        "career_role_id": 2,
        "limit": 3,
        "reextract": False
    }
    res = client.post("/api/skills/extract", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert "jobs_processed" in data
    assert "total_skills_extracted" in data
    assert data["career_role_id"] == 2
