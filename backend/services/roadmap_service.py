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
from backend.ai.project_recommender import ProjectRecommender
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
                    difficulty=proj_schema.difficulty if proj_schema.difficulty in ["beginner", "intermediate", "advanced"] else "intermediate",
                    skills_demonstrated=proj_schema.skills_demonstrated or [],
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

        # Section 45 / Phase 12 Guardrail: Ensure EVERY high-priority gap has at least one concrete project attached
        high_gaps = [g for g in gaps if g.get("gap_priority", "").upper() == "HIGH"]
        covered_skills = set()
        for rp in roadmap.roadmap_projects:
            if rp.project and rp.project.skills_demonstrated:
                for s in rp.project.skills_demonstrated:
                    covered_skills.add(s.lower())

        first_phase = roadmap.phases[0] if roadmap.phases else None

        for gap in high_gaps:
            s_name = gap.get("skill_name", "")
            if s_name.lower() not in covered_skills:
                # Find the phase containing this skill, or attach to first phase
                target_phase = first_phase
                for p in roadmap.phases:
                    if any(item.skill and item.skill.name.lower() == s_name.lower() for item in p.items):
                        target_phase = p
                        break

                proj_suggestion = ProjectRecommender._build_single_project_for_skill(
                    skill_name=s_name,
                    target_career=career.name,
                    difficulty="intermediate"
                )
                gap_project = Project(
                    title=proj_suggestion.title,
                    description=proj_suggestion.description,
                    difficulty=proj_suggestion.difficulty,
                    skills_demonstrated=proj_suggestion.skills_demonstrated,
                )
                db.session.add(gap_project)
                db.session.flush()

                rp_gap = RoadmapProject(
                    roadmap_id=roadmap.id,
                    project_id=gap_project.id,
                    phase_id=target_phase.id if target_phase else None,
                )
                db.session.add(rp_gap)
                covered_skills.add(s_name.lower())

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

    @staticmethod
    def get_all_projects(
        career_role_id: Optional[int] = None,
        roadmap_id: Optional[int] = None,
        difficulty: Optional[str] = None,
        limit: int = 50
    ) -> List[Project]:
        """Query projects with optional filtering by career, roadmap, and difficulty."""
        query = Project.query
        if roadmap_id:
            query = query.join(RoadmapProject, Project.id == RoadmapProject.project_id).filter(
                RoadmapProject.roadmap_id == roadmap_id
            )
        elif career_role_id:
            query = query.join(RoadmapProject, Project.id == RoadmapProject.project_id).join(
                Roadmap, RoadmapProject.roadmap_id == Roadmap.id
            ).filter(Roadmap.career_role_id == career_role_id)

        if difficulty:
            query = query.filter(Project.difficulty == difficulty)

        return query.order_by(Project.id.desc()).limit(limit).all()

    @staticmethod
    def get_project_by_id(project_id: int) -> Optional[Project]:
        """Retrieve a single project by ID."""
        return db.session.get(Project, project_id)

    @staticmethod
    def recommend_projects_for_gaps(
        career_role_id: int,
        user_id: int = 1,
        desired_difficulty: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate high-impact portfolio project recommendations targeting skill gaps on demand."""
        career = db.session.get(CareerRole, career_role_id)
        career_name = career.name if career else "Software Engineer"

        user_skills_list = UserSkill.query.filter_by(user_id=user_id).all()
        user_skills_map = {us.skill_id: us.proficiency for us in user_skills_list}

        frequencies = AnalysisService.calculate_skill_frequencies(career_role_id=career_role_id)
        gaps = AnalysisService.calculate_skill_gaps(frequencies, user_skills_map)

        suggestions = ProjectRecommender.recommend_projects_for_gaps(
            target_career=career_name,
            gaps=gaps,
            user_skills=[us.to_dict() for us in user_skills_list],
            desired_difficulty=desired_difficulty
        )

        return [s.to_dict() for s in suggestions]
