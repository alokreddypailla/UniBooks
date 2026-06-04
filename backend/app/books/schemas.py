"""
books/schemas.py — Pydantic models for book listing requests and responses.
"""

from pydantic import BaseModel, AnyUrl, field_validator
from typing import Optional
from datetime import datetime


VALID_CONDITIONS = ["Like New", "Good", "Fair"]
VALID_SUBJECTS = [
    "Computer Science", "Mathematics", "Physics", "Economics",
    "Literature", "Chemistry", "Biology", "Engineering",
    "Business", "Psychology", "History", "Other"
]


class BookCreate(BaseModel):
    """Schema for creating a new book listing."""
    title: str
    author: str
    edition: Optional[str] = None
    subject: str
    condition: str
    price: float
    description: Optional[str] = None
    image_url: Optional[AnyUrl] = None
    pickup_location: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title is required")
        return v

    @field_validator("author")
    @classmethod
    def author_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Author is required")
        return v

    @field_validator("condition")
    @classmethod
    def valid_condition(cls, v: str) -> str:
        if v not in VALID_CONDITIONS:
            raise ValueError(f"Condition must be one of: {', '.join(VALID_CONDITIONS)}")
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price must be a positive number")
        return round(v, 2)


class BookUpdate(BaseModel):
    """Schema for updating an existing book listing."""
    title: Optional[str] = None
    author: Optional[str] = None
    edition: Optional[str] = None
    subject: Optional[str] = None
    condition: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[AnyUrl] = None
    pickup_location: Optional[str] = None
    is_available: Optional[bool] = None

    @field_validator("condition")
    @classmethod
    def valid_condition(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_CONDITIONS:
            raise ValueError(f"Condition must be one of: {', '.join(VALID_CONDITIONS)}")
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Price must be a positive number")
        return round(v, 2) if v is not None else v


class SellerInfo(BaseModel):
    """Seller information embedded in book responses."""
    id: str
    full_name: str
    university: str
    email: str


class BookResponse(BaseModel):
    """Full book listing response including seller info."""
    id: str
    title: str
    author: str
    edition: Optional[str]
    subject: str
    condition: str
    price: float
    description: Optional[str]
    image_url: Optional[str]
    pickup_location: Optional[str]
    seller_id: str
    seller: Optional[SellerInfo] = None
    is_available: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BooksListResponse(BaseModel):
    """Paginated list of books."""
    books: list[BookResponse]
    total: int
    page: int
    page_size: int
