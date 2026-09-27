"""Skill service for retrieving skills and normalizing aliases."""
from typing import List, Optional
from backend.extensions import db
from backend.models.skill import Skill
from backend.utils.normalization import normalize_skill_name

class SkillService:
    @staticmethod
    def get_all_skills() -> List[Skill]:
        """Fetch all canonical skills."""
        return Skill.query.order_by(Skill.name).all()

    @staticmethod
    def get_or_create_skill(name: str, category: Optional[str] = None) -> Skill:
        """Find existing skill by normalized name or create a new canonical entry."""
        normalized = normalize_skill_name(name)
        skill = Skill.query.filter_by(normalized_name=normalized).first()
        if not skill:
            skill = Skill(name=name.strip(), normalized_name=normalized, category=category)
            db.session.add(skill)
            db.session.commit()
        return skill
