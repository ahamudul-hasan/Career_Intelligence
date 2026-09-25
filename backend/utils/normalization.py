# Skill normalization utilities stub

SKILL_ALIASES = {
    "postgres": "postgresql",
    "postgresql db": "postgresql",
    "react.js": "react",
    "reactjs": "react",
    "node": "node.js",
    "nodejs": "node.js",
    "golang": "go",
}

def normalize_skill_name(name: str) -> str:
    """Normalize skill name using lowercasing and alias dictionary."""
    if not name:
        return ""
    clean = name.strip().lower()
    return SKILL_ALIASES.get(clean, clean)
