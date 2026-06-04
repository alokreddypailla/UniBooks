"""
messages/router.py — Messaging system endpoints.

GET  /messages/conversations              — List all conversations for current user
GET  /messages/{book_id}/{other_user_id}  — Get messages in a specific conversation
POST /messages                            — Send a new message
PUT  /messages/{book_id}/read             — Mark messages as read
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.messages.schemas import MessageCreate, MessageResponse, ConversationSummary
from app.database import get_supabase
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/conversations", response_model=list[ConversationSummary])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """
    Returns a list of all unique conversations for the current user.
    Each conversation is grouped by book + other user.
    """
    supabase = get_supabase()
    user_id = current_user["id"]

    # Get all messages where user is sender or receiver
    result = supabase.table("messages").select("*").or_(
        f"sender_id.eq.{user_id},receiver_id.eq.{user_id}"
    ).order("created_at", desc=True).execute()

    messages = result.data or []

    # Group conversations by (book_id, other_user_id)
    conversations = {}
    for msg in messages:
        other_user_id = msg["receiver_id"] if msg["sender_id"] == user_id else msg["sender_id"]
        key = f"{msg['book_id']}_{other_user_id}"

        if key not in conversations:
            conversations[key] = {
                "book_id": msg["book_id"],
                "other_user_id": other_user_id,
                "last_message": msg["content"],
                "last_message_time": msg["created_at"],
                "unread_count": 0,
            }

        # Count unread messages (received by current user, not yet read)
        if msg["receiver_id"] == user_id and not msg["is_read"]:
            conversations[key]["unread_count"] += 1

    # Enrich with book title and other user name
    summaries = []
    for key, conv in conversations.items():
        # Get book title
        book_result = supabase.table("books").select("title").eq(
            "id", conv["book_id"]
        ).execute()
        book_title = book_result.data[0]["title"] if book_result.data else "Unknown Book"

        # Get other user name
        user_result = supabase.table("users").select("full_name").eq(
            "id", conv["other_user_id"]
        ).execute()
        other_user_name = user_result.data[0]["full_name"] if user_result.data else "Unknown User"

        summaries.append(ConversationSummary(
            book_id=conv["book_id"],
            book_title=book_title,
            other_user_id=conv["other_user_id"],
            other_user_name=other_user_name,
            last_message=conv["last_message"],
            last_message_time=conv["last_message_time"],
            unread_count=conv["unread_count"],
        ))

    return summaries


@router.get("/{book_id}/{other_user_id}", response_model=list[MessageResponse])
async def get_conversation(
    book_id: str,
    other_user_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Returns all messages in a conversation between the current user
    and another user about a specific book listing.
    Messages are ordered oldest → newest.
    """
    supabase = get_supabase()
    user_id = current_user["id"]

    # Fetch messages in both directions for this book conversation
    result = supabase.table("messages").select("*").eq(
        "book_id", book_id
    ).or_(
        f"and(sender_id.eq.{user_id},receiver_id.eq.{other_user_id}),"
        f"and(sender_id.eq.{other_user_id},receiver_id.eq.{user_id})"
    ).order("created_at", desc=False).execute()

    messages = result.data or []

    # Attach sender info to each message
    enriched = []
    for msg in messages:
        sender_result = supabase.table("users").select("id, full_name").eq(
            "id", msg["sender_id"]
        ).execute()
        msg["sender"] = sender_result.data[0] if sender_result.data else None
        enriched.append(msg)

    # Mark received messages as read
    supabase.table("messages").update({"is_read": True}).eq(
        "book_id", book_id
    ).eq("sender_id", other_user_id).eq("receiver_id", user_id).execute()

    return enriched


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: MessageCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Send a new message in a conversation about a book listing.
    The sender is automatically set to the current authenticated user.
    """
    supabase = get_supabase()

    # Validate that the book exists
    book_result = supabase.table("books").select("id").eq("id", payload.book_id).execute()
    if not book_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book listing not found"
        )

    # Validate that the receiver exists
    receiver_result = supabase.table("users").select("id").eq(
        "id", payload.receiver_id
    ).execute()
    if not receiver_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )

    # Prevent messaging yourself
    if payload.receiver_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a message to yourself"
        )

    # Validate message content
    content = payload.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty"
        )

    # Insert message
    message_data = {
        "book_id": payload.book_id,
        "sender_id": current_user["id"],
        "receiver_id": payload.receiver_id,
        "content": content,
        "is_read": False,
    }

    result = supabase.table("messages").insert(message_data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message"
        )

    msg = result.data[0]

    # Attach sender info
    msg["sender"] = {
        "id": current_user["id"],
        "full_name": current_user["full_name"],
    }

    return msg
