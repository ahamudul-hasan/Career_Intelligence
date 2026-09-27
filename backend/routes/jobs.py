"""Job postings routes with CRUD-lite operations (Phase 3)."""
from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from backend.services.job_service import JobService
from backend.schemas.job import JobImportRequest

jobs_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")

@jobs_bp.route("", methods=["GET"])
def list_jobs():
    """List jobs with optional career_role_id and keyword filtering."""
    career_role_id = request.args.get("career_role_id", type=int)
    search = request.args.get("search", type=str)
    limit = request.args.get("limit", default=50, type=int)
    offset = request.args.get("offset", default=0, type=int)

    jobs = JobService.get_jobs(career_role_id=career_role_id, search=search, limit=limit, offset=offset)
    total = JobService.count_jobs(career_role_id=career_role_id)
    return jsonify({
        "jobs": [j.to_dict() for j in jobs],
        "total": total
    }), 200

@jobs_bp.route("/<int:job_id>", methods=["GET"])
def get_job(job_id):
    """Retrieve details for a single job posting."""
    job = JobService.get_job_by_id(job_id)
    if not job:
        return jsonify({"error": "NOT_FOUND", "message": f"Job {job_id} not found"}), 404
    return jsonify(job.to_dict()), 200

@jobs_bp.route("/import", methods=["POST"])
def import_job():
    """Manual job description import (Phase 3 / ManualProvider)."""
    payload = request.get_json() or {}
    try:
        req = JobImportRequest(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "VALIDATION_ERROR",
            "message": "Invalid job import payload",
            "details": err.errors()
        }), 400

    try:
        job = JobService.create_job(
            career_role_id=req.career_role_id,
            title=req.title,
            company=req.company,
            description=req.description,
            location=req.location,
            experience_level=req.experience_level,
            source="manual"
        )
        return jsonify({
            "message": "Job imported successfully",
            "job": job.to_dict()
        }), 201
    except ValueError as val_err:
        return jsonify({"error": "INVALID_CAREER_ROLE", "message": str(val_err)}), 400
    except Exception as exc:
        return jsonify({"error": "SERVER_ERROR", "message": str(exc)}), 500

@jobs_bp.route("/<int:job_id>", methods=["DELETE"])
def delete_job(job_id):
    """Delete a stored job by ID."""
    success = JobService.delete_job(job_id)
    if not success:
        return jsonify({"error": "NOT_FOUND", "message": f"Job {job_id} not found"}), 404
    return jsonify({"message": f"Job {job_id} deleted successfully"}), 200
