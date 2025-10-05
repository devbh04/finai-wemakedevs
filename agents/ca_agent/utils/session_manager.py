"""
Session management for secure document access
Handles grant access flow and session key management
"""

import json
import os
import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)

class SessionManager:
    def __init__(self):
        """Initialize session manager with in-memory storage (for production, use Redis/database)"""
        self.sessions = {}  # In production, use Redis or database
        self.encryption_keys = {}  # Store encryption metadata temporarily
        self.session_timeout = 3600  # 1 hour timeout
    
    def create_upload_session(self, user_id: str = None) -> Dict[str, str]:
        """
        Create a new upload session
        Returns session data with upload_session_id and access_token
        """
        try:
            # Generate unique session ID
            upload_session_id = f"upload_{secrets.token_urlsafe(16)}"
            access_token = secrets.token_urlsafe(32)
            
            # Create session data
            session_data = {
                'upload_session_id': upload_session_id,
                'access_token': access_token,
                'user_id': user_id or f"user_{secrets.token_urlsafe(8)}",
                'created_at': datetime.now().isoformat(),
                'status': 'created',
                'uploaded_files': [],
                'encryption_metadata': {},
                'access_granted': False,
                'expires_at': (datetime.now() + timedelta(hours=2)).isoformat()
            }
            
            # Store session
            self.sessions[upload_session_id] = session_data
            
            logger.info(f"Created upload session: {upload_session_id}")
            return {
                'upload_session_id': upload_session_id,
                'access_token': access_token,
                'expires_at': session_data['expires_at']
            }
            
        except Exception as e:
            logger.error(f"Failed to create upload session: {e}")
            raise Exception(f"Session creation failed: {e}")
    
    def add_file_to_session(self, upload_session_id: str, filename: str, s3_key: str, encryption_metadata: Dict) -> bool:
        """Add uploaded file information to session"""
        try:
            if upload_session_id not in self.sessions:
                raise ValueError("Invalid session ID")
            
            session = self.sessions[upload_session_id]
            
            # Add file info
            file_info = {
                'filename': filename,
                's3_key': s3_key,
                'uploaded_at': datetime.now().isoformat(),
                'encryption_metadata': encryption_metadata
            }
            
            session['uploaded_files'].append(file_info)
            session['status'] = 'files_uploaded'
            
            logger.info(f"Added file to session {upload_session_id}: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add file to session: {e}")
            return False
    
    def grant_access(self, upload_session_id: str, access_token: str) -> Dict[str, Any]:
        """
        Grant access to encrypted files
        This is the critical security checkpoint
        """
        try:
            if upload_session_id not in self.sessions:
                raise ValueError("Invalid session ID")
            
            session = self.sessions[upload_session_id]
            
            # Verify access token
            if session['access_token'] != access_token:
                raise ValueError("Invalid access token")
            
            # Check session expiry
            expires_at = datetime.fromisoformat(session['expires_at'])
            if datetime.now() > expires_at:
                raise ValueError("Session expired")
            
            # Grant access
            session['access_granted'] = True
            session['access_granted_at'] = datetime.now().isoformat()
            session['status'] = 'access_granted'
            
            # Generate processing session key (different from access token)
            processing_key = secrets.token_urlsafe(32)
            session['processing_key'] = processing_key
            
            logger.info(f"Access granted for session: {upload_session_id}")
            
            return {
                'status': 'access_granted',
                'processing_key': processing_key,
                'files_count': len(session['uploaded_files']),
                'granted_at': session['access_granted_at']
            }
            
        except Exception as e:
            logger.error(f"Failed to grant access: {e}")
            raise Exception(f"Access grant failed: {e}")
    
    def get_session_files(self, upload_session_id: str, processing_key: str = None) -> list:
        """Get list of files in session (requires processing key if access was granted)"""
        try:
            if upload_session_id not in self.sessions:
                raise ValueError("Invalid session ID")
            
            session = self.sessions[upload_session_id]
            
            # If access was granted, require processing key
            if session.get('access_granted') and processing_key != session.get('processing_key'):
                raise ValueError("Invalid processing key")
            
            return session['uploaded_files']
            
        except Exception as e:
            logger.error(f"Failed to get session files: {e}")
            raise Exception(f"Failed to retrieve session files: {e}")
    
    def get_file_encryption_metadata(self, upload_session_id: str, filename: str, processing_key: str) -> Dict:
        """Get encryption metadata for a specific file"""
        try:
            files = self.get_session_files(upload_session_id, processing_key)
            
            for file_info in files:
                if file_info['filename'] == filename:
                    return file_info['encryption_metadata']
            
            raise ValueError(f"File not found: {filename}")
            
        except Exception as e:
            logger.error(f"Failed to get encryption metadata: {e}")
            raise Exception(f"Encryption metadata retrieval failed: {e}")
    
    def cleanup_session(self, upload_session_id: str) -> bool:
        """Clean up session data"""
        try:
            if upload_session_id in self.sessions:
                del self.sessions[upload_session_id]
                logger.info(f"Cleaned up session: {upload_session_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to cleanup session: {e}")
            return False
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        try:
            current_time = datetime.now()
            expired_sessions = []
            
            for session_id, session_data in self.sessions.items():
                expires_at = datetime.fromisoformat(session_data['expires_at'])
                if current_time > expires_at:
                    expired_sessions.append(session_id)
            
            for session_id in expired_sessions:
                del self.sessions[session_id]
                logger.info(f"Cleaned up expired session: {session_id}")
            
            return len(expired_sessions)
            
        except Exception as e:
            logger.error(f"Failed to cleanup expired sessions: {e}")
            return 0

# Global session manager instance
session_manager = SessionManager()

# Utility functions
def create_upload_session(user_id: str = None) -> Dict[str, str]:
    """Create new upload session"""
    return session_manager.create_upload_session(user_id)

def grant_session_access(upload_session_id: str, access_token: str) -> Dict[str, Any]:
    """Grant access to session files"""
    return session_manager.grant_access(upload_session_id, access_token)

def get_session_files_list(upload_session_id: str, processing_key: str = None) -> list:
    """Get files in session"""
    return session_manager.get_session_files(upload_session_id, processing_key)