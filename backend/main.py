# main.py
# WellMind Backend — FastAPI Application Entry Point
# Run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from database import Base, engine

# Load environment variables from .env file
load_dotenv()

# Import all route modules
from routes.users import router as users_router
from routes.mood import router as mood_router
from routes.chat import router as chat_router
from routes.journal import router as journal_router
from routes.focus import router as focus_router
from routes.dashboard import router as dashboard_router

# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================
app = FastAPI(
    title="WellMind API",
    description="AI-powered student wellness and burnout support platform",
    version="1.0.0",
    docs_url="/docs",          # Swagger UI at /docs
    redoc_url="/redoc",        # ReDoc UI at /redoc
)

# ============================================================
# CORS MIDDLEWARE
# Allows the frontend (localhost:3000) to talk to this API
# ============================================================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REGISTER ROUTES
# Each router handles a different section of the API
# ============================================================
app.include_router(users_router, prefix="/api/v1")
app.include_router(mood_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(journal_router, prefix="/api/v1")
app.include_router(focus_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")


# ============================================================
# HEALTH CHECK ENDPOINT
# Useful for deployment platforms to verify the server is up
# ============================================================
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "WellMind API",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    return {
        "message": "Welcome to WellMind API 🌿",
        "docs": "/docs",
        "health": "/health"
    }


# ============================================================
# STARTUP EVENT
# ============================================================
@app.on_event("startup")
async def startup_event():
    print("🌿 WellMind API starting up...")
    Base.metadata.create_all(bind=engine)
    print("   Database tables verified/created")
    print(f"   Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"   CORS origins: {allowed_origins}")
    print("✅ WellMind API is ready!")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
