"""Career taxonomy routes."""
from flask import Blueprint, jsonify, request
from backend.services.career_service import CareerService

careers_bp = Blueprint("careers", __name__, url_prefix="/api/careers")

@careers_bp.route("", methods=["GET"])
def list_careers():
    """List all supported career roles with optional ?category= and ?search= filtering."""
    category = request.args.get("category", type=str)
    search = request.args.get("search", type=str)
    roles = CareerService.get_all_careers(category=category, search=search)
    return jsonify([role.to_dict() for role in roles]), 200

@careers_bp.route("/categories", methods=["GET"])
def list_categories():
    """List all distinct career categories."""
    categories = CareerService.get_categories()
    return jsonify(categories), 200

@careers_bp.route("/<int:career_id>", methods=["GET"])
def get_career(career_id):
    """Retrieve details for a specific career role."""
    role = CareerService.get_career_by_id(career_id)
    if not role:
        return jsonify({"error": "NOT_FOUND", "message": f"Career role {career_id} not found"}), 404
    return jsonify(role.to_dict()), 200
