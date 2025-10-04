# FinAI Secure Document Analysis Setup

This document provides setup instructions for the secure financial document analysis system with encryption and AWS S3 integration.

## 🔒 Security Flow Overview

```
User Upload → Encrypt Files → Upload to S3 → Grant Access → Decrypt & Analyze → Generate Report
```

### Security Features
- **AES-256-CBC Encryption**: Files encrypted before upload
- **AWS S3 Storage**: Secure cloud storage with additional encryption
- **Session Management**: Secure session-based access control
- **Grant Access Flow**: Explicit user consent required
- **Auto Cleanup**: Files automatically deleted after processing
- **Free Tier Optimized**: Uses AWS Free Tier services

## 📋 Prerequisites

### 1. AWS Account Setup (Free Tier)
1. Create an AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Create an IAM user with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::finai-encrypted-documents",
           "arn:aws:s3:::finai-encrypted-documents/*"
         ]
       }
     ]
   }
   ```
3. Note down your Access Key ID and Secret Access Key

### 2. Required API Keys
- **Cerebras API Key**: Get from [cerebras.ai](https://cerebras.ai)
- **Serper API Key**: Get from [serper.dev](https://serper.dev) (optional)

## 🚀 Backend Setup

### 1. Environment Configuration
1. Navigate to the backend directory:
   ```bash
   cd ca_agent
   ```

2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

3. Update `.env` with your credentials:
   ```env
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_here
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=finai-encrypted-documents

   # API Keys
   CEREBRAS_API_KEY=your_cerebras_api_key_here
   SERPER_API_KEY=your_api_key_here

   # Security Configuration
   ENCRYPTION_PASSWORD_LENGTH=32
   SESSION_TIMEOUT_HOURS=2
   MAX_FILE_SIZE_MB=10

   # Application Configuration
   DEBUG=True
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

   # Logging Configuration
   LOG_LEVEL=INFO
   ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start Backend Server
```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

The server will start at `http://127.0.0.1:8000`

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd ca-frontend
npm install
# or
pnpm install
```

### 2. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

The frontend will start at `http://localhost:3000`

## 🔧 API Endpoints

### Secure Flow Endpoints

#### 1. Create Session
```http
POST /create-session
```
**Response:**
```json
{
  "status": "success",
  "session": {
    "upload_session_id": "upload_xxx",
    "access_token": "xxx",
    "expires_at": "2025-10-04T..."
  }
}
```

#### 2. Upload Encrypted Files
```http
POST /upload-secure
Content-Type: multipart/form-data

upload_session_id=xxx
access_token=xxx
files=file1.pdf
files=file2.pdf
```

#### 3. Grant Access
```http
POST /grant-access
Content-Type: application/json

{
  "upload_session_id": "upload_xxx",
  "access_token": "xxx"
}
```

#### 4. Analyze Documents
```http
POST /analyze-secure
Content-Type: application/json

{
  "client_type": "salaried",
  "upload_session_id": "upload_xxx", 
  "processing_key": "xxx"
}
```

### Utility Endpoints

#### Session Status
```http
GET /session/{upload_session_id}/status
```

#### Health Check
```http
GET /health
```

#### Cleanup Expired Sessions
```http
POST /cleanup-expired-sessions
```

## 🔒 Security Configuration

### Encryption Settings
- **Algorithm**: AES-256-CBC
- **Key Derivation**: PBKDF2-SHA256 with 100,000 iterations
- **Password Length**: 32 characters (configurable)
- **Session Timeout**: 2 hours (configurable)

### AWS S3 Settings
- **Server-Side Encryption**: AES256
- **Lifecycle Policy**: 30-day automatic deletion
- **Bucket Location**: us-east-1 (Free Tier optimized)

## 🎯 Usage Flow

### Frontend Usage
1. **Select Occupation Type**: Choose Salaried, Self-Employed, or Businessman
2. **Choose Upload Mode**: 
   - 🔒 **Secure Upload** (Recommended): Files encrypted before upload
   - ⚡ **Quick Upload** (Legacy): Direct upload without encryption
3. **Upload Documents**: Drag & drop or click to upload
4. **Grant Access**: Click "Grant Access" to decrypt files (Secure mode only)
5. **Analyze**: System analyzes documents and generates report

### Security Benefits
- ✅ **End-to-End Encryption**: Files encrypted client-side before upload
- ✅ **Zero-Knowledge Architecture**: Server cannot access files without user consent  
- ✅ **Session-Based Security**: Temporary access tokens with expiration
- ✅ **Automatic Cleanup**: Files deleted after processing
- ✅ **Audit Trail**: All access attempts logged

## 🛠️ Troubleshooting

### Common Issues

#### 1. AWS S3 Connection Failed
- Check AWS credentials in `.env`
- Verify IAM permissions
- Ensure bucket name is unique globally

#### 2. Encryption Errors
- Check if `cryptography` package is installed correctly
- Verify Python version compatibility

#### 3. Session Expired
- Sessions expire after 2 hours
- Create a new session if expired

#### 4. Large File Upload Fails
- Default limit is 10MB per file
- Adjust `MAX_FILE_SIZE_MB` in `.env`

### Log Locations
- Backend logs: Console output
- Frontend logs: Browser console
- AWS S3 access logs: CloudTrail (if enabled)

## 📊 Cost Optimization (AWS Free Tier)

### Free Tier Limits
- **S3 Storage**: 5 GB for 12 months
- **S3 Requests**: 20,000 GET, 2,000 PUT requests/month
- **Data Transfer**: 15 GB out per month

### Optimization Features
- **Automatic Cleanup**: 30-day lifecycle policy
- **Efficient Uploads**: Single multipart upload
- **Regional Optimization**: us-east-1 region
- **Compressed Storage**: Files stored efficiently

## 🔄 Migration from Legacy

If you have an existing system, follow these steps:

1. **Backend Migration**:
   - Update `requirements.txt`
   - Add environment variables
   - Test secure endpoints

2. **Frontend Migration**:
   - Update to use `SecureFileUpload` component
   - Handle new API responses
   - Test secure flow

3. **Data Migration**:
   - No existing data migration needed
   - New uploads use secure flow
   - Legacy endpoint returns deprecation notice

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check AWS CloudWatch logs
4. Verify environment configuration

---

**Note**: This system is designed for financial document processing. Always ensure compliance with local data protection regulations (GDPR, CCPA, etc.) when handling sensitive financial information.