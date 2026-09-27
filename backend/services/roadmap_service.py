"""Roadmap and project services."""
from typing import List, Optional
from backend.extensions import db
from backend.models.roadmap import Roadmap, RoadmapPhase, RoadmapItem, Project

class RoadmapService:
    @staticmethod
    def get_user_roadmaps(user_id: int) -> List[Roadmap]:
        """Fetch all roadmaps generated for a user."""
        return Roadmap.query.filter_by(user_id=user_id).order_by(Roadmap.id.desc()).all()

    @staticmethod
    def get_roadmap_by_id(roadmap_id: int) -> Optional[Roadmap]:
        """Fetch a specific roadmap with its phases and items."""
        return Roadmap.query.get(roadmap_id)

    @staticmethod
    def get_all_projects() -> List[Project]:
        """Fetch all recommended projects."""
        return Project.query.order_by(Project.id.desc()).all()
