"""
main.py — FastAPI application entry point for UniBooks Exchange.

This file:
- Creates the FastAPI app instance
- Configures CORS middleware
- Registers all API routers
- Provides a health check endpoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.auth.router import router as auth_router
from app.books.router import router as books_router
from app.messages.router import router as messages_router
from app.favourites.router import router as favourites_router
from app.profile.router import router as profile_router

# Load settings
settings = get_settings()

# ── Create FastAPI app ──
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A student-focused marketplace for buying and selling second-hand academic textbooks.",
    docs_url="/docs",       # Swagger UI at /docs
    redoc_url="/redoc",     # ReDoc at /redoc
)

# ── CORS Configuration ──
# Allow requests from the React frontend.
# Both 5173 and 5174 are listed because Vite auto-increments the port
# if 5173 is already occupied by another process.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,                   # Value from .env or Vercel env
        "http://localhost:5173",                # Vite default port
        "http://localhost:5174",                # Vite fallback port
        "http://localhost:3000",                # Alternative dev port
        "https://unibooks-exchange.vercel.app", # Production frontend alias
        "https://unibooks-frontend.vercel.app", # Deployed frontend origin
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──
app.include_router(auth_router)
app.include_router(books_router)
app.include_router(messages_router)
app.include_router(favourites_router)
app.include_router(profile_router)


# ── Health Check ──
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint — confirms the API is running."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "message": "UniBooks Exchange API is running 🎓",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check for deployment monitoring."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
    }
