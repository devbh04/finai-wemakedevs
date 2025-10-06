"""
Debug S3 Upload in Encryption Handler
Tests the encryption handler's S3 initialization and upload process
"""

import asyncio
import sys
from pathlib import Path
import io
from fastapi import UploadFile

# Add the agents directory to the path
sys.path.append(str(Path(__file__).parent))

from ca_agent.utils.encryption_handler import create_encryption_handler
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_encryption_handler_s3():
    """Debug the encryption handler's S3 functionality"""
    logger.info("🔍 Debugging Encryption Handler S3 Integration")
    
    try:
        # Create encryption handler
        upload_dir = Path("./test_debug_uploads")
        upload_dir.mkdir(exist_ok=True)
        
        logger.info("📝 Creating encryption handler...")
        encryption_handler = create_encryption_handler(upload_dir)
        
        # Check if S3 storage is initialized
        logger.info(f"🔍 S3 storage object: {encryption_handler.s3_storage}")
        logger.info(f"🔍 S3 storage type: {type(encryption_handler.s3_storage)}")
        
        if encryption_handler.s3_storage:
            logger.info("✅ S3 storage is initialized in encryption handler")
            logger.info(f"📁 Bucket name: {encryption_handler.s3_storage.bucket_name}")
        else:
            logger.error("❌ S3 storage is NOT initialized in encryption handler")
            return False
        
        # Create a test file
        logger.info("📄 Creating test file...")
        test_content = "Test financial document for S3 upload verification\nConfidential data that needs encryption."
        content_bytes = test_content.encode('utf-8')
        
        file_obj = io.BytesIO(content_bytes)
        upload_file = UploadFile(
            filename="test_financial_doc.txt",
            file=file_obj,
            size=len(content_bytes)
        )
        
        # Test the secure upload process
        logger.info("🔒 Testing secure upload process...")
        result = await encryption_handler.secure_upload_documents(
            client_type="business",
            files=[upload_file]
        )
        
        logger.info(f"📊 Upload result status: {result.status_code}")
        
        if result.status_code == 200:
            # Extract response data
            import json
            response_body = result.body.decode() if hasattr(result, 'body') else str(result)
            try:
                response_data = json.loads(response_body)
                logger.info("✅ Upload successful!")
                logger.info(f"📋 Session ID: {response_data.get('upload_session_id', 'N/A')}")
                logger.info(f"📋 Files uploaded: {len(response_data.get('files', []))}")
                
                for file_info in response_data.get('files', []):
                    storage_location = file_info.get('storage_location', 'Unknown')
                    logger.info(f"📍 File location: {storage_location}")
                    
                    if storage_location.startswith('s3://'):
                        logger.info("✅ File was uploaded to S3!")
                        return True
                    else:
                        logger.warning("⚠️ File was stored locally, not in S3")
                        logger.warning(f"   Location: {storage_location}")
                        return False
                        
            except json.JSONDecodeError as e:
                logger.error(f"❌ Failed to parse response JSON: {e}")
                logger.error(f"Raw response: {response_body}")
                return False
        else:
            logger.error(f"❌ Upload failed with status {result.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Debug test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Cleanup
        if upload_dir.exists():
            import shutil
            shutil.rmtree(upload_dir)

if __name__ == "__main__":
    result = asyncio.run(debug_encryption_handler_s3())
    if result:
        print("\n🎉 S3 upload is working in encryption handler!")
    else:
        print("\n🚨 S3 upload issue detected in encryption handler!")
    sys.exit(0 if result else 1)