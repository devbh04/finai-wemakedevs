from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from crew import create_crew
from utils.document_processor import DocumentProcessor
from utils.encryption import DocumentEncryption, encrypt_document, decrypt_document
from utils.s3_storage import S3DocumentStorage, upload_encrypted_file, download_encrypted_file
from utils.session_manager import SessionManager, create_upload_session, grant_session_access, session_manager
import shutil
import os
import tempfile
import json
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=os.getenv('LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

app = FastAPI(title="CA Agent - Secure Document Analysis")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize security components
encryptor = DocumentEncryption()

# Request/Response models
class GrantAccessRequest(BaseModel):
    upload_session_id: str
    access_token: str

class AnalyzeRequest(BaseModel):
    client_type: str
    upload_session_id: str
    processing_key: str

UPLOAD_DIR = Path("./input_files")
UPLOAD_DIR.mkdir(exist_ok=True)

# Static files & templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/create-session")
async def create_session():
    """Create a new upload session for secure file handling"""
    try:
        session_data = create_upload_session()
        logger.info(f"Created new session: {session_data['upload_session_id']}")
        
        return JSONResponse(content={
            "status": "success",
            "session": session_data,
            "message": "Upload session created successfully"
        })
        
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        return JSONResponse(
            content={"error": f"Failed to create session: {str(e)}"}, 
            status_code=500
        )

@app.post("/upload-secure")
async def upload_secure_documents(
    upload_session_id: str = Form(...),
    access_token: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """Upload and encrypt documents to S3"""
    try:
        # Validate session
        if upload_session_id not in session_manager.sessions:
            raise HTTPException(status_code=404, detail="Invalid session ID")
        
        session = session_manager.sessions[upload_session_id]
        if session['access_token'] != access_token:
            raise HTTPException(status_code=403, detail="Invalid access token")
        
        # Initialize S3 storage
        try:
            s3_storage = S3DocumentStorage()
        except Exception as s3_error:
            logger.error(f"S3 initialization failed: {s3_error}")
            return JSONResponse(
                content={"error": f"Storage service unavailable: {str(s3_error)}"}, 
                status_code=503
            )
        
        uploaded_files = []
        
        for file in files:
            try:
                # Read file data
                file_data = await file.read()
                
                # Check file size (10MB limit for free tier)
                max_size = int(os.getenv('MAX_FILE_SIZE_MB', '10')) * 1024 * 1024
                if len(file_data) > max_size:
                    raise ValueError(f"File {file.filename} too large. Max size: {max_size//1024//1024}MB")
                
                # Encrypt file
                encryption_metadata = encrypt_document(file_data)
                
                # Prepare encrypted data for S3 upload
                encrypted_data = encryption_metadata['encrypted_data'].encode('utf-8')
                
                # Upload to S3
                s3_key = s3_storage.upload_encrypted_document(
                    encrypted_data,
                    file.filename,
                    encryption_metadata
                )
                
                # Store file info in session
                session_manager.add_file_to_session(
                    upload_session_id,
                    file.filename,
                    s3_key,
                    encryption_metadata
                )
                
                uploaded_files.append({
                    "filename": file.filename,
                    "s3_key": s3_key,
                    "size": len(file_data),
                    "encrypted": True
                })
                
                logger.info(f"Successfully uploaded and encrypted: {file.filename}")
                
            except Exception as file_error:
                logger.error(f"Failed to process file {file.filename}: {file_error}")
                uploaded_files.append({
                    "filename": file.filename,
                    "error": str(file_error),
                    "uploaded": False
                })
        
        return JSONResponse(content={
            "status": "success",
            "upload_session_id": upload_session_id,
            "uploaded_files": uploaded_files,
            "message": f"Uploaded {len([f for f in uploaded_files if f.get('encrypted')])} files securely"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        return JSONResponse(
            content={"error": f"Upload failed: {str(e)}"}, 
            status_code=500
        )

@app.post("/grant-access")
async def grant_access_to_documents(request: GrantAccessRequest):
    """Grant access to encrypted documents - Critical security checkpoint"""
    try:
        logger.info(f"Access grant requested for session: {request.upload_session_id}")
        
        # Grant access through session manager
        access_result = grant_session_access(request.upload_session_id, request.access_token)
        
        logger.info(f"Access granted for session: {request.upload_session_id}")
        
        return JSONResponse(content={
            "status": "success",
            "access_granted": True,
            "processing_key": access_result['processing_key'],
            "files_count": access_result['files_count'],
            "message": "Access granted successfully. Files are now available for analysis."
        })
        
    except Exception as e:
        logger.error(f"Access grant failed: {e}")
        return JSONResponse(
            content={"error": f"Access denied: {str(e)}"}, 
            status_code=403
        )

@app.post("/analyze-secure")
async def analyze_secure_documents(request: AnalyzeRequest):
    """Analyze documents after access is granted and files are decrypted"""
    try:
        # Check if API key is available
        if not os.environ.get("CEREBRAS_API_KEY"):
            return JSONResponse(
                content={"error": "CEREBRAS_API_KEY not found in environment variables. Please set your Cerebras API key."}, 
                status_code=500
            )
        
        logger.info(f"Analysis requested for session: {request.upload_session_id}")
        
        # Get session files
        session_files = session_manager.get_session_files(request.upload_session_id, request.processing_key)
        
        if not session_files:
            raise ValueError("No files found in session")
        
        # Initialize S3 storage
        s3_storage = S3DocumentStorage()
        
        # Create temporary directory for decrypted files
        with tempfile.TemporaryDirectory() as temp_dir:
            decrypted_files = []
            
            for file_info in session_files:
                try:
                    # Download encrypted file from S3
                    encrypted_data = s3_storage.download_encrypted_document(file_info['s3_key'])
                    
                    # Decrypt file
                    decrypted_data = decrypt_document(file_info['encryption_metadata'])
                    
                    # Save to temporary file
                    temp_file_path = os.path.join(temp_dir, file_info['filename'])
                    with open(temp_file_path, 'wb') as f:
                        f.write(decrypted_data)
                    
                    decrypted_files.append(temp_file_path)
                    logger.info(f"Decrypted file: {file_info['filename']}")
                    
                except Exception as decrypt_error:
                    logger.error(f"Failed to decrypt {file_info['filename']}: {decrypt_error}")
                    continue
            
            if not decrypted_files:
                raise Exception("No files could be decrypted for analysis")
            
            # Process documents
            doc_processor = DocumentProcessor(decrypted_files)
            processed_docs = doc_processor.process_documents()
            
            # Create crew with processed documents
            crew, task_name = create_crew(request.client_type, processed_docs)
            result = crew.kickoff()
            
            # Handle the result properly
            if hasattr(result, 'raw'):
                result_content = result.raw
            elif isinstance(result, str):
                result_content = result
            else:
                result_content = str(result)
            
            # Clean up the result content
            if isinstance(result_content, str):
                result_content = result_content.replace('***', '')
                result_content = result_content.replace('**', '')
                import re
                result_content = re.sub(r'\n{3,}', '\n\n', result_content)
            
            # Save the result to a markdown file
            try:
                from datetime import datetime
                
                markdown_dir = Path("./markdown_files")
                markdown_dir.mkdir(exist_ok=True)
                
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"CA_Report_{request.client_type}_{timestamp}_secure.md"
                file_path = markdown_dir / filename
                
                markdown_content = f"# CA Analysis Report - {request.client_type.title()} (Secure)\n\n"
                markdown_content += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
                markdown_content += f"**Session ID:** {request.upload_session_id}\n\n"
                markdown_content += f"**Task:** {task_name}\n\n"
                markdown_content += f"**Files Analyzed:** {len(decrypted_files)}\n\n"
                markdown_content += "---\n\n"
                markdown_content += result_content
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(markdown_content)
                
                logger.info(f"Report saved to: {file_path}")
                
            except Exception as save_error:
                logger.error(f"Failed to save markdown file: {save_error}")
                markdown_content = result_content
            
            # Clean up session after successful analysis
            session_manager.cleanup_session(request.upload_session_id)
            
            return JSONResponse(content={
                "status": "success",
                "task": task_name,
                "result": result_content,
                "markdown": markdown_content,
                "files_analyzed": len(decrypted_files),
                "file_saved": str(file_path) if 'file_path' in locals() else "Error saving file",
                "message": "Analysis completed successfully. Files have been securely processed and session cleaned up."
            })
    
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return JSONResponse(
            content={"error": f"Analysis failed: {str(e)}"}, 
            status_code=500
        )

# Utility endpoints
@app.get("/session/{upload_session_id}/status")
async def get_session_status(upload_session_id: str):
    """Get session status and file information"""
    try:
        if upload_session_id not in session_manager.sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = session_manager.sessions[upload_session_id]
        
        return JSONResponse(content={
            "upload_session_id": upload_session_id,
            "status": session['status'],
            "created_at": session['created_at'],
            "expires_at": session['expires_at'],
            "files_count": len(session['uploaded_files']),
            "access_granted": session.get('access_granted', False),
            "files": [{"filename": f['filename'], "uploaded_at": f['uploaded_at']} for f in session['uploaded_files']]
        })
        
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)}, 
            status_code=500
        )

@app.post("/cleanup-expired-sessions")
async def cleanup_expired_sessions():
    """Clean up expired sessions (admin endpoint)"""
    try:
        cleaned_count = session_manager.cleanup_expired_sessions()
        return JSONResponse(content={
            "status": "success",
            "cleaned_sessions": cleaned_count,
            "message": f"Cleaned up {cleaned_count} expired sessions"
        })
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)}, 
            status_code=500
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test S3 connectivity
        s3_status = "unknown"
        try:
            s3_storage = S3DocumentStorage()
            s3_status = "connected"
        except Exception:
            s3_status = "disconnected"
        
        return JSONResponse(content={
            "status": "healthy",
            "services": {
                "s3_storage": s3_status,
                "encryption": "available",
                "session_manager": "available"
            },
            "active_sessions": len(session_manager.sessions)
        })
    except Exception as e:
        return JSONResponse(
            content={"status": "unhealthy", "error": str(e)}, 
            status_code=500
        )

# Legacy endpoint for backward compatibility (will redirect to secure flow)
@app.post("/analyze")
async def analyze_documents_legacy(
    client_type: str = Form(...),
    files: list[UploadFile] = File(...)
):
    """Legacy endpoint - redirects to secure flow"""
    return JSONResponse(
        content={
            "error": "This endpoint has been deprecated for security reasons. Please use the secure upload flow.",
            "redirect": "/create-session",
            "message": "Use /create-session → /upload-secure → /grant-access → /analyze-secure"
        }, 
        status_code=410  # Gone
    )
