"""Market analysis and skill gap routes."""
from flask import Blueprint, jsonify, request
from backend.models.analysis import Analysis
from backend.models.user import UserSkill
from backend.services.analysis_service import AnalysisService

analysis_bp = Blueprint("analysis", __name__, url_prefix="/api/analysis")

@analysis_bp.route("/<int:analysis_id>", methods=["GET"])
def get_analysis(analysis_id):
    """Get metadata for a specific analysis run."""
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({"error": "NOT_FOUND", "message": f"Analysis {analysis_id} not found"}), 404
    return jsonify(analysis.to_dict()), 200

@analysis_bp.route("/<int:analysis_id>/skills", methods=["GET"])
def get_analysis_skills(analysis_id):
    """Get calculated market skill frequencies for an analysis."""
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({"error": "NOT_FOUND", "message": f"Analysis {analysis_id} not found"}), 404

    frequencies = AnalysisService.calculate_skill_frequencies(analysis.career_role_id)
    return jsonify(frequencies), 200

@analysis_bp.route("/<int:analysis_id>/gaps", methods=["GET"])
def get_analysis_gaps(analysis_id):
    """Compute deterministic skill gaps for a user against an analysis."""
    user_id = request.args.get("user_id", default=1, type=int)
    analysis = Analysis.query.get(analysis_id)
    if not analysis:
        return jsonify({"error": "NOT_FOUND", "message": f"Analysis {analysis_id} not found"}), 404

    user_skills = UserSkill.query.filter_by(user_id=user_id).all()
    user_skills_map = {us.skill_id: us.proficiency for us in user_skills}

    frequencies = AnalysisService.calculate_skill_frequencies(analysis.career_role_id)
    gaps = AnalysisService.calculate_skill_gaps(frequencies, user_skills_map)
    return jsonify(gaps), 200
