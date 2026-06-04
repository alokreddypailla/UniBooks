"""
books/router.py — Book listing CRUD endpoints with search and filtering.

GET    /books              — Browse all books (with search/filter/sort)
GET    /books/my-listings  — Get current user's listings
GET    /books/{id}         — Get a single book by ID
POST   /books              — Create a new listing
PUT    /books/{id}         — Update a listing (seller only)
DELETE /books/{id}         — Delete a listing (seller only)
POST   /books/upload-image — Upload book cover to Supabase Storage
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from typing import Optional
from app.books.schemas import BookCreate, BookUpdate, BookResponse, BooksListResponse
from app.database import get_supabase
from app.middleware.auth_middleware import get_current_user
import uuid

router = APIRouter(prefix="/books", tags=["Books"])


def _attach_seller(book: dict, supabase) -> dict:
    """Helper: fetch and attach seller info to a book dict."""
    seller_result = supabase.table("users").select(
        "id, full_name, university, email"
    ).eq("id", book["seller_id"]).execute()

    if seller_result.data:
        book["seller"] = seller_result.data[0]
    else:
        book["seller"] = None
    return book


@router.get("", response_model=BooksListResponse)
async def browse_books(
    search: Optional[str] = Query(None, description="Search by title, author, or subject"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    sort_by: Optional[str] = Query("newest", description="Sort: newest | price_asc | price_desc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page"),
):
    """
    Browse all available book listings with optional search, filter, and sort.
    This endpoint is public — no authentication required.
    """
    supabase = get_supabase()

    # Start query — only show available books
    query = supabase.table("books").select("*").eq("is_available", True)

    # Apply subject filter
    if subject:
        query = query.eq("subject", subject)

    # Apply condition filter
    if condition:
        query = query.eq("condition", condition)

    # Apply price range filters
    if min_price is not None:
        query = query.gte("price", min_price)
    if max_price is not None:
        query = query.lte("price", max_price)

    # Apply sorting
    if sort_by == "price_asc":
        query = query.order("price", desc=False)
    elif sort_by == "price_desc":
        query = query.order("price", desc=True)
    else:
        # Default: newest first
        query = query.order("created_at", desc=True)

    result = query.execute()
    all_books = result.data or []

    # Apply text search (client-side for flexibility)
    if search:
        search_lower = search.lower()
        all_books = [
            b for b in all_books
            if search_lower in b["title"].lower()
            or search_lower in b["author"].lower()
            or search_lower in b["subject"].lower()
        ]

    total = len(all_books)

    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated = all_books[start:end]

    # Attach seller info to each book
    books_with_sellers = [_attach_seller(book, supabase) for book in paginated]

    return BooksListResponse(
        books=books_with_sellers,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/my-listings", response_model=list[BookResponse])
async def get_my_listings(
    current_user: dict = Depends(get_current_user),
):
    """
    Returns all book listings created by the currently authenticated user.
    """
    supabase = get_supabase()

    result = supabase.table("books").select("*").eq(
        "seller_id", current_user["id"]
    ).order("created_at", desc=True).execute()

    books = result.data or []

    # Attach seller info (the current user)
    seller_info = {
        "id": current_user["id"],
        "full_name": current_user["full_name"],
        "university": current_user["university"],
        "email": current_user["email"],
    }
    for book in books:
        book["seller"] = seller_info

    return books


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: str):
    """
    Returns a single book listing by ID.
    Public endpoint — no authentication required.
    """
    supabase = get_supabase()

    result = supabase.table("books").select("*").eq("id", book_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book listing not found"
        )

    book = _attach_seller(result.data[0], supabase)
    return book


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    payload: BookCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new book listing.
    Requires authentication — the seller_id is set to the current user.
    """
    supabase = get_supabase()

    image_url = str(payload.image_url) if payload.image_url is not None else None

    book_data = {
        "title": payload.title,
        "author": payload.author,
        "edition": payload.edition,
        "subject": payload.subject,
        "condition": payload.condition,
        "price": payload.price,
        "description": payload.description,
        "image_url": image_url,
        "pickup_location": payload.pickup_location,
        "seller_id": current_user["id"],
        "is_available": True,
    }

    result = supabase.table("books").insert(book_data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create listing. Please try again."
        )

    book = _attach_seller(result.data[0], supabase)
    return book


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    payload: BookUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Update a book listing.
    Only the seller who created the listing can update it.
    """
    supabase = get_supabase()

    # Verify the book exists and belongs to the current user
    existing = supabase.table("books").select("*").eq("id", book_id).execute()
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book listing not found"
        )

    book = existing.data[0]
    if book["seller_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own listings"
        )

    # Build update dict — only include fields that were provided
    update_data = payload.model_dump(exclude_none=True)
    if update_data.get("image_url") is not None:
        update_data["image_url"] = str(update_data["image_url"])

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update"
        )

    result = supabase.table("books").update(update_data).eq("id", book_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update listing"
        )

    updated_book = _attach_seller(result.data[0], supabase)
    return updated_book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a book listing.
    Only the seller who created the listing can delete it.
    """
    supabase = get_supabase()

    # Verify the book exists and belongs to the current user
    existing = supabase.table("books").select("id, seller_id").eq("id", book_id).execute()
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book listing not found"
        )

    if existing.data[0]["seller_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own listings"
        )

    supabase.table("books").delete().eq("id", book_id).execute()
    return None


@router.post("/upload-image", status_code=status.HTTP_200_OK)
async def upload_book_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a book cover image to Supabase Storage.
    Returns the public URL of the uploaded image.

    - Accepts: image/jpeg, image/png, image/webp
    - Max size: 5MB
    """
    supabase = get_supabase()

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed"
        )

    # Read file content
    content = await file.read()

    # Validate file size (5MB max)
    max_size = 5 * 1024 * 1024  # 5MB in bytes
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be smaller than 5MB"
        )

    # Generate unique filename
    extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{current_user['id']}/{uuid.uuid4()}.{extension}"

    # Upload to Supabase Storage
    try:
        supabase.storage.from_("book-images").upload(
            path=filename,
            file=content,
            file_options={"content-type": file.content_type},
        )

        # Get the public URL
        public_url = supabase.storage.from_("book-images").get_public_url(filename)

        return {"image_url": public_url, "filename": filename}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )
