"""
messages/schemas.py — Pydantic models for the messaging system.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    """Schema for sending a new message."""
    book_id: str
    receiver_id: str
    content: str

    class Config:
        from_attributes = True


class SenderInfo(BaseModel):
    """Basic sender info embedded in message responses."""
    id: str
    full_name: str


class MessageResponse(BaseModel):
    """Full message response with sender info."""
    id: str
    book_id: str
    sender_id: str
    receiver_id: str
    content: str
    is_read: bool
    created_at: datetime
    sender: Optional[SenderInfo] = None

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    """Summary of a conversation shown in the chat list."""
    book_id: str
    book_title: str
    other_user_id: str
    other_user_name: str
    last_message: str
    last_message_time: datetime
    unread_count: int
