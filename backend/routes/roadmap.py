"""Roadmap routes."""
from flask import Blueprint, jsonify, request
from backend.models.roadmap import Roadmap
from backend.services.roadmap_service import RoadmapService

roadmap_bp = Blueprint("roadmap", __name__, url_prefix="/api/roadmap")

@roadmap_bp.route("/<int:roadmap_id>", methods=["GET"])
def get_roadmap(roadmap_id):
    """Retrieve detailed roadmap with phases and items."""
    roadmap = RoadmapService.get_roadmap_by_id(roadmap_id)
    if not roadmap:
        return jsonify({"error": "NOT_FOUND", "message": f"Roadmap {roadmap_id} not found"}), 404
    return jsonify(roadmap.to_dict()), 200

@roadmap_bp.route("/user/<int:user_id>", methods=["GET"])
def list_user_roadmaps(user_id):
    """List all roadmaps for a user."""
    roadmaps = RoadmapService.get_user_roadmaps(user_id)
    return jsonify([r.to_dict() for r in roadmaps]), 200
