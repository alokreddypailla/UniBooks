"""
favourites/schemas.py — Pydantic models for the favourites system.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FavouriteCreate(BaseModel):
    """Schema for adding a book to favourites."""
    book_id: str


class FavouriteResponse(BaseModel):
    """Response for a single favourite entry."""
    id: str
    user_id: str
    book_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class FavouriteBookResponse(BaseModel):
    """Favourite entry with full book details embedded."""
    id: str
    user_id: str
    book_id: str
    created_at: datetime
    book: Optional[dict] = None

    class Config:
        from_attributes = True
