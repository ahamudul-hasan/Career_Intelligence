"""Career taxonomy service."""
from typing import List, Optional
from sqlalchemy import or_
from backend.extensions import db
from backend.models.career import CareerRole

class CareerService:
    @staticmethod
    def get_all_careers(category: Optional[str] = None, search: Optional[str] = None) -> List[CareerRole]:
        """Fetch career roles ordered by category and name with optional category & keyword filtering."""
        query = CareerRole.query

        if category:
            query = query.filter(CareerRole.category.ilike(f"%{category.strip()}%"))

        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    CareerRole.name.ilike(term),
                    CareerRole.description.ilike(term),
                    CareerRole.category.ilike(term)
                )
            )

        return query.order_by(CareerRole.category, CareerRole.name).all()

    @staticmethod
    def get_career_by_id(career_id: int) -> Optional[CareerRole]:
        """Fetch a specific career role by its primary key ID using SQLAlchemy 2.0 session.get."""
        return db.session.get(CareerRole, career_id)

    @staticmethod
    def get_categories() -> List[str]:
        """Fetch list of distinct career categories."""
        results = db.session.query(CareerRole.category).distinct().order_by(CareerRole.category).all()
        return [r[0] for r in results if r[0]]
