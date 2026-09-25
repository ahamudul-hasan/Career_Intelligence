from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint returning system status."""
    return jsonify({
        "status": "ok",
        "service": "CS Career Intelligence API",
        "version": "1.0.0"
    }), 200
