"""Unit and integration tests for Skill Gap Engine (Phase 10 / Sections 9, 50, 42)."""
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.user import User, UserSkill
from backend.models.career import CareerRole
from backend.models.job import Job
from backend.models.skill import Skill, JobSkill
from backend.models.analysis import Analysis
from backend.services.analysis_service import AnalysisService
from backend.config.settings import GAP_THRESHOLDS

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

def test_deterministic_gap_classification_algorithm():
    """Verify deterministic gap algorithm adheres to GAP_THRESHOLDS."""
    # Mock market frequencies
    mock_market = [
        {"skill_id": 101, "skill_name": "High Demand Skill", "percentage": 80.0, "category": "Core"},
        {"skill_id": 102, "skill_name": "Mid Demand Skill", "percentage": 35.0, "category": "Framework"},
        {"skill_id": 103, "skill_name": "Low Demand Skill", "percentage": 15.0, "category": "Tool"},
        {"skill_id": 104, "skill_name": "Niche Skill", "percentage": 5.0, "category": "Niche"},
    ]

    # User 1: Novice (Proficiency 0 on all)
    user1_map = {101: 0, 102: 0, 103: 0, 104: 0}
    gaps_user1 = AnalysisService.calculate_skill_gaps(mock_market, user1_map)
    gaps_by_id1 = {g["skill_id"]: g for g in gaps_user1}

    # Verify User 1 gap classifications
    assert gaps_by_id1[101]["gap_priority"] == "high"
    assert "80.0%" in gaps_by_id1[101]["explanation"]
    assert gaps_by_id1[102]["gap_priority"] == "medium"
    assert gaps_by_id1[103]["gap_priority"] == "low"
    assert 104 not in gaps_by_id1  # Below 10% threshold

    # User 2: Intermediate (Proficiency 2 on all)
    user2_map = {101: 2, 102: 2, 103: 2, 104: 2}
    gaps_user2 = AnalysisService.calculate_skill_gaps(mock_market, user2_map)
    gaps_by_id2 = {g["skill_id"]: g for g in gaps_user2}

    # Verify User 2 gap classifications:
    # 80% demand + Level 2 -> Medium priority gap (strengthen Intermediate to Advanced)
    assert gaps_by_id2[101]["gap_priority"] == "medium"
    # 35% demand + Level 2 -> Low priority gap
    assert gaps_by_id2[102]["gap_priority"] == "low"
    # 15% demand + Level 2 -> Satisfied (not a gap)
    assert 103 not in gaps_by_id2

    # User 3: Expert (Proficiency 4 on High Demand Skill)
    user3_map = {101: 4, 102: 0, 103: 0}
    gaps_user3 = AnalysisService.calculate_skill_gaps(mock_market, user3_map)
    gaps_by_id3 = {g["skill_id"]: g for g in gaps_user3}
    assert 101 not in gaps_by_id3  # Mastered! No gap

