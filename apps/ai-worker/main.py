import asyncio
import json
import logging
import os
import redis.asyncio as redis
import redis as sync_redis
from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
from twilio.rest import Client
from langchain_google_genai import ChatGoogleGenerativeAI

from database import save_bot_message

from business_context import COMPANY_KNOWLEDGE

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

REDIS_URL = "redis://localhost:6399"
QUEUE_NAME = "vectra_ai_queue"

load_dotenv()
logging.info("✅ Business Context Loaded")

# Initialize Twilio Client
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_client = Client(account_sid, auth_token) if account_sid and auth_token else None

def generate_ai_response(user_text: str) -> str:
    """
    Generate AI response using Google Gemini.
    """
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return "⚠️ Error: GOOGLE_API_KEY is not set in environment."

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
            google_api_key=api_key,
            convert_system_message_to_human=True
        )
        
        messages = [
            ("system", f"Context:\n{COMPANY_KNOWLEDGE}\n\nYou are Vectra, follow the rules above strictly. Be concise."),
            ("human", user_text),
        ]
        
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        logging.error(f"❌ Gemini Error: {e}")
        return "⚠️ I am having trouble connecting to my brain right now."

def send_whatsapp_message(to_number: str, body_text: str):
    """
    Send a WhatsApp message via Twilio.
    """
    try:
        if not twilio_client:
            logging.error("⚠️ Twilio client not initialized.")
            return

        from_number = os.getenv("TWILIO_PHONE_NUMBER")
        if not from_number:
            logging.error("⚠️ TWILIO_PHONE_NUMBER not set.")
            return

        # Normalize to_number: ensure it's a string, strip spaces, and handle prefix
        to_number = str(to_number).strip()
        
        # If it already has 'whatsapp:', pull out the number part to normalize it
        if to_number.startswith("whatsapp:"):
            clean_number = to_number.replace("whatsapp:", "").strip()
        else:
            clean_number = to_number

        # Ensure the number has a '+' if it looks like an international number
        if not clean_number.startswith("+"):
            # If it starts with a 33 or 237 etc without +, add it
            # This is a bit of a heuristic, but usually safer
            clean_number = "+" + clean_number

        final_to = f"whatsapp:{clean_number}"
        logging.info(f"📤 Sending WhatsApp to: {final_to}")

        message = twilio_client.messages.create(
            from_=from_number,
            body=body_text,
            to=final_to
        )
        logging.info(f"🚀 Message sent to Twilio! SID: {message.sid}")
        
        # Publish Real-Time Event for the dashboard
        r = sync_redis.Redis(host='localhost', port=6399, decode_responses=True)
        r.publish('vectra_events', json.dumps({'type': 'message_received', 'data': {'senderType': 'BOT', 'contentText': body_text}}))
        
    except Exception as e:
        logging.error(f"❌ Failed to send WhatsApp message: {e}")

async def process_job(job_data):
    """
    Process a job from the Redis queue.
    """
    user_text = job_data.get('text', '')
    conversation_id = job_data.get('conversationId')
    user_phone = job_data.get('userPhone')
    
    logging.info(f"🤖 AI Processing message: {user_text} from {user_phone}")
    
    if not conversation_id:
        logging.error("❌ No conversationId in job, skipping...")
        return
    
    # 1. Generate AI response
    bot_reply = generate_ai_response(user_text)
    
    # 2. Save bot reply to database
    try:
        message_id = save_bot_message(conversation_id, bot_reply)
        logging.info(f"✅ Bot reply saved to DB (messageId: {message_id})")
        
        # 3. Send via Twilio
        if user_phone:
            send_whatsapp_message(user_phone, bot_reply)
        else:
            logging.warning("⚠️ No userPhone provided, skipping Twilio send.")
            
    except Exception as e:
        logging.error(f"❌ Failed to process job fully: {e}")

async def worker_loop():
    """
    Continuous loop to fetch jobs from Redis.
    """
    r = redis.from_url(REDIS_URL, decode_responses=True)
    logging.info(f"Worker connected to Redis at {REDIS_URL}")
    
    while True:
        try:
            result = await r.blpop(QUEUE_NAME, timeout=0) 
            
            if result:
                _, message_json = result
                try:
                    job_data = json.loads(message_json)
                    await process_job(job_data)
                except json.JSONDecodeError:
                    logging.error(f"Failed to decode message: {message_json}")
                except Exception as e:
                    logging.error(f"Error processing job: {e}")
                    
        except Exception as e:
            logging.error(f"Redis worker error: {e}")
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(worker_loop())

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
