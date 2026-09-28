"""Roadmap routes (Phase 11 / Sections 10, 43, 48)."""
from flask import Blueprint, jsonify, request
from backend.services.roadmap_service import RoadmapService

from backend.schemas.roadmap import RoadmapGenerateRequest

roadmap_bp = Blueprint("roadmap", __name__, url_prefix="/api/roadmap")

@roadmap_bp.route("/generate", methods=["POST"])
def generate_roadmap():
    """Generate a personalized learning roadmap based on target career and deterministic skill gaps with Pydantic validation."""
    payload = request.get_json() or {}
    req = RoadmapGenerateRequest(**payload)

    try:
        roadmap = RoadmapService.generate_and_save_roadmap(
            career_role_id=req.career_role_id,
            user_id=req.user_id or 1,
            analysis_id=req.analysis_id,
            available_time=req.available_time or "10-15 hours/week"
        )
        return jsonify({
            "message": "Personalized career roadmap generated successfully",
            "roadmap": roadmap.to_dict()
        }), 201
    except ValueError as val_err:
        return jsonify({"error": "NOT_FOUND", "message": str(val_err)}), 404
    except Exception as exc:
        return jsonify({"error": "GENERATION_ERROR", "message": str(exc)}), 500

@roadmap_bp.route("/<int:roadmap_id>", methods=["GET"])
def get_roadmap(roadmap_id):
    """Retrieve detailed roadmap with phases, items, and recommended projects."""
    roadmap = RoadmapService.get_roadmap_by_id(roadmap_id)
    if not roadmap:
        return jsonify({"error": "NOT_FOUND", "message": f"Roadmap {roadmap_id} not found"}), 404
    return jsonify(roadmap.to_dict()), 200

@roadmap_bp.route("", methods=["GET"])
def list_roadmaps():
    """List historical roadmaps for a user."""
    user_id = request.args.get("user_id", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    roadmaps = RoadmapService.list_user_roadmaps(user_id=user_id, limit=limit)
    return jsonify([r.to_dict() for r in roadmaps]), 200

@roadmap_bp.route("/user/<int:user_id>", methods=["GET"])
def list_user_roadmaps_legacy(user_id):
    """List all roadmaps for a user (legacy path)."""
    roadmaps = RoadmapService.list_user_roadmaps(user_id=user_id)
    return jsonify([r.to_dict() for r in roadmaps]), 200
