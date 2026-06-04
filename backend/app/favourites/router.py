"""
favourites/router.py — Favourites management endpoints.

GET    /favourites           — Get all favourites for current user
POST   /favourites           — Add a book to favourites
DELETE /favourites/{book_id} — Remove a book from favourites
GET    /favourites/check/{book_id} — Check if a book is favourited
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.favourites.schemas import FavouriteCreate, FavouriteResponse
from app.database import get_supabase
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/favourites", tags=["Favourites"])


@router.get("", response_model=list[dict])
async def get_favourites(current_user: dict = Depends(get_current_user)):
    """
    Returns all books saved to the current user's favourites list,
    with full book details embedded in each result.
    """
    supabase = get_supabase()

    # Get all favourites for this user
    result = supabase.table("favourites").select("*").eq(
        "user_id", current_user["id"]
    ).order("created_at", desc=True).execute()

    favourites = result.data or []

    # Enrich each favourite with book details
    enriched = []
    for fav in favourites:
        book_result = supabase.table("books").select("*").eq(
            "id", fav["book_id"]
        ).execute()

        if book_result.data:
            book = book_result.data[0]
            # Attach seller info
            seller_result = supabase.table("users").select(
                "id, full_name, university, email"
            ).eq("id", book["seller_id"]).execute()
            book["seller"] = seller_result.data[0] if seller_result.data else None
            fav["book"] = book
        else:
            fav["book"] = None

        enriched.append(fav)

    return enriched


@router.get("/check/{book_id}")
async def check_favourite(
    book_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Check if a specific book is in the current user's favourites.
    Returns { is_favourite: bool }
    """
    supabase = get_supabase()

    result = supabase.table("favourites").select("id").eq(
        "user_id", current_user["id"]
    ).eq("book_id", book_id).execute()

    return {"is_favourite": bool(result.data)}


@router.post("", response_model=FavouriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favourite(
    payload: FavouriteCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Add a book to the current user's favourites list.
    Returns 409 if the book is already favourited.
    """
    supabase = get_supabase()

    # Validate that the book exists
    book_result = supabase.table("books").select("id").eq(
        "id", payload.book_id
    ).execute()
    if not book_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book listing not found"
        )

    # Check if already favourited
    existing = supabase.table("favourites").select("id").eq(
        "user_id", current_user["id"]
    ).eq("book_id", payload.book_id).execute()

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Book is already in your favourites"
        )

    # Insert favourite
    result = supabase.table("favourites").insert({
        "user_id": current_user["id"],
        "book_id": payload.book_id,
    }).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add to favourites"
        )

    return result.data[0]


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favourite(
    book_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Remove a book from the current user's favourites list.
    """
    supabase = get_supabase()

    # Check if the favourite exists
    existing = supabase.table("favourites").select("id").eq(
        "user_id", current_user["id"]
    ).eq("book_id", book_id).execute()

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book is not in your favourites"
        )

    supabase.table("favourites").delete().eq(
        "user_id", current_user["id"]
    ).eq("book_id", book_id).execute()

    return None
