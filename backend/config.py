import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Load .env file from project root or backend dir if present
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))
load_dotenv(os.path.join(BASE_DIR, ".env"))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "hydrofusion-secret-key-2026-digital-chemist")
    JWT_SECRET = os.environ.get("JWT_SECRET", SECRET_KEY)
    DATABASE_PATH = os.path.join(BASE_DIR, "hydrofusion.db")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Gemini API configuration
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Model storage path

    MODEL_PATH = os.path.join(BASE_DIR, "models", "scaling_model.pkl")

    # Project Administrator & Email System Configuration
    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "kamalaksha07k@gmail.com")
    ADMIN_ROLE = "Admin"
    EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
    EMAIL_USERNAME = os.environ.get("EMAIL_USERNAME", "")
    EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "")
    EMAIL_FROM = os.environ.get("EMAIL_FROM", "kamalaksha07k@gmail.com")
    EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "HydroFusion-AI")
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")



