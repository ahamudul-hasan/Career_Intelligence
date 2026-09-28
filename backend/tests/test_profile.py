"""Unit and integration tests for User Skill Profile (Phase 9 / Sections 8, 28, 41)."""
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.user import User, UserSkill
from backend.models.skill import Skill
from backend.services.profile_service import ProfileService

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

def test_get_or_create_default_profile(client):
    """Verify default user is retrieved or automatically initialized."""
    response = client.get("/api/profile?user_id=1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 1
    assert "name" in data
    assert "email" in data
    assert "skills" in data

def test_update_profile_info(client):
    """Verify updating user profile name and email."""
    update_payload = {
        "name": "Jane Engineer",
        "email": "jane.engineer@example.com"
    }
    response = client.put("/api/profile?user_id=1", json=update_payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["profile"]["name"] == "Jane Engineer"
    assert data["profile"]["email"] == "jane.engineer@example.com"

def test_add_user_skill_by_id_and_by_name(client, app_context):
    """Verify adding skills both via explicit skill_id and natural skill_name."""
    # Ensure a canonical skill exists
    py_skill = Skill.query.filter_by(normalized_name="python").first()
    if not py_skill:
        py_skill = Skill(name="Python", normalized_name="python", category="Programming Languages")
        db.session.add(py_skill)
        db.session.commit()

    # 1. Add via skill_id
    res1 = client.post("/api/profile/skills?user_id=1", json={
        "skill_id": py_skill.id,
        "proficiency": 3  # Advanced
    })
    assert res1.status_code == 201
    d1 = res1.get_json()
    assert d1["skill"]["skill_id"] == py_skill.id
    assert d1["skill"]["proficiency"] == 3

    # 2. Add via natural skill_name (with alias normalization, e.g. 'Postgres')
    res2 = client.post("/api/profile/skills?user_id=1", json={
        "skill_name": "Postgres",
        "proficiency": 2  # Intermediate
    })
    assert res2.status_code == 201
    d2 = res2.get_json()
    assert d2["skill"]["proficiency"] == 2
    assert d2["skill"]["normalized_name"] == "postgresql"

    # Verify listing skills
    list_res = client.get("/api/profile/skills?user_id=1")
    assert list_res.status_code == 200
    skills_list = list_res.get_json()
    skill_names = [s["normalized_name"] for s in skills_list]
    assert "python" in skill_names
    assert "postgresql" in skill_names

def test_update_skill_proficiency(client, app_context):
    """Verify updating proficiency levels (0 to 4)."""
    # Create skill
    skill = Skill.query.filter_by(normalized_name="docker").first()
    if not skill:
        skill = Skill(name="Docker", normalized_name="docker", category="DevOps")
        db.session.add(skill)
        db.session.commit()

    # Add with proficiency 1 (Beginner)
    client.post("/api/profile/skills?user_id=1", json={
        "skill_id": skill.id,
        "proficiency": 1
    })

    # Update via PUT /api/profile/skills/<id> to 4 (Expert)
    put_res = client.put(f"/api/profile/skills/{skill.id}?user_id=1", json={
        "proficiency": 4
    })
    assert put_res.status_code == 200
    assert put_res.get_json()["skill"]["proficiency"] == 4

    # Verify via DB
    user_skill = UserSkill.query.filter_by(user_id=1, skill_id=skill.id).first()
    assert user_skill.proficiency == 4

def test_proficiency_validation(client):
    """Verify proficiency is strictly bounded between 0 and 4."""
    # Invalid: 5
    res_high = client.post("/api/profile/skills?user_id=1", json={
        "skill_name": "Kubernetes",
        "proficiency": 5
    })
    assert res_high.status_code == 400
    assert res_high.get_json()["error"] == "VALIDATION_ERROR"

    # Invalid: -1
    res_low = client.post("/api/profile/skills?user_id=1", json={
        "skill_name": "Kubernetes",
        "proficiency": -1
    })
    assert res_low.status_code == 400
    assert res_low.get_json()["error"] == "VALIDATION_ERROR"

def test_remove_user_skill(client, app_context):
    """Verify deleting a skill from user profile."""
    skill = Skill.query.filter_by(normalized_name="fastapi").first()
    if not skill:
        skill = Skill(name="FastAPI", normalized_name="fastapi", category="Frameworks")
        db.session.add(skill)
        db.session.commit()

    # Add skill
    client.post("/api/profile/skills?user_id=1", json={
        "skill_id": skill.id,
        "proficiency": 2
    })

    # Delete skill
    del_res = client.delete(f"/api/profile/skills/{skill.id}?user_id=1")
    assert del_res.status_code == 200

    # Ensure it's deleted
    user_skill = UserSkill.query.filter_by(user_id=1, skill_id=skill.id).first()
    assert user_skill is None
