"""User skill profile service (Phase 9 / Sections 8, 28, 41)."""
from typing import List, Optional, Dict, Any
from backend.extensions import db
from backend.models.user import User, UserSkill
from backend.models.skill import Skill
from backend.utils.normalization import normalize_skill_name, get_canonical_skill_display, canonicalize_skill

PROFICIENCY_LEVELS = {
    0: "None / Exploring",
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert"
}

class ProfileService:
    @staticmethod
    def get_or_create_default_user(user_id: int = 1, name: str = "Alex Developer", email: str = "alex.dev@example.com") -> User:
        """Fetch active user or initialize the default profile user."""
        user = db.session.get(User, user_id)
        if not user:
            user = User(
                id=user_id,
                name=name,
                email=email
            )
            db.session.add(user)
            db.session.commit()
        return user

    @staticmethod
    def get_profile(user_id: int = 1) -> User:
        """Fetch user profile with skills."""
        user = ProfileService.get_or_create_default_user(user_id=user_id)
        return user

    @staticmethod
    def update_profile(user_id: int = 1, name: Optional[str] = None, email: Optional[str] = None, password: Optional[str] = None) -> User:
        """Update user profile metadata with secure password hashing."""
        user = ProfileService.get_or_create_default_user(user_id=user_id)
        if name:
            user.name = name.strip()
        if email:
            user.email = email.strip().lower()
        if password:
            user.set_password(password)
        db.session.commit()
        return user

    @staticmethod
    def get_user_skills(user_id: int = 1) -> List[UserSkill]:
        """Fetch all skills in the user's personal profile sorted by proficiency and name."""
        ProfileService.get_or_create_default_user(user_id=user_id)
        return (
            UserSkill.query.filter_by(user_id=user_id)
            .join(Skill, UserSkill.skill_id == Skill.id)
            .order_by(UserSkill.proficiency.desc(), Skill.name.asc())
            .all()
        )

    @staticmethod
    def add_or_update_user_skill(
        user_id: int = 1,
        skill_id: Optional[int] = None,
        skill_name: Optional[str] = None,
        proficiency: int = 0
    ) -> UserSkill:
        """Add or update a skill in the user's profile with proficiency 0-4."""
        # Ensure user exists
        ProfileService.get_or_create_default_user(user_id=user_id)

        # Validate proficiency
        try:
            proficiency = int(proficiency)
        except (ValueError, TypeError):
            raise ValueError("Proficiency must be an integer between 0 and 4.")

        if proficiency < 0 or proficiency > 4:
            raise ValueError("Proficiency level must be between 0 (None) and 4 (Expert).")

        target_skill: Optional[Skill] = None

        if skill_id:
            target_skill = db.session.get(Skill, skill_id)
            if not target_skill:
                raise ValueError(f"Skill with id {skill_id} does not exist.")
        elif skill_name and skill_name.strip():
            raw_name = skill_name.strip()
            norm_key = normalize_skill_name(raw_name)

            # Check if skill exists by normalized_name or name
            target_skill = Skill.query.filter(
                (Skill.normalized_name == norm_key) | (Skill.name.ilike(raw_name))
            ).first()

            if not target_skill:
                # Create canonical skill
                display_name, norm_key, category = canonicalize_skill(raw_name)
                target_skill = Skill(
                    name=display_name,
                    normalized_name=norm_key,
                    category=category
                )
                db.session.add(target_skill)
                db.session.flush()
        else:
            raise ValueError("Either skill_id or skill_name must be provided.")

        # Check existing user skill
        user_skill = UserSkill.query.filter_by(user_id=user_id, skill_id=target_skill.id).first()
        if user_skill:
            user_skill.proficiency = proficiency
        else:
            user_skill = UserSkill(
                user_id=user_id,
                skill_id=target_skill.id,
                proficiency=proficiency
            )
            db.session.add(user_skill)

        db.session.commit()
        return user_skill

    @staticmethod
    def update_user_skill_proficiency(user_id: int, skill_id: int, proficiency: int) -> UserSkill:
        """Update proficiency for a specific user skill."""
        try:
            proficiency = int(proficiency)
        except (ValueError, TypeError):
            raise ValueError("Proficiency must be an integer between 0 and 4.")

        if proficiency < 0 or proficiency > 4:
            raise ValueError("Proficiency level must be between 0 (None) and 4 (Expert).")

        user_skill = UserSkill.query.filter_by(user_id=user_id, skill_id=skill_id).first()
        if not user_skill:
            raise ValueError(f"Skill {skill_id} not found in user's profile.")

        user_skill.proficiency = proficiency
        db.session.commit()
        return user_skill

    @staticmethod
    def remove_user_skill(user_id: int, skill_id: int) -> bool:
        """Remove a skill from the user's profile."""
        user_skill = UserSkill.query.filter_by(user_id=user_id, skill_id=skill_id).first()
        if not user_skill:
            raise ValueError(f"Skill {skill_id} not found in user's profile.")

        db.session.delete(user_skill)
        db.session.commit()
        return True

    @staticmethod
    def clear_user_skills(user_id: int) -> int:
        """Clear all skills for a user."""
        count = UserSkill.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        return count
