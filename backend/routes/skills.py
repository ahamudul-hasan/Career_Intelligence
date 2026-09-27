"""Skills and market frequency routes."""
from flask import Blueprint, jsonify, request
from backend.models.skill import Skill
from backend.services.analysis_service import AnalysisService

skills_bp = Blueprint("skills", __name__, url_prefix="/api/skills")

@skills_bp.route("", methods=["GET"])
def list_skills():
    """List canonical skills."""
    skills = Skill.query.order_by(Skill.name).all()
    return jsonify([s.to_dict() for s in skills]), 200

@skills_bp.route("/top", methods=["GET"])
def get_top_skills():
    """Get top skills by frequency for a career_role_id."""
    career_role_id = request.args.get("career_role_id", type=int)
    if not career_role_id:
        return jsonify({"error": "VALIDATION_ERROR", "message": "career_role_id query parameter is required"}), 400

    frequencies = AnalysisService.calculate_skill_frequencies(career_role_id)
    return jsonify(frequencies), 200
