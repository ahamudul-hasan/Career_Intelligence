"""Unit tests for Phase 3 Job Data Model & Manual Job Management."""
import pytest
from backend.app import create_app
from backend.providers.manual import ManualProvider
from backend.services.job_service import JobService

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_list_jobs(client):
    response = client.get("/api/jobs")
    assert response.status_code == 200
    data = response.get_json()
    assert "jobs" in data
    assert "total" in data
    assert isinstance(data["jobs"], list)

def test_import_job_manual_flow(client):
    # 1. First get a valid career role ID
    careers_res = client.get("/api/careers")
    careers = careers_res.get_json()
    role_id = careers[0]["id"]

    # 2. Import a manual job posting with HTML and extra whitespace
    raw_desc = """
    <div>
        <h3>Backend Engineer Position</h3>
        <p>We are seeking a <strong>Python</strong> and <strong>PostgreSQL</strong> developer.</p>
        <p>Must have experience with Docker, Flask or FastAPI, and AWS.</p>
    </div>
    """
    payload = {
        "career_role_id": role_id,
        "title": "Junior Python Backend Developer",
        "company": "Antigravity Labs",
        "location": "San Francisco, CA",
        "experience_level": "entry_level",
        "description": raw_desc
    }
    response = client.post("/api/jobs/import", json=payload)
    assert response.status_code == 201
    res_data = response.get_json()
    assert "job" in res_data
    job = res_data["job"]
    job_id = job["id"]
    assert job["title"] == "Junior Python Backend Developer"
    assert job["career_role_id"] == role_id
    assert job["source"] == "manual"
    # Ensure HTML tags were cleaned from cleaned_description
    assert "<p>" not in job["cleaned_description"]
    assert "Python" in job["cleaned_description"]

    # 3. Retrieve single job by ID
    get_res = client.get(f"/api/jobs/{job_id}")
    assert get_res.status_code == 200
    fetched_job = get_res.get_json()
    assert fetched_job["id"] == job_id
    assert fetched_job["company"] == "Antigravity Labs"
    assert fetched_job["raw_description"] is not None

    # 4. List jobs filtered by career_role_id
    filtered_res = client.get(f"/api/jobs?career_role_id={role_id}")
    assert filtered_res.status_code == 200
    filtered_data = filtered_res.get_json()
    assert any(j["id"] == job_id for j in filtered_data["jobs"])

    # 5. Delete job
    del_res = client.delete(f"/api/jobs/{job_id}")
    assert del_res.status_code == 200

    # 6. Verify job is gone
    not_found_res = client.get(f"/api/jobs/{job_id}")
    assert not_found_res.status_code == 404

def test_import_job_validation_error(client):
    # Missing required title and description
    response = client.post("/api/jobs/import", json={"career_role_id": 1})
    assert response.status_code == 400
    data = response.get_json()
    assert data["error"] == "VALIDATION_ERROR"

def test_manual_provider_ingestion(client):
    with client.application.app_context():
        provider = ManualProvider()
        assert provider.search("Backend") == []
        # Test ingesting via ManualProvider
        created = provider.ingest_manual_job(
            career_role_id=1,
            title="Software Engineer - Systems",
            description="Core systems engineering role requiring C++ and Linux.",
            company="Kernel Systems"
        )
        assert created["id"] is not None
        assert created["title"] == "Software Engineer - Systems"
        assert created["source"] == "manual"

        # Cleanup
        JobService.delete_job(created["id"])
