"""
database.py — Supabase client initialisation.
Provides a single shared Supabase client used across all routers.
"""

from supabase import create_client, Client
from app.config import get_settings
from functools import lru_cache


@lru_cache()
def get_supabase() -> Client:
    """
    Returns a cached Supabase client instance.
    Uses the service_role key so the backend can bypass RLS
    and perform all database operations securely server-side.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)
