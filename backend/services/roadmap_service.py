"""Roadmap service coordinating generation, persistence, and retrieval (Phase 11 / Sections 10, 30-33, 43, 48)."""
import logging
from typing import Optional, List, Dict, Any
from backend.extensions import db
from backend.models.career import CareerRole
from backend.models.user import User, UserSkill
from backend.models.skill import Skill
from backend.models.analysis import Analysis
from backend.models.roadmap import (
    Roadmap,
    RoadmapPhase,
    RoadmapItem,
    Project,
    RoadmapProject,
)
from backend.services.analysis_service import AnalysisService
from backend.services.profile_service import ProfileService
from backend.ai.roadmap_generator import RoadmapGenerator
from backend.utils.normalization import normalize_skill_name

logger = logging.getLogger(__name__)

class RoadmapService:
    @staticmethod
    def generate_and_save_roadmap(
        career_role_id: int,
        user_id: int = 1,
        analysis_id: Optional[int] = None,
        available_time: Optional[str] = "10-15 hours/week"
    ) -> Roadmap:
        """Generate a personalized career roadmap and persist all phases, items, and projects into the database."""
        # 1. Fetch Career Role
        career = db.session.get(CareerRole, career_role_id)
        if not career:
            raise ValueError(f"Career role {career_role_id} not found.")

        # 2. Ensure User exists and fetch user skills
        user = ProfileService.get_or_create_default_user(user_id=user_id)
        user_skills_list = UserSkill.query.filter_by(user_id=user_id).all()
        user_skills_map = {us.skill_id: us.proficiency for us in user_skills_list}
        user_skills_serialized = [us.to_dict() for us in user_skills_list]

        # 3. Fetch Market Demand & Calculate Gaps
        frequencies = AnalysisService.calculate_skill_frequencies(career_role_id=career_role_id)
        gaps = AnalysisService.calculate_skill_gaps(frequencies, user_skills_map)

        # 4. Generate structured roadmap via AI
        generated = RoadmapGenerator.generate_roadmap(
            target_career=career.name,
            market_frequencies=frequencies,
            user_skills=user_skills_serialized,
            gaps=gaps,
            available_time=available_time
        )

        # 5. Persist Roadmap
        roadmap = Roadmap(
            user_id=user_id,
            career_role_id=career_role_id,
            analysis_id=analysis_id,
            title=generated.title,
            summary=generated.summary,
        )
        db.session.add(roadmap)
        db.session.flush()

        # Cache existing skills for linking
        all_skills = Skill.query.all()
        skill_by_norm = {s.normalized_name: s.id for s in all_skills}
        skill_by_name_lower = {s.name.lower(): s.id for s in all_skills}

        # 6. Persist Phases and Items
        for phase_schema in generated.phases:
            phase = RoadmapPhase(
                roadmap_id=roadmap.id,
                phase_number=phase_schema.phase_number,
                title=phase_schema.title,
                estimated_duration=phase_schema.estimated_duration,
            )
            db.session.add(phase)
            db.session.flush()

            # Add Items
            for item_schema in phase_schema.items:
                # Resolve skill_id
                norm = normalize_skill_name(item_schema.skill_name)
                matched_skill_id = skill_by_norm.get(norm) or skill_by_name_lower.get(item_schema.skill_name.lower())

                item = RoadmapItem(
                    phase_id=phase.id,
                    skill_id=matched_skill_id,
                    title=item_schema.title,
                    description=item_schema.description,
                    importance_reason=item_schema.importance_reason,
                    estimated_hours=item_schema.estimated_hours,
                )
                db.session.add(item)

            # Add Project if present
            if phase_schema.project:
                proj_schema = phase_schema.project
                project = Project(
                    title=proj_schema.title,
                    description=proj_schema.description,
                    difficulty=proj_schema.difficulty if proj_schema.difficulty in ["beginner", "intermediate", "advanced"] else "intermediate"
                )
                db.session.add(project)
                db.session.flush()

                # Link project to roadmap and phase
                roadmap_proj = RoadmapProject(
                    roadmap_id=roadmap.id,
                    project_id=project.id,
                    phase_id=phase.id,
                )
                db.session.add(roadmap_proj)

        db.session.commit()
        return roadmap

    @staticmethod
    def get_roadmap_by_id(roadmap_id: int) -> Optional[Roadmap]:
        """Fetch a complete roadmap record by ID."""
        return db.session.get(Roadmap, roadmap_id)

    @staticmethod
    def list_user_roadmaps(user_id: int = 1, limit: int = 10) -> List[Roadmap]:
        """List historical generated roadmaps for a user."""
        return (
            Roadmap.query.filter_by(user_id=user_id)
            .order_by(Roadmap.id.desc())
            .limit(limit)
            .all()
        )
