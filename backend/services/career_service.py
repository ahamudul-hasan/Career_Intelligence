"""Career taxonomy service."""
from typing import List, Optional
from backend.extensions import db
from backend.models.career import CareerRole

class CareerService:
    @staticmethod
    def get_all_careers() -> List[CareerRole]:
        """Fetch all available career roles ordered by category and name."""
        return CareerRole.query.order_by(CareerRole.category, CareerRole.name).all()

    @staticmethod
    def get_career_by_id(career_id: int) -> Optional[CareerRole]:
        """Fetch a specific career role by its primary key ID."""
        return CareerRole.query.get(career_id)
