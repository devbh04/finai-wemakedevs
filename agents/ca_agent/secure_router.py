"""
Secure Router for CA Agent
Handles encrypted document processing endpoints
"""

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pathlib import Path
import logging

from .utils.encryption_handler import create_encryption_handler

logger = logging.getLogger(__name__)

# Create secure router
secure_router = APIRouter(prefix="/secure", tags=["Secure CA Agent"])

# Create upload directory
SECURE_UPLOAD_DIR = Path("./ca_agent/input_files/encrypted")
SECURE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Initialize encryption handler
encryption_handler = create_encryption_handler(SECURE_UPLOAD_DIR)

@secure_router.post("/upload")
async def secure_upload_documents(
    client_type: str = Form(...),
    files: list[UploadFile] = File(...)
):
    """Upload and encrypt documents - Step 1 of secure flow"""
    try:
        logger.info(f"Secure upload initiated for client_type: {client_type} with {len(files)} files")
        result = await encryption_handler.secure_upload_documents(client_type, files)
        return result
    except Exception as e:
        logger.error(f"Secure upload failed: {e}")
        return JSONResponse(content={
            "status": "error",
            "message": f"Secure upload failed: {str(e)}"
        }, status_code=500)

@secure_router.post("/session/{upload_session_id}/grant")
async def grant_access_and_process(
    upload_session_id: str,
    access_token: str = Form(...),
    client_type: str = Form(...)
):
    """Grant access and process encrypted documents - Optimized single-step flow"""
    try:
        logger.info(f"Processing secure session: {upload_session_id} for client_type: {client_type}")
        
        # Grant access and process in one step using the encryption handler's internal methods
        # First grant access
        access_result = encryption_handler.session_manager.grant_access(upload_session_id, access_token)
        processing_key = access_result['processing_key']
        
        # Then process documents directly
        process_result = await encryption_handler.process_encrypted_documents(
            upload_session_id, 
            processing_key, 
            client_type
        )
        
        return process_result
        
    except Exception as e:
        logger.error(f"Secure processing failed: {e}")
        return JSONResponse(content={
            "status": "error",
            "message": f"Secure processing failed: {str(e)}"
        }, status_code=500)

@secure_router.get("/session/{upload_session_id}/status")
async def get_session_status(upload_session_id: str):
    """Get status of secure session"""
    try:
        # This would check session status in the session manager
        return JSONResponse(content={
            "status": "success",
            "session_id": upload_session_id,
            "message": "Session status retrieved"
        })
    except Exception as e:
        logger.error(f"Failed to get session status: {e}")
        return JSONResponse(content={
            "status": "error",
            "message": f"Failed to retrieve session status: {str(e)}"
        }, status_code=500)

# Health check for secure endpoints
@secure_router.get("/health")
async def secure_health_check():
    """Health check for secure document processing"""
    return {
        "status": "healthy",
        "service": "Secure CA Agent",
        "encryption": "enabled",
        "features": ["document_encryption", "secure_upload", "session_management"]
    }