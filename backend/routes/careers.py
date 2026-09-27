"""Career taxonomy routes."""
from flask import Blueprint, jsonify
from backend.models.career import CareerRole

careers_bp = Blueprint("careers", __name__, url_prefix="/api/careers")

@careers_bp.route("", methods=["GET"])
def list_careers():
    """List all supported career roles."""
    roles = CareerRole.query.order_by(CareerRole.category, CareerRole.name).all()
    return jsonify([role.to_dict() for role in roles]), 200

@careers_bp.route("/<int:career_id>", methods=["GET"])
def get_career(career_id):
    """Retrieve details for a specific career role."""
    role = CareerRole.query.get(career_id)
    if not role:
        return jsonify({"error": "NOT_FOUND", "message": f"Career role {career_id} not found"}), 404
    return jsonify(role.to_dict()), 200
