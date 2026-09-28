"""Skills and market frequency routes (Phase 6 / Section 19, 47)."""
from flask import Blueprint, jsonify, request
from backend.models.skill import Skill
from backend.services.skill_service import SkillService
from backend.services.analysis_service import AnalysisService

skills_bp = Blueprint("skills", __name__, url_prefix="/api/skills")

@skills_bp.route("", methods=["GET"])
def list_skills():
    """List canonical skills."""
    skills = Skill.query.order_by(Skill.name).all()
    return jsonify([s.to_dict() for s in skills]), 200

@skills_bp.route("/top", methods=["GET"])
def get_top_skills():
    """Get top skills by frequency for a career_role_id (Phase 8)."""
    career_role_id = request.args.get("career_role_id", type=int)
    if not career_role_id:
        return jsonify({"error": "VALIDATION_ERROR", "message": "career_role_id query parameter is required"}), 400

    location = request.args.get("location", type=str)
    experience_level = request.args.get("experience_level", type=str)
    limit = request.args.get("limit", default=50, type=int)

    frequencies = AnalysisService.calculate_skill_frequencies(
        career_role_id=career_role_id,
        location=location,
        experience_level=experience_level,
        limit=limit
    )
    return jsonify(frequencies), 200

@skills_bp.route("/extract", methods=["POST"])
def batch_extract_skills():
    """Run batch LangChain skill extraction for all jobs of a career role (Phase 6 / Section 19)."""
    payload = request.get_json() or {}
    career_role_id = payload.get("career_role_id")
    if not career_role_id:
        return jsonify({"error": "VALIDATION_ERROR", "message": "career_role_id is required"}), 400

    limit = payload.get("limit", 50)
    reextract = payload.get("reextract", False)

    try:
        result = SkillService.extract_skills_for_career(
            career_role_id=int(career_role_id),
            limit=int(limit),
            reextract=bool(reextract)
        )
        return jsonify({
            "message": f"Successfully extracted {result['total_skills_extracted']} skills across {result['jobs_processed']} jobs.",
            **result
        }), 200
    except ValueError as val_err:
        return jsonify({"error": "NOT_FOUND", "message": str(val_err)}), 404
    except Exception as exc:
        return jsonify({"error": "EXTRACTION_ERROR", "message": str(exc)}), 500