def test_two_users_different_skill_profiles_get_visibly_different_gaps(client, app_context):
    """Section 11 acceptance criterion: Two users with different skill profiles
    against the same market data receive visibly different gap classifications.
    """
    # Create or reuse test role & skills
    role = CareerRole.query.filter_by(name="Gap Test Role").first()
    if not role:
        role = CareerRole(name="Gap Test Role", category="Software Development")
        db.session.add(role)
        db.session.commit()

    sk_python = Skill.query.filter_by(normalized_name="py_gap_test").first()
    if not sk_python:
        sk_python = Skill(name="Python Test Skill", normalized_name="py_gap_test", category="Languages")
        db.session.add(sk_python)

    sk_docker = Skill.query.filter_by(normalized_name="docker_gap_test").first()
    if not sk_docker:
        sk_docker = Skill(name="Docker Test Skill", normalized_name="docker_gap_test", category="DevOps")
        db.session.add(sk_docker)

    db.session.commit()

    # Clear previous test jobs for this role if any
    Job.query.filter_by(career_role_id=role.id).delete()
    db.session.commit()

    # Create 10 test jobs: Python in 8 jobs (80%), Docker in 4 jobs (40%)
    for i in range(10):
        job = Job(
            career_role_id=role.id,
            title=f"Engineer {i}",
            company="Test Corp",
            source="test"
        )
        db.session.add(job)
        db.session.flush()

        if i < 8:
            db.session.add(JobSkill(job_id=job.id, skill_id=sk_python.id, importance="required"))
        if i < 4:
            db.session.add(JobSkill(job_id=job.id, skill_id=sk_docker.id, importance="preferred"))

    db.session.commit()

    # Clear previous analyses for this role
    Analysis.query.filter_by(career_role_id=role.id).delete()
    db.session.commit()

    # Create Analysis snapshot
    analysis = Analysis(
        career_role_id=role.id,
        target_location="All",
        experience_level="All",
        jobs_analyzed=10,
        sources="test"
    )
    db.session.add(analysis)
    db.session.commit()

    # Create or reuse User A: Junior (no skills recorded, proficiency=0)
    user_a = User.query.filter_by(email="junior_gap@test.com").first()
    if not user_a:
        user_a = User(name="Junior Dev", email="junior_gap@test.com")
        db.session.add(user_a)
        db.session.commit()
    UserSkill.query.filter_by(user_id=user_a.id).delete()
    db.session.commit()

    # Create or reuse User B: Senior (Python Expert=4, Docker Intermediate=2)
    user_b = User.query.filter_by(email="senior_gap@test.com").first()
    if not user_b:
        user_b = User(name="Senior Dev", email="senior_gap@test.com")
        db.session.add(user_b)
        db.session.commit()
    UserSkill.query.filter_by(user_id=user_b.id).delete()
    db.session.commit()

    db.session.add_all([
        UserSkill(user_id=user_b.id, skill_id=sk_python.id, proficiency=4),
        UserSkill(user_id=user_b.id, skill_id=sk_docker.id, proficiency=2),
    ])
    db.session.commit()

    # Fetch gaps for User A
    res_a = client.get(f"/api/analysis/{analysis.id}/gaps?user_id={user_a.id}")
    assert res_a.status_code == 200
    gaps_a = res_a.get_json()

    # Fetch gaps for User B
    res_b = client.get(f"/api/analysis/{analysis.id}/gaps?user_id={user_b.id}")
    assert res_b.status_code == 200
    gaps_b = res_b.get_json()

    # Assert visibly different gap results:
    # User A has Python as HIGH priority gap (80% demand, level 0)
    gap_a_python = next((g for g in gaps_a if g["skill_id"] == sk_python.id), None)
    assert gap_a_python is not None
    assert gap_a_python["gap_priority"] == "high"

    # User B has Python as NO gap (level 4 expert), and Docker as LOW gap (40% demand, level 2)
    gap_b_python = next((g for g in gaps_b if g["skill_id"] == sk_python.id), None)
    assert gap_b_python is None  # Zero gap for Expert

    gap_b_docker = next((g for g in gaps_b if g["skill_id"] == sk_docker.id), None)
    assert gap_b_docker is not None
    assert gap_b_docker["gap_priority"] == "low"

def test_get_analysis_gaps_endpoint(client, app_context):
    """Verify GET /api/analysis/<id>/gaps schema and 404 behavior."""
    # 404 on nonexistent analysis
    res_404 = client.get("/api/analysis/99999/gaps")
    assert res_404.status_code == 404

    # Create analysis
    analysis = Analysis.query.first()
    if not analysis:
        role = CareerRole.query.first()
        analysis = Analysis(career_role_id=role.id, jobs_analyzed=5, target_location="All", experience_level="All")
        db.session.add(analysis)
        db.session.commit()

    res = client.get(f"/api/analysis/{analysis.id}/gaps?user_id=1")
    assert res.status_code == 200
    data = res.get_json()
    assert isinstance(data, list)
    if len(data) > 0:
        gap = data[0]
        assert "skill_id" in gap
        assert "skill_name" in gap
        assert "gap_priority" in gap
        assert gap["gap_priority"] in ["high", "medium", "low"]
        assert "market_frequency" in gap
        assert "user_proficiency" in gap
        assert "explanation" in gap
