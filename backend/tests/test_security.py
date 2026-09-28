"""Security & Input Validation Tests (Phase 15 / Section 58)."""
import io
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.user import User

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_password_hashing_and_never_leaked(client):
    """Test passwords are encrypted with strong hashes and never exposed in dict representation."""
    user = User(name="Security Tester", email="sec.test@example.com")
    raw_pwd = "SuperSecretPassword123!"
    user.set_password(raw_pwd)

    # Password is not stored in plaintext
    assert user.password_hash is not None
    assert user.password_hash != raw_pwd
    assert user.password_hash.startswith("scrypt:") or user.password_hash.startswith("pbkdf2:")

    # Password verification works
    assert user.check_password(raw_pwd) is True
    assert user.check_password("WrongPassword") is False

    # to_dict representation does NOT expose password or password_hash
    serialized = user.to_dict()
    assert "password" not in serialized
    assert "password_hash" not in serialized

def test_pydantic_validation_on_profile_endpoints(client):
    """Test Pydantic input validation on PUT /api/profile and skill endpoints."""
    # Invalid email syntax
    res = client.put("/api/profile", json={"email": "invalid-email-address"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["error"] == "VALIDATION_ERROR"
    assert "details" in data

    # Invalid proficiency level (> 4)
    res2 = client.post("/api/profile/skills", json={"skill_name": "Python", "proficiency": 99})
    assert res2.status_code == 400
    data2 = res2.get_json()
    assert data2["error"] == "VALIDATION_ERROR"

    # Missing skill_id and skill_name
    res3 = client.post("/api/profile/skills", json={"proficiency": 2})
    assert res3.status_code == 400
    data3 = res3.get_json()
    assert data3["error"] == "VALIDATION_ERROR"

def test_pydantic_validation_on_analysis_and_roadmap_endpoints(client):
    """Test Pydantic validation rejects requests missing required fields."""
    # POST /api/analysis without career_role_id
    res = client.post("/api/analysis", json={"target_location": "US"})
    assert res.status_code == 400
    data = res.get_json()
    assert data["error"] == "VALIDATION_ERROR"

    # POST /api/roadmap/generate without career_role_id
    res2 = client.post("/api/roadmap/generate", json={"available_time": "5 hours/week"})
    assert res2.status_code == 400
    data2 = res2.get_json()
    assert data2["error"] == "VALIDATION_ERROR"

    # POST /api/skills/extract without career_role_id
    res3 = client.post("/api/skills/extract", json={"limit": 10})
    assert res3.status_code == 400
    data3 = res3.get_json()
    assert data3["error"] == "VALIDATION_ERROR"

def test_upload_security_disallowed_extensions_and_oversize(client):
    """Test that file uploads reject executable/malicious extensions and size limits."""
    # Disallowed extension
    data = {
        "career_role_id": "1",
        "file": (io.BytesIO(b"echo 'malicious script'"), "exploit.sh")
    }
    res = client.post("/api/jobs/upload", data=data, content_type="multipart/form-data")
    assert res.status_code == 400
    assert res.get_json()["error"] == "UNSUPPORTED_FILE_TYPE"

    # Oversized file (> 5MB)
    large_payload = b"X" * (5 * 1024 * 1024 + 100)
    data_large = {
        "career_role_id": "1",
        "file": (io.BytesIO(large_payload), "massive_jobs.txt")
    }
    res2 = client.post("/api/jobs/upload", data=data_large, content_type="multipart/form-data")
    assert res2.status_code == 400
    assert res2.get_json()["error"] == "FILE_TOO_LARGE"

def test_cors_headers_restrict_origins(client):
    """Test that CORS configuration headers are returned correctly."""
    res = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    assert res.status_code == 200
    assert res.headers.get("Access-Control-Allow-Origin") == "http://localhost:5173"
