"""Standardized API Error Handling and Transparency Guardrails (Phase 14 / Sections 56, 57)."""
import logging
from typing import Optional, Any
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from pydantic import ValidationError as PydanticValidationError

logger = logging.getLogger(__name__)

class AppError(Exception):
    """Base application exception returning standardized JSON responses."""
    def __init__(
        self,
        message: str,
        error_code: str = "APP_ERROR",
        status_code: int = 400,
        details: Optional[Any] = None
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details

    def to_dict(self):
        rv = {"error": self.error_code, "message": self.message}
        if self.details is not None:
            rv["details"] = self.details
        return rv

class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(message=message, error_code="NOT_FOUND", status_code=404, details=details)

class ValidationError(AppError):
    def __init__(self, message: str = "Validation failed", details: Optional[Any] = None):
        super().__init__(message=message, error_code="VALIDATION_ERROR", status_code=400, details=details)

class ProviderError(AppError):
    def __init__(self, message: str = "External job provider failed", details: Optional[Any] = None):
        super().__init__(message=message, error_code="PROVIDER_ERROR", status_code=502, details=details)

class RateLimitError(AppError):
    def __init__(self, message: str = "Rate limit or AI quota exceeded", details: Optional[Any] = None):
        super().__init__(message=message, error_code="RATE_LIMIT_EXCEEDED", status_code=429, details=details)

class LLMTimeoutError(AppError):
    def __init__(self, message: str = "AI service timed out or produced malformed output", details: Optional[Any] = None):
        super().__init__(message=message, error_code="LLM_TIMEOUT", status_code=504, details=details)

class FileUploadError(AppError):
    def __init__(self, message: str = "File upload failed", error_code: str = "FILE_UPLOAD_ERROR", details: Optional[Any] = None):
        super().__init__(message=message, error_code=error_code, status_code=400, details=details)

class MalformedDataError(AppError):
    def __init__(self, message: str = "Malformed job description or data input", details: Optional[Any] = None):
        super().__init__(message=message, error_code="MALFORMED_DATA", status_code=422, details=details)

class NoJobsFoundError(AppError):
    def __init__(self, message: str = "No jobs found for analysis", details: Optional[Any] = None):
        super().__init__(message=message, error_code="NO_JOBS_FOUND", status_code=404, details=details)


def register_error_handlers(app: Flask) -> None:
    """Register uniform global JSON error handlers conforming to Section 56/57."""

    @app.errorhandler(AppError)
    def handle_app_error(err: AppError):
        logger.warning("Application error [%s]: %s", err.error_code, err.message)
        return jsonify(err.to_dict()), err.status_code

    @app.errorhandler(PydanticValidationError)
    def handle_pydantic_validation(err: PydanticValidationError):
        logger.info("Payload validation error: %s", err)
        return jsonify({
            "error": "VALIDATION_ERROR",
            "message": "Invalid request parameters or payload",
            "details": err.errors()
        }), 400

    @app.errorhandler(HTTPException)
    def handle_http_exception(err: HTTPException):
        code_name = (err.name or "HTTP_ERROR").upper().replace(" ", "_")
        description = err.description or "HTTP request error"
        return jsonify({
            "error": code_name,
            "message": description
        }), err.code or 500

    @app.errorhandler(Exception)
    def handle_unexpected_exception(err: Exception):
        logger.exception("Unhandled server exception: %s", err)
        return jsonify({
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected server error occurred. Please try again later."
        }), 500
