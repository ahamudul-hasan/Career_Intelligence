"""Unit tests for Phase 2 Career Taxonomy endpoints."""
import pytest
from backend.app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_list_careers(client):
    response = client.get("/api/careers")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) >= 20  # seeded with 25 roles
    role = data[0]
    assert "id" in role
    assert "name" in role
    assert "category" in role
    assert "description" in role

def test_get_career_by_id(client):
    # First get list to pick a real ID
    list_res = client.get("/api/careers")
    data = list_res.get_json()
    first_role = data[0]
    role_id = first_role["id"]

    response = client.get(f"/api/careers/{role_id}")
    assert response.status_code == 200
    career = response.get_json()
    assert career["id"] == role_id
    assert career["name"] == first_role["name"]

def test_get_career_not_found(client):
    response = client.get("/api/careers/99999")
    assert response.status_code == 404
    data = response.get_json()
    assert data["error"] == "NOT_FOUND"

def test_filter_careers_by_category(client):
    response = client.get("/api/careers?category=Software Development")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0
    for role in data:
        assert role["category"] == "Software Development"

def test_search_careers(client):
    response = client.get("/api/careers?search=Backend")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0
    assert any("Backend" in role["name"] for role in data)

def test_list_categories(client):
    response = client.get("/api/careers/categories")
    assert response.status_code == 200
    categories = response.get_json()
    assert isinstance(categories, list)
    assert "Software Development" in categories
    assert "AI / ML" in categories
    assert "Data" in categories
    assert "Infrastructure" in categories
    assert "Security" in categories
    assert "Quality" in categories
