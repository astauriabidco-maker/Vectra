import os
import uuid
from datetime import datetime
from sqlalchemy import create_engine, text

# Get database URL from environment variable
DATABASE_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:password@localhost:5454/vectra")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)


def save_bot_message(conversation_id: str, content_text: str) -> str:
    """
    Save a bot message to the Message table.
    Returns the ID of the created message.
    """
    message_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    with engine.connect() as conn:
        conn.execute(
            text("""
                INSERT INTO "Message" (id, "conversationId", "senderType", "contentText", "createdAt")
                VALUES (:id, :conversation_id, :sender_type, :content_text, :created_at)
            """),
            {
                "id": message_id,
                "conversation_id": conversation_id,
                "sender_type": "BOT",
                "content_text": content_text,
                "created_at": now,
            }
        )
        conn.commit()
    
    return message_id
