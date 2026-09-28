"""Unit and integration tests for Error Handling & Data Transparency (Phase 14 / Sections 56, 57)."""
import io
import uuid
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.career import CareerRole
from backend.services.analysis_service import AnalysisService

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

def test_standardized_json_error_format_on_http_errors(client):
    """
    CRITICAL ACCEPTANCE CRITERION (Phase 14 / Section 57):
    Assert that HTTP errors (404, 405, etc.) return standardized JSON { "error": CODE, "message": ... }
    and NEVER unformatted HTML.
    """
    # 1. 404 Not Found
    res_404 = client.get("/api/nonexistent-endpoint-12345")
    assert res_404.status_code == 404
    data_404 = res_404.get_json()
    assert data_404 is not None
    assert "error" in data_404
    assert "message" in data_404
    assert data_404["error"] == "NOT_FOUND"

    # 2. 405 Method Not Allowed
    res_405 = client.post("/api/health")
    assert res_405.status_code == 405
    data_405 = res_405.get_json()
    assert data_405 is not None
    assert "error" in data_405
    assert "message" in data_405
    assert data_405["error"] == "METHOD_NOT_ALLOWED"

def test_file_upload_error_handling(client, app_context):
    """
    Assert that file upload failure modes return structured error responses:
    - Missing file
    - Unsupported file extension
    - Empty file
    - Garbage content with no recognizable jobs
    """
    uid = uuid.uuid4().hex[:6]
    career = CareerRole(name=f"Upload Career {uid}", category="Software Development")
    db.session.add(career)
    db.session.commit()

    # 1. Missing file in multipart form data
    res_no_file = client.post(
        "/api/jobs/upload",
        data={"career_role_id": career.id},
        content_type="multipart/form-data"
    )
    assert res_no_file.status_code == 400
    assert res_no_file.get_json()["error"] == "NO_FILE"

    # 2. Unsupported extension (.exe)
    res_bad_ext = client.post(
        "/api/jobs/upload",
        data={
            "career_role_id": career.id,
            "file": (io.BytesIO(b"fake binary"), "malicious.exe")
        },
        content_type="multipart/form-data"
    )
    assert res_bad_ext.status_code == 400
    assert res_bad_ext.get_json()["error"] == "UNSUPPORTED_FILE_TYPE"

    # 3. Empty file
    res_empty = client.post(
        "/api/jobs/upload",
        data={
            "career_role_id": career.id,
            "file": (io.BytesIO(b"   \n\t  "), "empty.txt")
        },
        content_type="multipart/form-data"
    )
    assert res_empty.status_code == 400
    assert res_empty.get_json()["error"] == "EMPTY_FILE"

    # 4. Garbage text containing no recognizable job listings
    res_garbage = client.post(
        "/api/jobs/upload",
        data={
            "career_role_id": career.id,
            "file": (io.BytesIO(b"Just a random grocery list: milk, eggs, bread."), "grocery.txt")
        },
        content_type="multipart/form-data"
    )
    assert res_garbage.status_code in [400, 422]
    assert res_garbage.get_json()["error"] == "NO_JOBS_FOUND"

def test_malformed_json_payload_validation(client):
    """Assert that invalid JSON bodies return structured VALIDATION_ERROR or BAD_REQUEST."""
    res = client.post(
        "/api/roadmap/generate",
        data="not a valid json string {",
        content_type="application/json"
    )
    assert res.status_code == 400
    data = res.get_json()
    assert data is not None
    assert "error" in data
    assert "message" in data

def test_zero_jobs_market_analysis_transparency(app_context):
    """
    Assert that running market analysis on a career with zero jobs does not crash,
    and returns a valid snapshot with 0 jobs analyzed conforming to Section 56.
    """
    uid = uuid.uuid4().hex[:6]
    career = CareerRole(name=f"Empty Career {uid}", category="Security")
    db.session.add(career)
    db.session.commit()

    # 1. Frequency calculation on 0 jobs returns empty list safely (no ZeroDivisionError)
    frequencies = AnalysisService.calculate_skill_frequencies(career_role_id=career.id)
    assert frequencies == []

    # 2. Creating an analysis snapshot record on 0 jobs captures Section 56 metadata
    analysis_data = AnalysisService.create_analysis(
        career_role_id=career.id,
        target_location="Remote",
        experience_level="entry_level",
        sources="adzuna"
    )
    assert analysis_data is not None
    assert analysis_data["total_jobs_analyzed"] == 0
    assert analysis_data["analysis"]["jobs_analyzed"] == 0
    assert analysis_data["analysis"]["target_location"] == "Remote"
    assert analysis_data["analysis"]["experience_level"] == "entry_level"
    assert analysis_data["analysis"]["sources"] == "adzuna"
    assert "analysis_date" in analysis_data["analysis"]
