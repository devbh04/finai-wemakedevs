from fastapi import APIRouter, Form, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
import os
import google.generativeai as genai
from typing import Optional
import markdown
import logging

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

templates = Jinja2Templates(directory="chatbot/templates")

# Configure Gemini API
# Make sure to set your GEMINI_API_KEY environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None
    logging.warning("GEMINI_API_KEY not found in environment variables")

@router.get("/")
def index(request: Request):
    """Render the chatbot interface"""
    return templates.TemplateResponse("index.html", {"request": request})

@router.post("/chat")
async def chat_with_markdown(
    markdown_input: str = Form(...),
    user_question: str = Form(...)
):
    """
    Process user question based on provided markdown content using Gemini AI
    """
    try:
        if not model:
            return JSONResponse(
                status_code=500,
                content={"error": "Gemini API key not configured. Please set GEMINI_API_KEY environment variable."}
            )
        
        # Convert markdown to plain text for better understanding
        html_content = markdown.markdown(markdown_input)
        # Remove HTML tags to get clean text
        import re
        clean_text = re.sub('<[^<]+?>', '', html_content)
        
        # Create a more natural conversational prompt for Gemini
        prompt = f"""
        You are a friendly and helpful AI assistant. I'm going to share some content with you, and then ask you a question about it. Please respond naturally and conversationally, like you're having a chat with a friend.

        Here's the content I want you to understand and remember:
        {clean_text}

        Now, my question is: {user_question}

        Please give me a natural, conversational response. Don't format your answer in markdown or use special formatting - just talk to me like a regular conversation. If you can't find the answer in the content I shared, just let me know in a friendly way that you don't see that information in what I provided.
        """
        
        # Generate response using Gemini
        response = model.generate_content(prompt)
        
        return JSONResponse(content={
            "success": True,
            "response": response.text,
            "processed_markdown": html_content
        })
        
    except Exception as e:
        logging.error(f"Error in chat processing: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"An error occurred while processing your request: {str(e)}"
            }
        )

@router.post("/process-markdown")
async def process_markdown_only(
    markdown_input: str = Form(...)
):
    """
    Process markdown content and return HTML preview
    """
    try:
        # Convert markdown to HTML
        html_content = markdown.markdown(markdown_input)
        
        return JSONResponse(content={
            "success": True,
            "html_content": html_content,
            "message": "Markdown processed successfully"
        })
        
    except Exception as e:
        logging.error(f"Error in markdown processing: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"An error occurred while processing markdown: {str(e)}"
            }
        )

@router.get("/health")
async def health_check():
    """Health check for chatbot service"""
    gemini_status = "configured" if model else "not configured"
    return {
        "status": "healthy",
        "gemini_api": gemini_status,
        "service": "chatbot"
    }