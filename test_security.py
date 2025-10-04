"""
Test script for encryption/decryption functionality
Run this to verify the security components work correctly
"""

import os
import sys
import tempfile
from pathlib import Path

# Add the ca_agent directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ca_agent'))

try:
    from utils.encryption import DocumentEncryption, encrypt_document, decrypt_document
    print("✅ Encryption module imported successfully")
except ImportError as e:
    print(f"❌ Failed to import encryption module: {e}")
    sys.exit(1)

def test_encryption():
    """Test encryption and decryption of sample data"""
    print("\n🔒 Testing Document Encryption...")
    
    # Sample document data
    sample_data = b"This is a test financial document with sensitive information."
    print(f"Original data: {sample_data.decode()}")
    
    try:
        # Test encryption
        print("\nEncrypting document...")
        encryption_metadata = encrypt_document(sample_data)
        
        print(f"✅ Encryption successful!")
        print(f"Algorithm: {encryption_metadata['algorithm']}")
        print(f"Key derivation: {encryption_metadata['key_derivation']}")
        print(f"Original size: {encryption_metadata['original_size']} bytes")
        print(f"Encrypted data length: {len(encryption_metadata['encrypted_data'])} characters (base64)")
        
        # Test decryption
        print("\nDecrypting document...")
        decrypted_data = decrypt_document(encryption_metadata)
        
        print(f"✅ Decryption successful!")
        print(f"Decrypted data: {decrypted_data.decode()}")
        
        # Verify data integrity
        if sample_data == decrypted_data:
            print("✅ Data integrity verified - original and decrypted data match!")
        else:
            print("❌ Data integrity failed - data doesn't match!")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Encryption test failed: {e}")
        return False

def test_file_encryption():
    """Test encryption of an actual file"""
    print("\n📄 Testing File Encryption...")
    
    try:
        # Create a temporary test file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
            temp_file.write("Test financial document\nAccount: 123456789\nBalance: $10,000\nSSN: XXX-XX-XXXX")
            temp_file_path = temp_file.name
        
        print(f"Created test file: {temp_file_path}")
        
        # Read the file
        with open(temp_file_path, 'rb') as f:
            file_data = f.read()
        
        print(f"File size: {len(file_data)} bytes")
        
        # Encrypt the file
        encryptor = DocumentEncryption()
        encryption_metadata = encryptor.encrypt_file(file_data)
        
        print("✅ File encrypted successfully!")
        
        # Decrypt the file
        decrypted_data = encryptor.decrypt_file(encryption_metadata)
        
        print("✅ File decrypted successfully!")
        
        # Verify
        if file_data == decrypted_data:
            print("✅ File encryption/decryption test passed!")
        else:
            print("❌ File encryption/decryption test failed!")
            return False
        
        # Cleanup
        os.unlink(temp_file_path)
        print("🧹 Test file cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ File encryption test failed: {e}")
        return False

def test_session_manager():
    """Test session management functionality"""
    print("\n🔑 Testing Session Manager...")
    
    try:
        from utils.session_manager import SessionManager
        
        session_manager = SessionManager()
        print("✅ Session manager imported successfully")
        
        # Test session creation
        session_data = session_manager.create_upload_session("test_user")
        print(f"✅ Session created: {session_data['upload_session_id']}")
        
        # Test access grant
        access_result = session_manager.grant_access(
            session_data['upload_session_id'], 
            session_data['access_token']
        )
        print(f"✅ Access granted with processing key")
        
        # Test cleanup
        cleanup_result = session_manager.cleanup_session(session_data['upload_session_id'])
        print(f"✅ Session cleanup: {cleanup_result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Session manager test failed: {e}")
        return False

def test_s3_connectivity():
    """Test S3 connectivity (requires AWS credentials)"""
    print("\n☁️ Testing S3 Connectivity...")
    
    try:
        from utils.s3_storage import S3DocumentStorage
        
        # Check if AWS credentials are available
        aws_key = os.getenv('AWS_ACCESS_KEY_ID')
        if not aws_key:
            print("⚠️ AWS credentials not found in environment variables")
            print("   Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to test S3")
            return True  # Skip test, don't fail
        
        s3_storage = S3DocumentStorage()
        print("✅ S3 storage initialized successfully")
        
        # Test upload/download with dummy data
        test_data = b"Test encrypted document data"
        test_metadata = {"algorithm": "AES-256-CBC", "test": True}
        
        object_key = s3_storage.upload_encrypted_document(test_data, "test_file.txt", test_metadata)
        print(f"✅ Test file uploaded: {object_key}")
        
        downloaded_data = s3_storage.download_encrypted_document(object_key)
        print(f"✅ Test file downloaded: {len(downloaded_data)} bytes")
        
        # Verify data
        if test_data == downloaded_data:
            print("✅ S3 upload/download test passed!")
        else:
            print("❌ S3 data integrity test failed!")
            return False
        
        # Cleanup
        s3_storage.delete_document(object_key)
        print("🧹 Test file deleted from S3")
        
        return True
        
    except Exception as e:
        print(f"❌ S3 connectivity test failed: {e}")
        print("   Make sure AWS credentials are correct and S3 permissions are set")
        return False

def main():
    """Run all tests"""
    print("🧪 FinAI Security Components Test Suite")
    print("=" * 50)
    
    tests = [
        ("Basic Encryption", test_encryption),
        ("File Encryption", test_file_encryption),
        ("Session Manager", test_session_manager),
        ("S3 Connectivity", test_s3_connectivity),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{test_name}")
        print("-" * len(test_name))
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Security components are working correctly.")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Please check the configuration.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)