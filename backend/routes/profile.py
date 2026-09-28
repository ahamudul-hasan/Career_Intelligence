"""User profile and skills routes (Phase 9 / Sections 8, 28, 41)."""
from flask import Blueprint, jsonify, request
from backend.services.profile_service import ProfileService, PROFICIENCY_LEVELS

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

@profile_bp.route("", methods=["GET"])
def get_profile():
    """Get active user profile (defaults to user_id=1 for MVP)."""
    user_id = request.args.get("user_id", default=1, type=int)
    user = ProfileService.get_profile(user_id=user_id)
    return jsonify(user.to_dict()), 200

@profile_bp.route("", methods=["PUT"])
def update_profile():
    """Update active user profile (name, email)."""
    user_id = request.args.get("user_id", default=1, type=int)
    payload = request.get_json() or {}
    name = payload.get("name")
    email = payload.get("email")

    try:
        user = ProfileService.update_profile(user_id=user_id, name=name, email=email)
        return jsonify({
            "message": "Profile updated successfully",
            "profile": user.to_dict()
        }), 200
    except Exception as exc:
        return jsonify({"error": "UPDATE_ERROR", "message": str(exc)}), 400

@profile_bp.route("/skills", methods=["GET"])
def get_user_skills():
    """List skills for active user with proficiency levels."""
    user_id = request.args.get("user_id", default=1, type=int)
    skills = ProfileService.get_user_skills(user_id=user_id)
    return jsonify([s.to_dict() for s in skills]), 200

@profile_bp.route("/skills", methods=["POST"])
def add_user_skill():
    """Add or update a skill with proficiency level (0-4) in user's profile."""
    user_id = request.args.get("user_id", default=1, type=int)
    payload = request.get_json() or {}

    skill_id = payload.get("skill_id")
    skill_name = payload.get("skill_name")
    proficiency = payload.get("proficiency", 0)

    if not skill_id and not skill_name:
        return jsonify({
            "error": "VALIDATION_ERROR",
            "message": "Either skill_id or skill_name is required."
        }), 400

    try:
        user_skill = ProfileService.add_or_update_user_skill(
            user_id=user_id,
            skill_id=int(skill_id) if skill_id is not None else None,
            skill_name=str(skill_name) if skill_name is not None else None,
            proficiency=proficiency
        )
        return jsonify({
            "message": "Skill added to profile successfully",
            "skill": user_skill.to_dict()
        }), 201
    except ValueError as val_err:
        return jsonify({"error": "VALIDATION_ERROR", "message": str(val_err)}), 400
    except Exception as exc:
        return jsonify({"error": "SERVER_ERROR", "message": str(exc)}), 500

@profile_bp.route("/skills", methods=["PUT"])
def update_user_skill_body():
    """Update skill proficiency via request body."""
    user_id = request.args.get("user_id", default=1, type=int)
    payload = request.get_json() or {}

    skill_id = payload.get("skill_id")
    proficiency = payload.get("proficiency")

    if skill_id is None or proficiency is None:
        return jsonify({
            "error": "VALIDATION_ERROR",
            "message": "skill_id and proficiency are required."
        }), 400

    try:
        user_skill = ProfileService.update_user_skill_proficiency(
            user_id=user_id,
            skill_id=int(skill_id),
            proficiency=int(proficiency)
        )
        return jsonify({
            "message": "Proficiency updated successfully",
            "skill": user_skill.to_dict()
        }), 200
    except ValueError as val_err:
        return jsonify({"error": "NOT_FOUND_OR_INVALID", "message": str(val_err)}), 400
    except Exception as exc:
        return jsonify({"error": "SERVER_ERROR", "message": str(exc)}), 500

@profile_bp.route("/skills/<int:skill_id>", methods=["PUT"])
def update_user_skill_param(skill_id):
    """Update skill proficiency via URL parameter."""
    user_id = request.args.get("user_id", default=1, type=int)
    payload = request.get_json() or {}
    proficiency = payload.get("proficiency")

    if proficiency is None:
        return jsonify({
            "error": "VALIDATION_ERROR",
            "message": "proficiency is required in request body."
        }), 400

    try:
        user_skill = ProfileService.update_user_skill_proficiency(
            user_id=user_id,
            skill_id=skill_id,
            proficiency=int(proficiency)
        )
        return jsonify({
            "message": "Proficiency updated successfully",
            "skill": user_skill.to_dict()
        }), 200
    except ValueError as val_err:
        return jsonify({"error": "NOT_FOUND_OR_INVALID", "message": str(val_err)}), 404
    except Exception as exc:
        return jsonify({"error": "SERVER_ERROR", "message": str(exc)}), 500

@profile_bp.route("/skills/<int:skill_id>", methods=["DELETE"])
def delete_user_skill_param(skill_id):
    """Delete skill from profile via URL parameter."""
    user_id = request.args.get("user_id", default=1, type=int)
    try:
        ProfileService.remove_user_skill(user_id=user_id, skill_id=skill_id)
        return jsonify({
            "message": f"Skill {skill_id} removed from profile successfully",
            "skill_id": skill_id
        }), 200
    except ValueError as val_err:
        return jsonify({"error": "NOT_FOUND", "message": str(val_err)}), 404
    except Exception as exc:
        return jsonify({"error": "SERVER_ERROR", "message": str(exc)}), 500

@profile_bp.route("/skills", methods=["DELETE"])
def delete_user_skill_query():
    """Delete skill from profile via query parameter or body."""
    user_id = request.args.get("user_id", default=1, type=int)
    skill_id = request.args.get("skill_id", type=int)
    if not skill_id:
        payload = request.get_json(silent=True) or {}
        skill_id = payload.get("skill_id")

    if not skill_id:
        return jsonify({"error": "VALIDATION_ERROR", "message": "skill_id is required"}), 400

    try:
        ProfileService.remove_user_skill(user_id=user_id, skill_id=int(skill_id))
        return jsonify({
            "message": f"Skill {skill_id} removed from profile successfully",
            "skill_id": int(skill_id)
        }), 200
    except ValueError as val_err:
        return jsonify({"error": "NOT_FOUND", "message": str(val_err)}), 404
    except Exception as exc:
        return jsonify({"error": "SERVER_ERROR", "message": str(exc)}), 500

@profile_bp.route("/proficiency-levels", methods=["GET"])
def get_proficiency_levels():
    """Get metadata for standard proficiency levels (0 to 4)."""
    return jsonify({
        "levels": [
            {"level": k, "label": v} for k, v in PROFICIENCY_LEVELS.items()
        ]
    }), 200
