"""Market analysis and skill gap routes (Phase 8 / Sections 7, 40, 49)."""
from flask import Blueprint, jsonify, request
from backend.models.analysis import Analysis
from backend.models.user import UserSkill
from backend.services.analysis_service import AnalysisService

from backend.schemas.analysis import AnalysisCreateRequest

analysis_bp = Blueprint("analysis", __name__, url_prefix="/api/analysis")

@analysis_bp.route("", methods=["GET"])
def list_analyses():
    """Retrieve market analysis snapshots history."""
    career_role_id = request.args.get("career_role_id", type=int)
    limit = request.args.get("limit", default=20, type=int)
    analyses = AnalysisService.get_analyses_history(career_role_id=career_role_id, limit=limit)
    return jsonify([a.to_dict() for a in analyses]), 200

@analysis_bp.route("", methods=["POST"])
def create_analysis():
    """Run and persist a deterministic market analysis snapshot (Phase 8 / Section 49, 56) with Pydantic validation."""
    payload = request.get_json() or {}
    req = AnalysisCreateRequest(**payload)

    try:
        result = AnalysisService.create_analysis(
            career_role_id=req.career_role_id,
            target_location=req.target_location or "All",
            experience_level=req.experience_level or "All",
            sources=req.sources or "adzuna"
        )
        return jsonify({
            "message": "Market analysis created successfully",
            **result
        }), 201
    except ValueError as val_err:
        return jsonify({"error": "NOT_FOUND", "message": str(val_err)}), 404
    except Exception as exc:
        return jsonify({"error": "SERVER_ERROR", "message": str(exc)}), 500

@analysis_bp.route("/<int:analysis_id>", methods=["GET"])
def get_analysis(analysis_id):
    """Get metadata for a specific analysis run."""
    analysis = AnalysisService.get_analysis_by_id(analysis_id)
    if not analysis:
        return jsonify({"error": "NOT_FOUND", "message": f"Analysis {analysis_id} not found"}), 404
    return jsonify(analysis.to_dict()), 200

@analysis_bp.route("/<int:analysis_id>/skills", methods=["GET"])
def get_analysis_skills(analysis_id):
    """Get calculated market skill frequencies for an analysis."""
    analysis = AnalysisService.get_analysis_by_id(analysis_id)
    if not analysis:
        return jsonify({"error": "NOT_FOUND", "message": f"Analysis {analysis_id} not found"}), 404

    frequencies = AnalysisService.calculate_skill_frequencies(
        career_role_id=analysis.career_role_id,
        location=analysis.target_location if analysis.target_location != "All" else None,
        experience_level=analysis.experience_level if analysis.experience_level != "All" else None
    )
    return jsonify(frequencies), 200

@analysis_bp.route("/<int:analysis_id>/gaps", methods=["GET"])
def get_analysis_gaps(analysis_id):
    """Compute deterministic skill gaps for a user against an analysis (Section 50)."""
    user_id = request.args.get("user_id", default=1, type=int)
    analysis = AnalysisService.get_analysis_by_id(analysis_id)
    if not analysis:
        return jsonify({"error": "NOT_FOUND", "message": f"Analysis {analysis_id} not found"}), 404

    user_skills = UserSkill.query.filter_by(user_id=user_id).all()
    user_skills_map = {us.skill_id: us.proficiency for us in user_skills}

    frequencies = AnalysisService.calculate_skill_frequencies(
        career_role_id=analysis.career_role_id,
        location=analysis.target_location if analysis.target_location != "All" else None,
        experience_level=analysis.experience_level if analysis.experience_level != "All" else None
    )
    gaps = AnalysisService.calculate_skill_gaps(frequencies, user_skills_map)
    return jsonify(gaps), 200

@analysis_bp.route("/gaps", methods=["GET"])
def get_career_gaps_direct():
    """Compute deterministic skill gaps directly by career_role_id without requiring a snapshot."""
    career_role_id = request.args.get("career_role_id", type=int)
    if not career_role_id:
        return jsonify({"error": "VALIDATION_ERROR", "message": "career_role_id is required"}), 400

    user_id = request.args.get("user_id", default=1, type=int)
    location = request.args.get("location")
    experience_level = request.args.get("experience_level")

    user_skills = UserSkill.query.filter_by(user_id=user_id).all()
    user_skills_map = {us.skill_id: us.proficiency for us in user_skills}

    frequencies = AnalysisService.calculate_skill_frequencies(
        career_role_id=career_role_id,
        location=location if location != "All" else None,
        experience_level=experience_level if experience_level != "All" else None
    )
    gaps = AnalysisService.calculate_skill_gaps(frequencies, user_skills_map)
    return jsonify(gaps), 200

