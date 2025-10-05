"""
AWS S3 utilities for secure document storage
Implements S3 operations with encryption support for financial documents
Uses AWS Free Tier compatible settings
"""

import boto3
import json
import os
import tempfile
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from the main .env file
ROOT = Path(__file__).parent.parent.parent  # Go up to agents/ folder
load_dotenv(ROOT / ".env")

logger = logging.getLogger(__name__)

class S3DocumentStorage:
    def __init__(self):
        """Initialize S3 client with AWS credentials from environment"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_REGION', 'us-east-1')  # Free tier regions
            )
            self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME', 'finai-encrypted-documents')
            
            # Ensure bucket exists (will be created if it doesn't exist)
            self._ensure_bucket_exists()
            
        except NoCredentialsError:
            logger.error("AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY")
            raise Exception("AWS credentials not configured")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            raise Exception(f"S3 initialization failed: {str(e)}")
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist (Free Tier compatible)"""
        try:
            # Check if bucket exists
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"Bucket {self.bucket_name} exists and is accessible")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                # Bucket doesn't exist, create it
                try:
                    region = os.getenv('AWS_REGION', 'us-east-1')
                    if region == 'us-east-1':
                        # us-east-1 doesn't need LocationConstraint
                        self.s3_client.create_bucket(Bucket=self.bucket_name)
                    else:
                        self.s3_client.create_bucket(
                            Bucket=self.bucket_name,
                            CreateBucketConfiguration={'LocationConstraint': region}
                        )
                    
                    # Set bucket lifecycle policy to automatically delete objects after 30 days (Free Tier optimization)
                    lifecycle_policy = {
                        'Rules': [
                            {
                                'ID': 'DeleteEncryptedDocuments',
                                'Status': 'Enabled',
                                'Expiration': {'Days': 30},
                                'Filter': {'Prefix': 'encrypted/'}
                            }
                        ]
                    }
                    
                    self.s3_client.put_bucket_lifecycle_configuration(
                        Bucket=self.bucket_name,
                        LifecycleConfiguration=lifecycle_policy
                    )
                    
                    logger.info(f"Created bucket {self.bucket_name} with lifecycle policy")
                    
                except ClientError as create_error:
                    logger.error(f"Failed to create bucket: {create_error}")
                    raise Exception(f"Cannot create S3 bucket: {create_error}")
            else:
                logger.error(f"Cannot access bucket: {e}")
                raise Exception(f"S3 bucket access error: {e}")
    
    def upload_encrypted_document(self, encrypted_data: bytes, file_key: str, metadata: Dict[str, Any]) -> str:
        """
        Upload encrypted document to S3
        Returns S3 object key
        """
        try:
            # Create unique object key
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            object_key = f"encrypted/{timestamp}_{file_key}"
            
            # Prepare metadata for S3
            s3_metadata = {
                'content-type': 'application/octet-stream',
                'upload-timestamp': datetime.now().isoformat(),
                'encryption-algorithm': metadata.get('algorithm', 'AES-256-CBC'),
                'original-filename': file_key,
                'file-status': 'encrypted'
            }
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=encrypted_data,
                Metadata=s3_metadata,
                ServerSideEncryption='AES256'  # Additional S3-level encryption
            )
            
            logger.info(f"Uploaded encrypted document: {object_key}")
            return object_key
            
        except ClientError as e:
            logger.error(f"Failed to upload to S3: {e}")
            raise Exception(f"S3 upload failed: {e}")
    
    def download_encrypted_document(self, object_key: str) -> bytes:
        """
        Download encrypted document from S3
        Returns encrypted data bytes
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            
            encrypted_data = response['Body'].read()
            logger.info(f"Downloaded encrypted document: {object_key}")
            return encrypted_data
            
        except ClientError as e:
            logger.error(f"Failed to download from S3: {e}")
            raise Exception(f"S3 download failed: {e}")
    
    def delete_document(self, object_key: str) -> bool:
        """Delete document from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            logger.info(f"Deleted document: {object_key}")
            return True
            
        except ClientError as e:
            logger.error(f"Failed to delete from S3: {e}")
            return False
    
    def generate_presigned_url(self, object_key: str, expiration: int = 3600) -> str:
        """
        Generate presigned URL for secure access
        URL expires after specified time (default 1 hour)
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_key},
                ExpiresIn=expiration
            )
            return url
            
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            raise Exception(f"Presigned URL generation failed: {e}")
    
    def list_user_documents(self, user_session: str) -> list:
        """List all documents for a user session"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=f"encrypted/"
            )
            
            documents = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    # Get object metadata
                    head_response = self.s3_client.head_object(
                        Bucket=self.bucket_name,
                        Key=obj['Key']
                    )
                    
                    documents.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat(),
                        'metadata': head_response.get('Metadata', {})
                    })
            
            return documents
            
        except ClientError as e:
            logger.error(f"Failed to list documents: {e}")
            return []

# Utility functions
def get_s3_storage() -> S3DocumentStorage:
    """Get S3 storage instance"""
    return S3DocumentStorage()

def upload_encrypted_file(encrypted_data: bytes, filename: str, metadata: dict) -> str:
    """Convenience function to upload encrypted file"""
    storage = get_s3_storage()
    return storage.upload_encrypted_document(encrypted_data, filename, metadata)

def download_encrypted_file(object_key: str) -> bytes:
    """Convenience function to download encrypted file"""
    storage = get_s3_storage()
    return storage.download_encrypted_document(object_key)