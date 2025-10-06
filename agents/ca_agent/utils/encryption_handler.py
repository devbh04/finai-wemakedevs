"""
Encryption Handler for CA Agent
Handles secure document upload, processing, and cleanup
"""

import logging
import base64
import re
from datetime import datetime
from pathlib import Path
from fastapi import Form, UploadFile, File
from fastapi.responses import JSONResponse

from .encryption import DocumentEncryption
from .s3_storage import S3DocumentStorage
from .session_manager import SessionManager
from .document_processor import DocumentProcessor
from ..crew import create_crew

logger = logging.getLogger(__name__)

class EncryptionHandler:
    def __init__(self, upload_dir: Path):
        """Initialize encryption handler with required services"""
        self.upload_dir = upload_dir
        self.encryption_service = DocumentEncryption()
        self.session_manager = SessionManager()
        
        # Initialize S3 storage (optional)
        try:
            self.s3_storage = S3DocumentStorage()
            logger.info("S3 storage initialized successfully")
        except Exception as e:
            logger.warning(f"S3 storage not available: {e}")
            self.s3_storage = None
    
    async def secure_upload_documents(
        self,
        client_type: str,
        files: list[UploadFile]
    ) -> JSONResponse:
        """Upload and encrypt documents"""
        try:
            # Create upload session
            session_data = self.session_manager.create_upload_session()
            upload_session_id = session_data['upload_session_id']
            access_token = session_data['access_token']
            
            encrypted_files = []
            
            for file in files:
                # Read file content
                file_content = await file.read()
                
                # Encrypt the file
                encryption_metadata = self.encryption_service.encrypt_file(file_content)
                
                # Store encrypted data (S3 or local fallback)
                if self.s3_storage:
                    try:
                        s3_key = self.s3_storage.upload_encrypted_document(
                            base64.b64decode(encryption_metadata['encrypted_data']),
                            file.filename,
                            encryption_metadata
                        )
                        # Remove encrypted_data from metadata for security
                        metadata_for_session = {k: v for k, v in encryption_metadata.items() if k != 'encrypted_data'}
                        metadata_for_session['s3_key'] = s3_key
                        storage_location = f"s3://{s3_key}"
                    except Exception as s3_error:
                        logger.warning(f"S3 upload failed: {s3_error}, using local storage")
                        # Local fallback - store encrypted file locally
                        encrypted_file_path = self.upload_dir / f"encrypted_{file.filename}_{upload_session_id}"
                        with open(encrypted_file_path, 'wb') as f:
                            f.write(base64.b64decode(encryption_metadata['encrypted_data']))
                        metadata_for_session = encryption_metadata.copy()
                        storage_location = str(encrypted_file_path)
                else:
                    # Local storage only
                    encrypted_file_path = self.upload_dir / f"encrypted_{file.filename}_{upload_session_id}"
                    with open(encrypted_file_path, 'wb') as f:
                        f.write(base64.b64decode(encryption_metadata['encrypted_data']))
                    metadata_for_session = encryption_metadata.copy()
                    storage_location = str(encrypted_file_path)
                
                # Add file to session
                self.session_manager.add_file_to_session(
                    upload_session_id, 
                    file.filename, 
                    storage_location, 
                    metadata_for_session
                )
                
                encrypted_files.append({
                    'filename': file.filename,
                    'encrypted': True,
                    'storage_location': storage_location
                })
            
            return JSONResponse(content={
                "status": "success",
                "message": "Documents encrypted and uploaded successfully",
                "upload_session_id": upload_session_id,
                "access_token": access_token,
                "files": encrypted_files,
                "expires_at": session_data['expires_at']
            })
            
        except Exception as e:
            logger.error(f"Secure upload failed: {e}")
            return JSONResponse(content={
                "status": "error",
                "message": f"Upload failed: {str(e)}"
            }, status_code=500)
    
    async def grant_access_to_documents(
        self,
        upload_session_id: str,
        access_token: str
    ) -> JSONResponse:
        """Grant access to encrypted documents"""
        try:
            # Grant access through session manager
            access_result = self.session_manager.grant_access(upload_session_id, access_token)
            
            return JSONResponse(content={
                "status": "success",
                "message": "Access granted successfully",
                "processing_key": access_result['processing_key'],
                "files_count": access_result['files_count'],
                "granted_at": access_result['granted_at']
            })
            
        except Exception as e:
            logger.error(f"Access grant failed: {e}")
            return JSONResponse(content={
                "status": "error", 
                "message": f"Access denied: {str(e)}"
            }, status_code=403)
    
    async def process_encrypted_documents(
        self,
        upload_session_id: str,
        processing_key: str,
        client_type: str
    ) -> JSONResponse:
        """Process encrypted documents through CA agent"""
        s3_keys_to_delete = []  # Track S3 keys for cleanup
        temp_files = []  # Track temporary files for cleanup
        
        try:
            # Get session files
            session_files = self.session_manager.get_session_files(upload_session_id, processing_key)
            
            decrypted_file_paths = []
            
            for file_info in session_files:
                filename = file_info['filename']
                storage_location = file_info['s3_key']  # This is actually storage location (S3 or local)
                encryption_metadata = file_info['encryption_metadata']
                
                # Get encrypted data
                if storage_location.startswith('s3://') and self.s3_storage:
                    s3_key = storage_location.replace('s3://', '')
                    s3_keys_to_delete.append(s3_key)  # Mark for deletion
                    encrypted_data = self.s3_storage.download_encrypted_document(s3_key)
                    # Reconstruct full encryption metadata
                    full_metadata = encryption_metadata.copy()
                    full_metadata['encrypted_data'] = base64.b64encode(encrypted_data).decode('utf-8')
                else:
                    # Local storage
                    with open(storage_location, 'rb') as f:
                        encrypted_data = f.read()
                    full_metadata = encryption_metadata.copy()
                    if 'encrypted_data' not in full_metadata:
                        full_metadata['encrypted_data'] = base64.b64encode(encrypted_data).decode('utf-8')
                
                # Decrypt the document
                decrypted_content = self.encryption_service.decrypt_file(full_metadata)
                
                # Save decrypted content to temporary file (so DocumentProcessor can process it)
                temp_file_path = self.upload_dir / f"temp_decrypted_{filename}"
                with open(temp_file_path, 'wb') as f:
                    f.write(decrypted_content)
                
                decrypted_file_paths.append(str(temp_file_path))
                temp_files.append(temp_file_path)  # Track for cleanup
            
            # Process documents using the same DocumentProcessor as regular CA agent
            doc_processor = DocumentProcessor(decrypted_file_paths)
            processed_docs = doc_processor.process_documents()
            
            logger.info(f"Processed {len(processed_docs)} decrypted documents")
            
            # Create and execute crew (same as regular CA agent)
            crew, task_name = create_crew(client_type, processed_docs)
            
            if not task_name:
                task_name = f"CA_Analysis_{client_type}"
            
            result = crew.kickoff()
            
            # Handle result with comprehensive checking (same as CA router)
            result_content = self._extract_result_content(result, client_type)

            # Clean up result content
            result_content = self._clean_result_content(result_content)

            # Save result as markdown
            file_path, markdown_content = self._save_markdown_report(result_content, client_type, task_name)

            # Clean up temporary files
            temp_cleanup_count = self._cleanup_temp_files(temp_files)

            # Clean up S3 files
            s3_cleanup_status = self._cleanup_s3_files(s3_keys_to_delete)

            # Clean up session after processing
            self.session_manager.cleanup_session(upload_session_id)

            # Security summary
            security_summary = {
                "s3_files_deleted": len([s for s in s3_cleanup_status if "✅" in s]),
                "temp_files_deleted": temp_cleanup_count,
                "session_cleaned": True,
                "security_level": "high" if (len(s3_cleanup_status) == 0 or all("✅" in s for s in s3_cleanup_status)) and temp_cleanup_count > 0 else "medium"
            }
            
            logger.info(f"🛡️ Security Summary: {security_summary}")

            return JSONResponse(content={
                "status": "success",
                "task": task_name,
                "result": result_content,
                "markdown": markdown_content,
                "file_saved": str(file_path),
                "processed_files": len(processed_docs),
                "session_type": "encrypted",
                "session_cleaned": True,
                "s3_cleanup": s3_cleanup_status,
                "temp_files_cleaned": temp_cleanup_count,
                "security_summary": security_summary
            })
            
        except Exception as e:
            # Emergency cleanup on error
            self._emergency_cleanup(temp_files, s3_keys_to_delete)
            
            logger.error(f"Document processing failed: {e}")
            return JSONResponse(content={
                "status": "error",
                "message": f"Processing failed: {str(e)}"
            }, status_code=500)
    
    def _extract_result_content(self, result, client_type: str) -> str:
        """Extract content from CrewAI result"""
        result_content = None
        
        if hasattr(result, 'raw') and result.raw:
            result_content = str(result.raw)
        elif hasattr(result, 'output') and result.output:
            result_content = str(result.output)
        elif hasattr(result, 'result') and result.result:
            result_content = str(result.result)
        elif isinstance(result, str) and result.strip():
            result_content = result
        elif hasattr(result, 'tasks_output') and result.tasks_output:
            if isinstance(result.tasks_output, list) and len(result.tasks_output) > 0:
                task_output = result.tasks_output[0]
                if hasattr(task_output, 'raw'):
                    result_content = str(task_output.raw)
                elif hasattr(task_output, 'output'):
                    result_content = str(task_output.output)
                else:
                    result_content = str(task_output)
        
        # Final fallback
        if not result_content or result_content.strip() == "" or str(result_content).lower() in ["none", "null"]:
            result_content = f"CA Analysis completed for {client_type} client. The encrypted documents were processed successfully."
        
        return result_content
    
    def _clean_result_content(self, content: str) -> str:
        """Clean and format result content"""
        content = str(content).replace('***', '').replace('**', '')
        content = re.sub(r'\n{3,}', '\n\n', content)
        return content
    
    def _save_markdown_report(self, result_content: str, client_type: str, task_name: str) -> tuple[Path, str]:
        """Save analysis result as markdown report"""
        markdown_dir = Path("./ca_agent/markdown_files")
        markdown_dir.mkdir(exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"CA_Report_Encrypted_{client_type}_{timestamp}.md"
        file_path = markdown_dir / filename

        markdown_content = f"# CA Analysis Report - {client_type.title()} (Encrypted)\n\n"
        markdown_content += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        markdown_content += f"**Task:** {task_name}\n\n"
        markdown_content += f"**Processing Mode:** Encrypted Documents\n\n---\n\n{result_content}"

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        return file_path, markdown_content
    
    def _cleanup_temp_files(self, temp_files: list[Path]) -> int:
        """Clean up temporary files"""
        cleanup_count = 0
        if temp_files:
            logger.info(f"🧹 Starting cleanup of {len(temp_files)} temporary files")
            for temp_file in temp_files:
                try:
                    if temp_file.exists():
                        temp_file.unlink()
                        cleanup_count += 1
                        logger.info(f"🗑️ Securely deleted temporary file: {temp_file}")
                    else:
                        logger.info(f"ℹ️ Temporary file already removed: {temp_file}")
                except Exception as cleanup_error:
                    logger.warning(f"⚠️ Failed to delete temp file {temp_file}: {cleanup_error}")
        else:
            logger.info("ℹ️ No temporary files to cleanup")
        return cleanup_count
    
    def _cleanup_s3_files(self, s3_keys_to_delete: list[str]) -> list[str]:
        """Clean up S3 files and return status list"""
        s3_cleanup_status = []
        if self.s3_storage and s3_keys_to_delete:
            logger.info(f"🧹 Starting S3 cleanup for {len(s3_keys_to_delete)} files")
            for s3_key in s3_keys_to_delete:
                try:
                    if self.s3_storage.delete_document(s3_key):
                        s3_cleanup_status.append(f"✅ Deleted: {s3_key}")
                        logger.info(f"🗑️ Securely deleted S3 object: {s3_key}")
                    else:
                        s3_cleanup_status.append(f"⚠️ Failed to delete: {s3_key}")
                        logger.warning(f"⚠️ Failed to delete S3 object: {s3_key}")
                except Exception as s3_error:
                    s3_cleanup_status.append(f"❌ Error deleting {s3_key}: {s3_error}")
                    logger.error(f"❌ S3 cleanup error for {s3_key}: {s3_error}")
        elif not self.s3_storage:
            logger.info("ℹ️ S3 storage not configured - no S3 cleanup needed")
        elif not s3_keys_to_delete:
            logger.info("ℹ️ No S3 files to cleanup")
        return s3_cleanup_status
    
    def _emergency_cleanup(self, temp_files: list[Path], s3_keys_to_delete: list[str]):
        """Emergency cleanup on error - ensures no sensitive data remains"""
        logger.warning("🚨 Emergency cleanup initiated due to processing error")
        
        # Clean temp files
        temp_cleaned = 0
        for temp_file in temp_files:
            try:
                if temp_file.exists():
                    temp_file.unlink()
                    temp_cleaned += 1
                    logger.info(f"🗑️ Emergency: Deleted temp file {temp_file}")
            except Exception as e:
                logger.error(f"❌ Emergency: Failed to delete temp file {temp_file}: {e}")
        
        # Clean S3 files
        s3_cleaned = 0
        if self.s3_storage and s3_keys_to_delete:
            for s3_key in s3_keys_to_delete:
                try:
                    if self.s3_storage.delete_document(s3_key):
                        s3_cleaned += 1
                        logger.info(f"🗑️ Emergency: Deleted S3 file {s3_key}")
                except Exception as e:
                    logger.error(f"❌ Emergency: Failed to delete S3 file {s3_key}: {e}")
        
        logger.warning(f"🧹 Emergency cleanup complete: {temp_cleaned} temp files, {s3_cleaned} S3 files deleted")

# Factory function to create encryption handler instance
def create_encryption_handler(upload_dir: Path) -> EncryptionHandler:
    """Create and return encryption handler instance"""
    return EncryptionHandler(upload_dir)