"""User profile and skills routes."""
from flask import Blueprint, jsonify, request
from backend.models.user import User, UserSkill
from backend.extensions import db

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

@profile_bp.route("", methods=["GET"])
def get_profile():
    """Get active user profile (defaults to user_id=1 for MVP)."""
    user_id = request.args.get("user_id", default=1, type=int)
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "NOT_FOUND", "message": f"User {user_id} not found"}), 404
    return jsonify(user.to_dict()), 200

@profile_bp.route("/skills", methods=["GET"])
def get_user_skills():
    """List skills for active user."""
    user_id = request.args.get("user_id", default=1, type=int)
    skills = UserSkill.query.filter_by(user_id=user_id).all()
    return jsonify([s.to_dict() for s in skills]), 200
