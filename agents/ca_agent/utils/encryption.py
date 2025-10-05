"""
AES Encryption/Decryption utilities for securing financial documents
Implements AES-256-CBC encryption with secure key and IV generation
"""

import os
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import secrets
import json

class DocumentEncryption:
    def __init__(self):
        self.backend = default_backend()
        self.key_size = 32  # 256 bits for AES-256
        self.iv_size = 16   # 128 bits for CBC mode
        self.salt_size = 16 # 128 bits for key derivation
    
    def generate_key_from_password(self, password: str, salt: bytes = None) -> tuple[bytes, bytes]:
        """
        Generate AES key from password using PBKDF2
        Returns (key, salt) tuple
        """
        if salt is None:
            salt = os.urandom(self.salt_size)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=self.key_size,
            salt=salt,
            iterations=100000,  # OWASP recommended minimum
            backend=self.backend
        )
        key = kdf.derive(password.encode('utf-8'))
        return key, salt
    
    def encrypt_file(self, file_data: bytes, password: str = None) -> dict:
        """
        Encrypt file data with AES-256-CBC
        Returns dict with encrypted data, salt, iv, and metadata
        """
        try:
            # Generate random password if not provided
            if password is None:
                password = secrets.token_urlsafe(32)
            
            # Generate key and salt
            key, salt = self.generate_key_from_password(password)
            
            # Generate random IV
            iv = os.urandom(self.iv_size)
            
            # Pad the data
            padder = padding.PKCS7(128).padder()
            padded_data = padder.update(file_data)
            padded_data += padder.finalize()
            
            # Encrypt
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=self.backend)
            encryptor = cipher.encryptor()
            encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
            
            # Create metadata
            encryption_metadata = {
                'encrypted_data': base64.b64encode(encrypted_data).decode('utf-8'),
                'salt': base64.b64encode(salt).decode('utf-8'),
                'iv': base64.b64encode(iv).decode('utf-8'),
                'password': password,  # In production, this should be handled separately
                'algorithm': 'AES-256-CBC',
                'key_derivation': 'PBKDF2-SHA256',
                'iterations': 100000,
                'original_size': len(file_data)
            }
            
            return encryption_metadata
            
        except Exception as e:
            raise Exception(f"Encryption failed: {str(e)}")
    
    def decrypt_file(self, encryption_metadata: dict, password: str = None) -> bytes:
        """
        Decrypt file data using provided metadata and password
        Returns original file data
        """
        try:
            # Extract metadata
            encrypted_data = base64.b64decode(encryption_metadata['encrypted_data'])
            salt = base64.b64decode(encryption_metadata['salt'])
            iv = base64.b64decode(encryption_metadata['iv'])
            
            # Use provided password or from metadata (for testing)
            if password is None:
                password = encryption_metadata.get('password')
            
            if not password:
                raise ValueError("Password required for decryption")
            
            # Recreate key
            key, _ = self.generate_key_from_password(password, salt)
            
            # Decrypt
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=self.backend)
            decryptor = cipher.decryptor()
            padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
            
            # Remove padding
            unpadder = padding.PKCS7(128).unpadder()
            file_data = unpadder.update(padded_data)
            file_data += unpadder.finalize()
            
            return file_data
            
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")
    
    def create_secure_session_key(self) -> str:
        """Generate secure session key for grant access flow"""
        return secrets.token_urlsafe(32)
    
    def hash_session_key(self, session_key: str) -> str:
        """Create hash of session key for verification"""
        return hashlib.sha256(session_key.encode()).hexdigest()

# Utility functions for backward compatibility
def encrypt_document(file_data: bytes, password: str = None) -> dict:
    """Convenience function for document encryption"""
    encryptor = DocumentEncryption()
    return encryptor.encrypt_file(file_data, password)

def decrypt_document(encryption_metadata: dict, password: str = None) -> bytes:
    """Convenience function for document decryption"""
    encryptor = DocumentEncryption()
    return encryptor.decrypt_file(encryption_metadata, password)