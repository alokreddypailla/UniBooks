"""
auth/router.py — Authentication endpoints.
POST /auth/register  — Create a new user account
POST /auth/login     — Authenticate and receive JWT
GET  /auth/me        — Get current authenticated user
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.auth.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.auth.utils import hash_password, verify_password, create_access_token, validate_university_email
from app.database import get_supabase
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    """
    Register a new student account.
    - Validates university email domain
    - Hashes password with bcrypt
    - Stores user in Supabase
    - Returns JWT token
    """
    supabase = get_supabase()

    # Validate university email domain
    if not validate_university_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only university email addresses are accepted (.edu, .edu.au, .ac.uk, etc.)"
        )

    # Check if email already exists
    try:
        existing = supabase.table("users").select("id").eq("email", payload.email.lower()).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(e)}. Make sure the database schema has been set up."
        )

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )

    # Hash the password
    password_hash = hash_password(payload.password)

    # Insert new user into Supabase
    new_user_data = {
        "full_name": payload.full_name.strip(),
        "university": payload.university.strip(),
        "email": payload.email.lower().strip(),
        "password_hash": password_hash,
    }

    try:
        result = supabase.table("users").insert(new_user_data).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create account: {str(e)}. Make sure the 'users' table exists in Supabase."
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create account. Please try again."
        )

    user = result.data[0]

    # Create JWT token
    access_token = create_access_token(data={"sub": user["id"]})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            full_name=user["full_name"],
            university=user["university"],
            email=user["email"],
            created_at=user["created_at"],
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """
    Authenticate a user with email and password.
    Returns a JWT token on success.
    """
    supabase = get_supabase()

    # Find user by email
    try:
        result = supabase.table("users").select("*").eq("email", payload.email.lower()).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(e)}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user = result.data[0]

    # Verify password
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT token
    access_token = create_access_token(data={"sub": user["id"]})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            full_name=user["full_name"],
            university=user["university"],
            email=user["email"],
            created_at=user["created_at"],
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile.
    Requires a valid JWT token in the Authorization header.
    """
    return UserResponse(
        id=current_user["id"],
        full_name=current_user["full_name"],
        university=current_user["university"],
        email=current_user["email"],
        created_at=current_user["created_at"],
    )
