"""Unit and integration tests for Personalized Roadmap Generation (Phase 11 / Sections 10, 30-33, 43, 48)."""
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.career import CareerRole
from backend.models.user import User, UserSkill
from backend.models.skill import Skill, JobSkill
from backend.models.job import Job
from backend.models.roadmap import Roadmap, RoadmapPhase, RoadmapItem, Project, RoadmapProject
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

def test_generate_roadmap_structure_and_persistence(app_context):
    """Verify generated roadmap has phases, milestone items, and attached projects."""
    # Ensure role exists
    role = CareerRole.query.filter_by(name="Roadmap Test Role").first()
    if not role:
        role = CareerRole(name="Roadmap Test Role", category="Software Development")
        db.session.add(role)
        db.session.commit()

    # Ensure test skill exists
    skill = Skill.query.filter_by(normalized_name="py_roadmap_test").first()
    if not skill:
        skill = Skill(name="Python Roadmap Skill", normalized_name="py_roadmap_test", category="Languages")
        db.session.add(skill)
        db.session.commit()

    # Create job with skill so gap can be detected
    job = Job(career_role_id=role.id, title="Roadmap Test Job", company="Test Co", source="test")
    db.session.add(job)
    db.session.flush()
    db.session.add(JobSkill(job_id=job.id, skill_id=skill.id, importance="required"))
    db.session.commit()

    roadmap = RoadmapService.generate_and_save_roadmap(
        career_role_id=role.id,
        user_id=1,
        available_time="10 hours/week"
    )

    assert roadmap.id is not None
    assert len(roadmap.title) > 0
    assert len(roadmap.summary) > 0
    assert len(roadmap.phases) >= 1

    phase1 = roadmap.phases[0]
    assert phase1.phase_number == 1
    assert len(phase1.items) >= 1

    item1 = phase1.items[0]
    assert len(item1.title) > 0
    assert len(item1.importance_reason) > 0
    assert item1.estimated_hours > 0

    # Serialization check
    serialized = roadmap.to_dict()
    assert "phases" in serialized
    assert "projects" in serialized
    assert serialized["career_role_name"] == "Roadmap Test Role"

def test_two_different_users_get_distinct_roadmaps(app_context):
    """Phase 11 Acceptance Criterion: Two users with different skill profiles
    against the same career role receive genuinely different, tailored roadmaps.
    """
    role = CareerRole.query.filter_by(name="Roadmap Differentiator Role").first()
    if not role:
        role = CareerRole(name="Roadmap Differentiator Role", category="Infrastructure")
        db.session.add(role)
        db.session.commit()

    sk_k8s = Skill.query.filter_by(normalized_name="k8s_diff_test").first()
    if not sk_k8s:
        sk_k8s = Skill(name="Kubernetes Diff Skill", normalized_name="k8s_diff_test", category="Cloud")
        db.session.add(sk_k8s)
        db.session.commit()

    sk_linux = Skill.query.filter_by(normalized_name="linux_diff_test").first()
    if not sk_linux:
        sk_linux = Skill(name="Linux Diff Skill", normalized_name="linux_diff_test", category="Tool")
        db.session.add(sk_linux)
        db.session.commit()

    # Add jobs demanding both
    for i in range(5):
        j = Job(career_role_id=role.id, title=f"DevOps Job {i}", company="Cloud Co", source="test")
        db.session.add(j)
        db.session.flush()
        db.session.add(JobSkill(job_id=j.id, skill_id=sk_k8s.id, importance="required"))
        db.session.add(JobSkill(job_id=j.id, skill_id=sk_linux.id, importance="required"))
    db.session.commit()

    # User 1: Novice in both
    user1 = User.query.filter_by(email="novice_diff@test.com").first()
    if not user1:
        user1 = User(name="Novice DevOps", email="novice_diff@test.com")
        db.session.add(user1)
        db.session.commit()
    UserSkill.query.filter_by(user_id=user1.id).delete()
    db.session.commit()

    # User 2: Expert in Linux (4), Novice in Kubernetes (0)
    user2 = User.query.filter_by(email="expert_diff@test.com").first()
    if not user2:
        user2 = User(name="Linux Master", email="expert_diff@test.com")
        db.session.add(user2)
        db.session.commit()
    UserSkill.query.filter_by(user_id=user2.id).delete()
    db.session.add(UserSkill(user_id=user2.id, skill_id=sk_linux.id, proficiency=4))
    db.session.commit()

    # Generate roadmaps
    rm1 = RoadmapService.generate_and_save_roadmap(career_role_id=role.id, user_id=user1.id)
    rm2 = RoadmapService.generate_and_save_roadmap(career_role_id=role.id, user_id=user2.id)

    # User 1 roadmap must address Linux (since user1 has level 0)
    user1_item_skills = [
        item.skill.normalized_name for p in rm1.phases for item in p.items if item.skill
    ]
    # User 2 roadmap must NOT include Linux as a core gap (since user2 is Expert level 4)
    user2_item_skills = [
        item.skill.normalized_name for p in rm2.phases for item in p.items if item.skill
    ]

    assert "linux_diff_test" in user1_item_skills
    assert "linux_diff_test" not in user2_item_skills

def test_roadmap_endpoints(client, app_context):
    """Verify POST /api/roadmap/generate and GET /api/roadmap/<id>."""
    role = CareerRole.query.first()
    assert role is not None

    # Test POST /api/roadmap/generate
    post_res = client.post("/api/roadmap/generate", json={
        "career_role_id": role.id,
        "user_id": 1,
        "available_time": "15 hours/week"
    })
    assert post_res.status_code == 201
    data = post_res.get_json()
    assert "roadmap" in data
    roadmap_id = data["roadmap"]["id"]

    # Test GET /api/roadmap/<id>
    get_res = client.get(f"/api/roadmap/{roadmap_id}")
    assert get_res.status_code == 200
    rm_data = get_res.get_json()
    assert rm_data["id"] == roadmap_id
    assert len(rm_data["phases"]) >= 1

    # Test GET /api/roadmap (user history)
    list_res = client.get("/api/roadmap?user_id=1")
    assert list_res.status_code == 200
    assert len(list_res.get_json()) >= 1

    # Test 404 on nonexistent roadmap
    not_found_res = client.get("/api/roadmap/999999")
    assert not_found_res.status_code == 404
