"""Skill normalization and alias resolution utilities (Phase 7 / Sections 20, 26)."""
import re
from typing import Optional, Tuple

# Comprehensive alias dictionary mapping variations, abbreviations, and informal names to canonical keys (Section 20)
SKILL_ALIASES = {
    # Relational & NoSQL Databases
    "postgres": "postgresql",
    "postgresql db": "postgresql",
    "postgres db": "postgresql",
    "postgresql database": "postgresql",
    "postgres database": "postgresql",
    "psql": "postgresql",
    "mysql db": "mysql",
    "mysql database": "mysql",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "mongodb database": "mongodb",
    "redis cache": "redis",
    "redis db": "redis",
    "dynamo": "dynamodb",
    "dynamo db": "dynamodb",
    "amazon dynamodb": "dynamodb",
    "snowflake data warehouse": "snowflake",
    "elastic": "elasticsearch",
    "elastic search": "elasticsearch",

    # Programming Languages
    "python3": "python",
    "python 3": "python",
    "python 3.x": "python",
    "golang": "go",
    "go lang": "go",
    "go language": "go",
    "js": "javascript",
    "ecmascript": "javascript",
    "ts": "typescript",
    "cpp": "c++",
    "c plus plus": "c++",
    "c/c++": "c++",
    "csharp": "c#",
    "c sharp": "c#",
    "c#.net": "c#",
    ".net c#": "c#",

    # Frontend Frameworks & Libraries
    "react": "react",
    "react.js": "react",
    "reactjs": "react",
    "react js": "react",
    "react.js library": "react",
    "next": "next.js",
    "nextjs": "next.js",
    "next.js framework": "next.js",
    "vue": "vue.js",
    "vuejs": "vue.js",
    "vue.js framework": "vue.js",
    "angular": "angular",
    "angular.js": "angular",
    "angularjs": "angular",
    "angular 2+": "angular",

    # Backend Frameworks & Runtimes
    "node": "nodejs",
    "nodejs": "nodejs",
    "node.js": "nodejs",
    "node js": "nodejs",
    "express": "express",
    "express.js": "express",
    "expressjs": "express",
    "fast-api": "fastapi",
    "fast api": "fastapi",
    "django rest framework": "django",
    "drf": "django",
    "spring": "spring boot",
    "springboot": "spring boot",
    "spring-boot": "spring boot",

    # Cloud & DevOps Infrastructure
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "docker container": "docker",
    "docker containers": "docker",
    "docker engine": "docker",
    "aws": "aws",
    "aws cloud": "aws",
    "amazon web services": "aws",
    "amazon aws": "aws",
    "gcp": "gcp",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "azure": "azure",
    "azure cloud": "azure",
    "microsoft azure": "azure",
    "terraform by hashicorp": "terraform",

    # Architecture & Methodologies
    "rest": "rest apis",
    "rest api": "rest apis",
    "rest apis": "rest apis",
    "restful": "rest apis",
    "restful api": "rest apis",
    "restful apis": "rest apis",
    "restful services": "rest apis",
    "graphql api": "graphql",
    "graphql apis": "graphql",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "ci / cd": "ci/cd",
    "ci-cd": "ci/cd",
    "continuous integration": "ci/cd",
    "continuous delivery": "ci/cd",
    "continuous integration / continuous deployment": "ci/cd",
    "microservices": "microservices",
    "micro-services": "microservices",
    "micro services": "microservices",
    "microservice architecture": "microservices",
    "distributed systems": "distributed systems",
    "system design": "system design",
    "agile methodology": "agile",
    "scrum methodology": "scrum",
    "git version control": "git",
    "github actions": "github actions",
}

# Canonical proper casing and formatting for display in UI and database
CANONICAL_DISPLAY_NAMES = {
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "dynamodb": "DynamoDB",
    "snowflake": "Snowflake",
    "elasticsearch": "Elasticsearch",
    "sqlite": "SQLite",
    "python": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "go": "Go",
    "java": "Java",
    "c++": "C++",
    "c#": "C#",
    "rust": "Rust",
    "ruby": "Ruby",
    "php": "PHP",
    "sql": "SQL",
    "html": "HTML",
    "css": "CSS",
    "react": "React",
    "next.js": "Next.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "spring boot": "Spring Boot",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "gcp": "GCP",
    "azure": "Azure",
    "terraform": "Terraform",
    "git": "Git",
    "github": "GitHub",
    "github actions": "GitHub Actions",
    "rest apis": "REST APIs",
    "graphql": "GraphQL",
    "ci/cd": "CI/CD",
    "microservices": "Microservices",
    "distributed systems": "Distributed Systems",
    "system design": "System Design",
    "agile": "Agile",
    "scrum": "Scrum",
}

def normalize_skill_name(name: str) -> str:
    """Normalize skill name:
    1. Strip whitespace and non-alphanumeric edges (preserving symbols like +, #, .)
    2. Lowercase string
    3. Collapse internal whitespace
    4. Resolve against SKILL_ALIASES dictionary
    """
    if not name:
        return ""

    # Clean whitespace and normalize case
    clean = re.sub(r"\s+", " ", name.strip()).lower()

    # Strip surrounding quotes or parentheses
    clean = clean.strip("'\"()[]{}")

    # Match against alias table
    return SKILL_ALIASES.get(clean, clean)

def get_canonical_skill_display(name: str) -> str:
    """Return standard casing and formatting for a skill name."""
    if not name:
        return ""

    normalized = normalize_skill_name(name)
    if normalized in CANONICAL_DISPLAY_NAMES:
        return CANONICAL_DISPLAY_NAMES[normalized]

    # If title-case looks reasonable
    clean_name = name.strip().strip("'\"()[]{}")
    return clean_name

def canonicalize_skill(raw_name: str, raw_category: Optional[str] = None) -> Tuple[str, str, str]:
    """Return standard tuple of (canonical_display_name, normalized_key, category)."""
    normalized = normalize_skill_name(raw_name)
    display_name = get_canonical_skill_display(raw_name)
    category = raw_category or "Technical"
    return display_name, normalized, category
