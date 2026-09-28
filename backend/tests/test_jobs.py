"""Unit tests for Phase 3 & Phase 4 Job Data Model, Providers, and Ingestion."""
import io
import pytest
from backend.app import create_app
from backend.providers.manual import ManualProvider
from backend.providers.adzuna import AdzunaProvider
from backend.providers.file_provider import FileProvider
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
    # 1. Get a valid career role ID
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
    response = client.post("/api/jobs/import", json={"career_role_id": 1})
    assert response.status_code == 400
    data = response.get_json()
    assert data["error"] == "VALIDATION_ERROR"

def test_adzuna_provider_search():
    provider = AdzunaProvider()
    results = provider.search(career="Software Engineer", location="US", limit=5)
    assert isinstance(results, list)
    assert len(results) > 0
    first = results[0]
    assert "title" in first
    assert "company" in first
    assert "location" in first
    assert "raw_description" in first
    assert first["source"] == "adzuna"

def test_file_provider_parsing():
    provider = FileProvider()
    sample_content = """Senior Backend Developer
We need strong Python, Docker, and PostgreSQL skills.
---
Frontend Engineer
Expert in React, TypeScript, and Tailwind CSS.
"""
    jobs = provider.parse_text_file(sample_content, filename="sample.txt")
    assert len(jobs) == 2
    assert jobs[0]["title"] == "Senior Backend Developer"
    assert jobs[1]["title"] == "Frontend Engineer"
    assert jobs[0]["source"] == "file"

def test_post_jobs_search_live_ingestion(client):
    """Phase 4 Acceptance Criterion:
    Selecting 'Backend Developer, USA, Entry Level, 30 jobs' actually populates 20-30 rows in jobs.
    """
    # Career ID 2 is Backend Developer
    payload = {
        "career_role_id": 2,
        "location": "US",
        "experience_level": "entry_level",
        "limit": 30,
        "source": "adzuna"
    }
    response = client.post("/api/jobs/search", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert "jobs_found" in data
    assert "jobs_ingested" in data
    assert "jobs_duplicate" in data
    assert data["jobs_found"] >= 20
    # On first run jobs are ingested; on subsequent runs they are deduplicated
    assert (data["jobs_ingested"] + data["jobs_duplicate"]) >= 20
    assert len(data["jobs"]) == data["jobs_ingested"]

    # Verify jobs exist in database via GET /api/jobs (acceptance criterion: 20-30 rows in jobs)
    list_res = client.get("/api/jobs?career_role_id=2")
    assert list_res.status_code == 200
    list_data = list_res.get_json()
    assert list_data["total"] >= 20

def test_deduplication_pipeline(client):
    """Running search again with same parameters should deduplicate existing jobs."""
    payload = {
        "career_role_id": 2,
        "location": "US",
        "experience_level": "entry_level",
        "limit": 10,
        "source": "adzuna"
    }
    response = client.post("/api/jobs/search", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    # Since jobs are already in database, duplicates must be detected
    assert data["jobs_duplicate"] > 0

def test_file_upload_ingestion(client):
    import uuid
    uid = uuid.uuid4().hex[:6]
    file_content = f"Cloud DevOps Engineer {uid}\nRequires Kubernetes, Terraform, and AWS CI/CD pipelines.".encode("utf-8")
    data = {
        "career_role_id": 1,
        "file": (io.BytesIO(file_content), f"devops_job_{uid}.txt")
    }
    response = client.post("/api/jobs/upload", data=data, content_type="multipart/form-data")
    assert response.status_code == 201
    res_data = response.get_json()
    assert res_data["jobs_ingested"] == 1
    assert res_data["jobs"][0]["source"] == "file"

def test_messy_html_and_boilerplate_cleaning_on_import(client):
    """Phase 5 requirement: Messy HTML, scripts, entities, and boilerplate are cleaned before storage."""
    import uuid
    uid = uuid.uuid4().hex[:6]
    messy_html = f"""
    <style>.ad {{ display: none; }}</style>
    <div id="job-post-{uid}">
        <h1>Full Stack Developer \u2014 Python &amp; React ({uid})</h1>
        <script>window.tracker = true;</script>
        <p>We are seeking a <strong>talented</strong> engineer to build web apps.</p>
        <br/><br/>
        <h3>Requirements:</h3>
        <ul>
            <li>Strong skills in <strong>Python</strong> &amp; <strong>FastAPI</strong>.</li>
            <li>Experience with <em>PostgreSQL</em> and Docker.</li>
        </ul>
        <p>Equal Opportunity Employer / Affirmative Action. All qualified applicants will receive consideration for employment without regard to race.</p>
    </div>
    """
    payload = {
        "career_role_id": 1,
        "title": f"Full Stack Developer {uid}",
        "company": "Clean Code Inc.",
        "location": "Remote",
        "experience_level": "mid_level",
        "description": messy_html
    }
    response = client.post("/api/jobs/import", json=payload)
    assert response.status_code == 201
    job_data = response.get_json()["job"]

    # Verify raw description is preserved
    assert "<style>" in job_data["raw_description"]
    assert "<script>" in job_data["raw_description"]

    # Verify cleaned description is stripped and normalized
    cleaned = job_data["cleaned_description"]
    assert "<style>" not in cleaned
    assert "<script>" not in cleaned
    assert "window.tracker" not in cleaned
    assert "Equal Opportunity Employer" not in cleaned
    assert "• Strong skills in Python & FastAPI." in cleaned
    assert "• Experience with PostgreSQL and Docker." in cleaned
    assert "-" in cleaned  # em-dash converted
