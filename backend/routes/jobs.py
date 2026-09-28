"""Job postings routes with live provider integration (Phase 4)."""
from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from backend.services.job_service import JobService
from backend.services.career_service import CareerService
from backend.schemas.job import JobImportRequest, JobSearchRequest
from backend.providers.adzuna import AdzunaProvider
from backend.providers.manual import ManualProvider
from backend.providers.file_provider import FileProvider

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

@jobs_bp.route("/search", methods=["POST"])
def search_jobs():
    """Search and bulk-ingest jobs from providers (Phase 4 / Section 15, 17, 39)."""
    payload = request.get_json() or {}
    try:
        req = JobSearchRequest(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "VALIDATION_ERROR",
            "message": "Invalid job search parameters",
            "details": err.errors()
        }), 400

    # Verify career role exists
    career_role = CareerService.get_career_by_id(req.career_role_id)
    if not career_role:
        return jsonify({"error": "NOT_FOUND", "message": f"Career role {req.career_role_id} not found"}), 404

    source = (req.source or "adzuna").lower()
    raw_jobs = []

    try:
        if source == "adzuna":
            provider = AdzunaProvider()
            raw_jobs = provider.search(
                career=career_role.name,
                location=req.location or "US",
                experience=req.experience_level or "entry_level",
                limit=req.limit or 30
            )
        elif source == "file":
            provider = FileProvider()
            raw_jobs = provider.search(
                career=career_role.name,
                location=req.location or "US",
                experience=req.experience_level or "entry_level",
                limit=req.limit or 30
            )
        elif source == "manual":
            provider = ManualProvider()
            raw_jobs = provider.search(
                career=career_role.name,
                location=req.location or "Remote",
                experience=req.experience_level or "entry_level",
                limit=req.limit or 30
            )
        else:
            return jsonify({"error": "INVALID_PROVIDER", "message": f"Unknown job provider '{source}'"}), 400

        # Run deduplication and bulk ingestion pipeline
        result = JobService.ingest_jobs_from_provider(
            career_role_id=career_role.id,
            raw_jobs=raw_jobs,
            source=source
        )

        return jsonify({
            "message": f"Successfully ingested {result['jobs_ingested']} jobs from {source.capitalize()} ({result['jobs_duplicate']} duplicates skipped)",
            "career_role_id": career_role.id,
            "career_role_name": career_role.name,
            "source": source,
            "jobs_found": result["jobs_found"],
            "jobs_ingested": result["jobs_ingested"],
            "jobs_duplicate": result["jobs_duplicate"],
            "jobs": result["jobs"]
        }), 200

    except ValueError as val_err:
        return jsonify({"error": "CONFIGURATION_ERROR", "message": str(val_err)}), 400
    except Exception as exc:
        return jsonify({"error": "PROVIDER_ERROR", "message": str(exc)}), 502

@jobs_bp.route("/upload", methods=["POST"])
def upload_jobs():
    """Upload job descriptions via TXT/document file (FileProvider) (Phase 4)."""
    if "file" not in request.files:
        return jsonify({"error": "NO_FILE", "message": "No file uploaded in form data 'file'"}), 400

    file = request.files["file"]
    career_role_id = request.form.get("career_role_id", type=int)
    if not career_role_id:
        return jsonify({"error": "VALIDATION_ERROR", "message": "career_role_id is required"}), 400

    career_role = CareerService.get_career_by_id(career_role_id)
    if not career_role:
        return jsonify({"error": "NOT_FOUND", "message": f"Career role {career_role_id} not found"}), 404

    try:
        content = file.read().decode("utf-8", errors="replace")
        provider = FileProvider()
        raw_jobs = provider.parse_text_file(
            content=content,
            filename=file.filename or "uploaded.txt",
            default_career=career_role.name,
            experience=request.form.get("experience_level", "entry_level")
        )

        result = JobService.ingest_jobs_from_provider(
            career_role_id=career_role.id,
            raw_jobs=raw_jobs,
            source="file"
        )

        return jsonify({
            "message": f"Uploaded and ingested {result['jobs_ingested']} jobs from file ({result['jobs_duplicate']} duplicates skipped)",
            "career_role_id": career_role.id,
            "career_role_name": career_role.name,
            "source": "file",
            "jobs_found": result["jobs_found"],
            "jobs_ingested": result["jobs_ingested"],
            "jobs_duplicate": result["jobs_duplicate"],
            "jobs": result["jobs"]
        }), 201
    except Exception as exc:
        return jsonify({"error": "FILE_PROCESSING_ERROR", "message": str(exc)}), 500

@jobs_bp.route("/<int:job_id>", methods=["DELETE"])
def delete_job(job_id):
    """Delete a stored job by ID."""
    success = JobService.delete_job(job_id)
    if not success:
        return jsonify({"error": "NOT_FOUND", "message": f"Job {job_id} not found"}), 404
    return jsonify({"message": f"Job {job_id} deleted successfully"}), 200
