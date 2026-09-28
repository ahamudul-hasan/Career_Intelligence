import os
from pathlib import Path
from dotenv import load_dotenv
from backend.config.settings import GAP_THRESHOLDS, EXPERIENCE_LEVELS, JOB_SOURCES, CAREER_CATEGORIES

# Load .env from project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # Database
    DB_USER = os.getenv("MYSQL_USER", "career_user")
    DB_PASSWORD = os.getenv("MYSQL_PASSWORD", "career_password")
    DB_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
    DB_PORT = os.getenv("MYSQL_PORT", "3306")
    DB_NAME = os.getenv("MYSQL_DATABASE", "career_intelligence")
    
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", 
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Gemini AI
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    
    # Job Providers
    ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
    ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
    REED_API_KEY = os.getenv("REED_API_KEY")
    JOOBLE_API_KEY = os.getenv("JOOBLE_API_KEY")
    
    # CORS
    CORS_ORIGINS = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    ]

__all__ = [
    "Config",
    "GAP_THRESHOLDS",
    "EXPERIENCE_LEVELS",
    "JOB_SOURCES",
    "CAREER_CATEGORIES",
]
