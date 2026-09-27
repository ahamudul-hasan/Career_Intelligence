"""Job postings routes."""
from flask import Blueprint, jsonify, request
from backend.models.job import Job
from backend.services.job_service import JobService

jobs_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")

@jobs_bp.route("", methods=["GET"])
def list_jobs():
    """List jobs, optionally filtered by career_role_id."""
    career_role_id = request.args.get("career_role_id", type=int)
    limit = request.args.get("limit", default=30, type=int)
    if career_role_id:
        jobs = JobService.get_jobs_by_career(career_role_id, limit=limit)
    else:
        jobs = Job.query.order_by(Job.id.desc()).limit(limit).all()
    return jsonify([j.to_dict() for j in jobs]), 200

@jobs_bp.route("/<int:job_id>", methods=["GET"])
def get_job(job_id):
    """Retrieve details for a single job posting."""
    job = JobService.get_job_by_id(job_id)
    if not job:
        return jsonify({"error": "NOT_FOUND", "message": f"Job {job_id} not found"}), 404
    return jsonify(job.to_dict()), 200

@jobs_bp.route("/import", methods=["POST"])
def import_job():
    """Manual job description import (Phase 3)."""
    data = request.get_json() or {}
    if not data.get("career_role_id") or not data.get("title") or not data.get("description"):
        return jsonify({"error": "VALIDATION_ERROR", "message": "career_role_id, title, and description are required"}), 400
    
    job = JobService.create_job(
        career_role_id=data["career_role_id"],
        title=data["title"],
        company=data.get("company", "Manual Import"),
        description=data["description"],
        location=data.get("location", "Remote"),
        experience_level=data.get("experience_level", "entry_level"),
        source="manual"
    )
    return jsonify(job.to_dict()), 201
