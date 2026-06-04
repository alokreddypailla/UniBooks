"""
profile/router.py — User profile management endpoints.

GET  /profile          — Get current user's profile with stats
PUT  /profile          — Update profile information
PUT  /profile/password — Change password
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.profile.schemas import ProfileUpdate, PasswordChange
from app.auth.schemas import UserResponse
from app.auth.utils import verify_password, hash_password
from app.database import get_supabase
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Returns the current user's profile including:
    - Personal information
    - Total listings count
    - Total favourites count
    - Member since date
    """
    supabase = get_supabase()
    user_id = current_user["id"]

    # Count user's listings
    listings_result = supabase.table("books").select(
        "id", count="exact"
    ).eq("seller_id", user_id).execute()
    listings_count = listings_result.count or 0

    # Count user's favourites
    favourites_result = supabase.table("favourites").select(
        "id", count="exact"
    ).eq("user_id", user_id).execute()
    favourites_count = favourites_result.count or 0

    return {
        "id": current_user["id"],
        "full_name": current_user["full_name"],
        "university": current_user["university"],
        "email": current_user["email"],
        "created_at": current_user["created_at"],
        "stats": {
            "listings_count": listings_count,
            "favourites_count": favourites_count,
        }
    }


@router.put("", response_model=UserResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Update the current user's profile information.
    Only full_name and university can be updated (not email).
    """
    supabase = get_supabase()

    # Build update dict — only include provided fields
    update_data = payload.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update"
        )

    result = supabase.table("users").update(update_data).eq(
        "id", current_user["id"]
    ).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

    updated_user = result.data[0]
    return UserResponse(
        id=updated_user["id"],
        full_name=updated_user["full_name"],
        university=updated_user["university"],
        email=updated_user["email"],
        created_at=updated_user["created_at"],
    )


@router.put("/password")
async def change_password(
    payload: PasswordChange,
    current_user: dict = Depends(get_current_user),
):
    """
    Change the current user's password.
    Requires the current password for verification.
    """
    supabase = get_supabase()

    # Verify current password
    if not verify_password(payload.current_password, current_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Hash the new password
    new_hash = hash_password(payload.new_password)

    # Update in database
    result = supabase.table("users").update(
        {"password_hash": new_hash}
    ).eq("id", current_user["id"]).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )

    return {"message": "Password updated successfully"}
