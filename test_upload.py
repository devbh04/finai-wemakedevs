"""
Simple test script to debug the upload-secure endpoint
"""
import requests
import json

def test_upload_flow():
    base_url = "http://127.0.0.1:8000"
    
    print("🧪 Testing Upload Flow...")
    
    # Step 1: Create session
    print("\n1️⃣ Creating session...")
    try:
        response = requests.post(f"{base_url}/create-session")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code != 200:
            print("❌ Failed to create session")
            return

        resp_json = response.json()
        session_data = resp_json['session']
        upload_session_id = session_data['upload_session_id']
        access_token = session_data['access_token']

        print(f"✅ Session created: {upload_session_id}")

    except Exception as e:
        print(f"❌ Session creation error: {e}")
        return
    
    # Step 2: Check session status
    print("\n2️⃣ Checking session status...")
    try:
        status_resp = requests.get(f"{base_url}/session/{upload_session_id}/status")
        print(f"Status: {status_resp.status_code}")
        print(f"Response: {status_resp.text}")
    except Exception as e:
        print(f"❌ Session status error: {e}")

    # Step 3: Test upload endpoint
    print("\n3️⃣ Testing upload endpoint...")
    try:
        # Create a test file
        test_content = b"Test document content"
        files = {'files': ('test.txt', test_content, 'text/plain')}
        data = {
            'upload_session_id': upload_session_id,
            'access_token': access_token
        }

        response = requests.post(f"{base_url}/upload-secure", files=files, data=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("✅ Upload successful!")
        else:
            print(f"❌ Upload failed with status {response.status_code}")

    except Exception as e:
        print(f"❌ Upload error: {e}")

if __name__ == "__main__":
    test_upload_flow()