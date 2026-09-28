"""Recommended projects routes (Phase 12 / Sections 45, 33)."""
from flask import Blueprint, jsonify, request
from backend.services.roadmap_service import RoadmapService

from backend.schemas.roadmap import ProjectRecommendationRequest

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")

@projects_bp.route("", methods=["GET"])
def list_projects():
    """List all project recommendations with optional filters."""
    career_role_id = request.args.get("career_role_id", type=int)
    roadmap_id = request.args.get("roadmap_id", type=int)
    difficulty = request.args.get("difficulty", type=str)
    limit = request.args.get("limit", default=50, type=int)

    projects = RoadmapService.get_all_projects(
        career_role_id=career_role_id,
        roadmap_id=roadmap_id,
        difficulty=difficulty,
        limit=limit
    )
    return jsonify([p.to_dict() for p in projects]), 200

@projects_bp.route("/<int:project_id>", methods=["GET"])
def get_project(project_id: int):
    """Retrieve details for a single project recommendation."""
    project = RoadmapService.get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "NOT_FOUND", "message": f"Project {project_id} not found"}), 404
    return jsonify(project.to_dict()), 200

@projects_bp.route("/recommend", methods=["POST"])
def recommend_projects():
    """On-demand generation of portfolio project suggestions bridging identified skill gaps with Pydantic validation."""
    data = request.get_json() or {}
    req = ProjectRecommendationRequest(**data)

    if not req.career_role_id:
        return jsonify({"error": "VALIDATION_ERROR", "message": "career_role_id is required"}), 400

    try:
        suggestions = RoadmapService.recommend_projects_for_gaps(
            career_role_id=req.career_role_id,
            user_id=req.user_id or 1,
            desired_difficulty=req.difficulty
        )
        return jsonify({"projects": suggestions, "count": len(suggestions)}), 200
    except Exception as e:
        return jsonify({"error": "GENERATION_ERROR", "message": str(e)}), 500
