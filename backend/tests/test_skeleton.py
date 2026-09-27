"""Tests to verify the complete Section 34 backend skeleton."""
import pytest
from backend.app import create_app
from backend.models import CareerRole, Job, Skill, User, Analysis, Roadmap
from backend.schemas import (
    CareerRoleResponse,
    JobResponse,
    SkillResponse,
    AnalysisResponse,
    RoadmapResponse,
    UserProfileResponse
)
from backend.services import CareerService, JobService, SkillService, AnalysisService, RoadmapService
from backend.providers import AdzunaProvider, JoobleProvider, ManualProvider, FileProvider

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    assert data["service"] == "CS Career Intelligence API"

def test_blueprint_routes_registered(client):
    """Ensure all core REST endpoints respond without 404 handler issues."""
    routes = [
        "/api/health",
        "/api/careers",
        "/api/jobs",
        "/api/skills",
        "/api/projects"
    ]
    for route in routes:
        # We check the endpoint exists (status is not 404 for missing route handler)
        # Note: without DB data it may return 200 or empty list, or connection error if DB is down,
        # but the route must be registered.
        rule_endpoints = [str(p) for p in client.application.url_map.iter_rules()]
        matched = any(route in r for r in rule_endpoints)
        assert matched, f"Route {route} not found in registered URL map"

def test_providers_instantiation():
    """Verify provider abstractions are properly defined."""
    adzuna = AdzunaProvider()
    assert adzuna is not None
    jooble = JoobleProvider()
    assert jooble.search("Backend") == []
    manual = ManualProvider()
    assert manual.search("Backend") == []
    file_p = FileProvider()
    assert file_p.search("Backend") == []
