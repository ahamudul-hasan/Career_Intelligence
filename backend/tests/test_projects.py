"""Tests for Project Recommendations (Phase 12 / Sections 45, 33)."""
import uuid
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.career import CareerRole
from backend.models.job import Job
from backend.models.skill import Skill, JobSkill
from backend.models.user import User, UserSkill
from backend.models.roadmap import Project, Roadmap, RoadmapProject
from backend.ai.project_recommender import ProjectRecommender, ProjectSuggestion
from backend.services.roadmap_service import RoadmapService

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

def test_project_recommender_generator_fallback():
    """Verify that ProjectRecommender produces valid, structured project suggestions."""
    gaps = [
        {"skill_name": "Docker", "gap_priority": "HIGH", "market_frequency": 80.0},
        {"skill_name": "Kubernetes", "gap_priority": "HIGH", "market_frequency": 75.0},
        {"skill_name": "AWS", "gap_priority": "MEDIUM", "market_frequency": 50.0},
    ]

    suggestions = ProjectRecommender._generate_fallback_projects(
        target_career="Cloud Architect",
        gaps=gaps
    )

    assert len(suggestions) >= 2
    for s in suggestions:
        assert isinstance(s, ProjectSuggestion)
        assert s.title
        assert len(s.description) > 30
        assert s.difficulty in ["beginner", "intermediate", "advanced"]
        assert len(s.skills_demonstrated) > 0

def test_every_high_priority_gap_gets_project_attached(app_context):
    """
    CRITICAL ACCEPTANCE CRITERION (Phase 12 / Section 45):
    Assert that every high-priority gap has at least one concrete, career-relevant project attached.
    """
    uid = uuid.uuid4().hex[:6]
    # Setup Career Role
    career = CareerRole(
        name=f"DevOps Role {uid}",
        category="Infrastructure",
        description="Infrastructure test role"
    )
    db.session.add(career)
    db.session.flush()

    # Create 3 skills
    skill_names = [f"Terraform {uid}", f"Docker {uid}", f"Kubernetes {uid}"]
    skills = []
    for name in skill_names:
        s = Skill(name=name, normalized_name=name.lower(), category="DevOps")
        db.session.add(s)
        skills.append(s)
    db.session.flush()

    # Create jobs demanding all 3 skills at 100% frequency
    for i in range(2):
        job = Job(
            career_role_id=career.id,
            title=f"DevOps Job {i} {uid}",
            company="Tech Corp",
            cleaned_description="DevOps required"
        )
        db.session.add(job)
        db.session.flush()
        for s in skills:
            js = JobSkill(job_id=job.id, skill_id=s.id, importance="required", confidence=1.0)
            db.session.add(js)

    # Create user with 0 proficiency in all 3 (all become HIGH-priority gaps)
    user = User(email=f"gap_user_{uid}@example.com", name="Gap Projects User")
    db.session.add(user)
    db.session.flush()

    for s in skills:
        us = UserSkill(user_id=user.id, skill_id=s.id, proficiency=0)
        db.session.add(us)

    db.session.commit()

    # Generate roadmap
    roadmap = RoadmapService.generate_and_save_roadmap(
        career_role_id=career.id,
        user_id=user.id
    )

    assert roadmap is not None
    assert len(roadmap.phases) > 0

    # Retrieve all projects attached to this roadmap
    attached_projects = roadmap.roadmap_projects
    assert len(attached_projects) >= len(skills)

    # Verify EVERY high-priority skill has at least one project attached
    for target_skill in skill_names:
        matching_projects = [
            rp for rp in attached_projects
            if (rp.project and any(target_skill.lower() in sd.lower() for sd in (rp.project.skills_demonstrated or [])))
            or (rp.project and target_skill.lower() in (rp.project.title + " " + rp.project.description).lower())
        ]
        assert len(matching_projects) >= 1, f"High-priority gap '{target_skill}' must have at least one attached project"

def test_projects_api_endpoints(client, app_context):
    """Test GET /api/projects, GET /api/projects/<id>, and POST /api/projects/recommend."""
    uid = uuid.uuid4().hex[:6]
    # Setup Career Role
    career = CareerRole(
        name=f"Backend Role {uid}",
        category="Software Development",
        description="Test"
    )
    db.session.add(career)
    db.session.flush()

    user = User(email=f"user_{uid}@example.com", name="Endpoint User")
    db.session.add(user)
    db.session.flush()

    # Add manual project
    proj = Project(
        title=f"Distributed Caching System {uid}",
        description="Redis and memcached caching layer with replication.",
        difficulty="advanced",
        skills_demonstrated=["Redis", "System Design", "Python"]
    )
    db.session.add(proj)
    db.session.flush()

    roadmap = Roadmap(
        user_id=user.id,
        career_role_id=career.id,
        title="Test Roadmap",
        summary="Summary"
    )
    db.session.add(roadmap)
    db.session.flush()

    rp = RoadmapProject(
        roadmap_id=roadmap.id,
        project_id=proj.id
    )
    db.session.add(rp)
    db.session.commit()

    career_id = career.id
    project_id = proj.id

    # 1. GET /api/projects
    res = client.get("/api/projects")
    assert res.status_code == 200
    data = res.get_json()
    assert isinstance(data, list)
    assert any(p["id"] == project_id for p in data)

    # 2. GET /api/projects with difficulty filter
    res_filtered = client.get("/api/projects?difficulty=advanced")
    assert res_filtered.status_code == 200
    for p in res_filtered.get_json():
        assert p["difficulty"] == "advanced"

    # 3. GET /api/projects/<id>
    res_single = client.get(f"/api/projects/{project_id}")
    assert res_single.status_code == 200
    single_data = res_single.get_json()
    assert single_data["title"] == f"Distributed Caching System {uid}"
    assert "Redis" in single_data["skills_demonstrated"]

    # 4. GET /api/projects/<invalid_id>
    res_404 = client.get("/api/projects/999999")
    assert res_404.status_code == 404

    # 5. POST /api/projects/recommend with valid career
    rec_res = client.post("/api/projects/recommend", json={"career_role_id": career_id})
    assert rec_res.status_code == 200
    rec_data = rec_res.get_json()
    assert "projects" in rec_data
    assert rec_data["count"] >= 1

    # 6. POST /api/projects/recommend without career_role_id -> 400
    rec_bad = client.post("/api/projects/recommend", json={})
    assert rec_bad.status_code == 400
