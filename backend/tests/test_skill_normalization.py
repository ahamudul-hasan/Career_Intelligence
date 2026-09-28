"""Unit and integration tests for Phase 7 Skill Normalization and Alias Resolution (Sections 20, 26)."""
import pytest
from backend.app import create_app
from backend.extensions import db
from backend.models.skill import Skill, JobSkill
from backend.services.skill_service import SkillService
from backend.utils.normalization import (
    normalize_skill_name,
    get_canonical_skill_display,
    canonicalize_skill
)

@pytest.fixture
def app_ctx():
    app = create_app()
    app.config["TESTING"] = True
    with app.app_context():
        yield app

def test_string_alias_normalization():
    """Verify alias dictionary normalizes common variants to canonical keys (Section 20)."""
    # PostgreSQL variations
    assert normalize_skill_name("Postgres") == "postgresql"
    assert normalize_skill_name("PostgreSQL") == "postgresql"
    assert normalize_skill_name("PostgreSQL DB") == "postgresql"
    assert normalize_skill_name("postgres db") == "postgresql"
    assert normalize_skill_name("psql") == "postgresql"

    # React variations
    assert normalize_skill_name("React") == "react"
    assert normalize_skill_name("React.js") == "react"
    assert normalize_skill_name("ReactJS") == "react"
    assert normalize_skill_name("react js") == "react"

    # Node variations
    assert normalize_skill_name("Node") == "nodejs"
    assert normalize_skill_name("Node.js") == "nodejs"
    assert normalize_skill_name("NodeJS") == "nodejs"
    assert normalize_skill_name("node js") == "nodejs"

    # Go / Golang variations
    assert normalize_skill_name("Go") == "go"
    assert normalize_skill_name("Golang") == "go"
    assert normalize_skill_name("go lang") == "go"

    # Kubernetes variations
    assert normalize_skill_name("Kubernetes") == "kubernetes"
    assert normalize_skill_name("k8s") == "kubernetes"

    # Cloud & DevOps variations
    assert normalize_skill_name("AWS") == "aws"
    assert normalize_skill_name("Amazon Web Services") == "aws"
    assert normalize_skill_name("Docker container") == "docker"
    assert normalize_skill_name("CI/CD") == "ci/cd"
    assert normalize_skill_name("CICD") == "ci/cd"
    assert normalize_skill_name("Continuous Integration") == "ci/cd"

def test_canonical_display_formatting():
    """Verify canonical display name helper returns properly capitalized names."""
    assert get_canonical_skill_display("postgres") == "PostgreSQL"
    assert get_canonical_skill_display("postgresql db") == "PostgreSQL"
    assert get_canonical_skill_display("reactjs") == "React"
    assert get_canonical_skill_display("node") == "Node.js"
    assert get_canonical_skill_display("golang") == "Go"
    assert get_canonical_skill_display("k8s") == "Kubernetes"
    assert get_canonical_skill_display("aws") == "AWS"
    assert get_canonical_skill_display("restful api") == "REST APIs"

def test_postgres_aliases_collapse_into_single_skills_row(app_ctx):
    """Phase 7 Acceptance Criterion:
    'Postgres', 'PostgreSQL', and 'PostgreSQL DB' all collapse into a single skills row.
    """
    # 1. Fetch or create with "Postgres"
    skill1 = SkillService.get_or_create_skill("Postgres", category="Database")
    assert skill1.normalized_name == "postgresql"

    # 2. Fetch or create with "PostgreSQL"
    skill2 = SkillService.get_or_create_skill("PostgreSQL", category="Databases")

    # 3. Fetch or create with "PostgreSQL DB"
    skill3 = SkillService.get_or_create_skill("PostgreSQL DB", category="Database")

    # Verify all 3 point to the exact same database record ID
    assert skill1.id == skill2.id
    assert skill2.id == skill3.id

    # Verify database query returns exactly 1 row for normalized_name == 'postgresql'
    matching_skills = Skill.query.filter_by(normalized_name="postgresql").all()
    assert len(matching_skills) == 1
    assert matching_skills[0].id == skill1.id
    assert matching_skills[0].normalized_name == "postgresql"

def test_react_and_node_collapse_into_single_skills_row(app_ctx):
    """Verify React and Node variations each collapse into exactly one skills row."""
    # React collapse
    r1 = SkillService.get_or_create_skill("React", category="Framework")
    r2 = SkillService.get_or_create_skill("React.js", category="Framework")
    r3 = SkillService.get_or_create_skill("ReactJS", category="Framework")
    assert r1.id == r2.id == r3.id
    assert r1.normalized_name == "react"

    matching_react = Skill.query.filter_by(normalized_name="react").all()
    assert len(matching_react) == 1

    # Node.js collapse
    n1 = SkillService.get_or_create_skill("Node", category="Framework")
    n2 = SkillService.get_or_create_skill("Node.js", category="Framework")
    n3 = SkillService.get_or_create_skill("NodeJS", category="Framework")
    assert n1.id == n2.id == n3.id
    assert n1.normalized_name == "nodejs"

    matching_node = Skill.query.filter_by(normalized_name="nodejs").all()
    assert len(matching_node) == 1

def test_golang_and_k8s_collapse(app_ctx):
    """Verify Golang and K8s aliases collapse."""
    g1 = SkillService.get_or_create_skill("Go", category="Language")
    g2 = SkillService.get_or_create_skill("Golang", category="Language")
    assert g1.id == g2.id
    assert g1.normalized_name == "go"

    k1 = SkillService.get_or_create_skill("Kubernetes", category="Tool")
    k2 = SkillService.get_or_create_skill("k8s", category="Tool")
    assert k1.id == k2.id
    assert k1.normalized_name == "kubernetes"
