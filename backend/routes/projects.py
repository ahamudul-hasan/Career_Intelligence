"""Recommended projects routes."""
from flask import Blueprint, jsonify
from backend.services.roadmap_service import RoadmapService

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")

@projects_bp.route("", methods=["GET"])
def list_projects():
    """List all project recommendations."""
    projects = RoadmapService.get_all_projects()
    return jsonify([p.to_dict() for p in projects]), 200
