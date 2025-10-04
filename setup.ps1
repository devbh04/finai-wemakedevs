# FinAI Secure Setup Script for Windows
# This script sets up the secure document analysis system

Write-Host "🚀 FinAI Secure Document Analysis Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version 2>$null
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "`n📁 Setting up Backend..." -ForegroundColor Yellow

# Navigate to backend directory
Set-Location "ca_agent"

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file from example" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env file with your AWS credentials and API keys" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.example not found" -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install Python dependencies
Write-Host "`n📦 Installing Python dependencies..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt
    Write-Host "✅ Python dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    Write-Host "Try: pip install --upgrade pip" -ForegroundColor Yellow
}

# Navigate back and setup frontend
Set-Location ".."
Write-Host "`n🎨 Setting up Frontend..." -ForegroundColor Yellow
Set-Location "ca-frontend"

# Check for package manager
$packageManager = "npm"
if (Get-Command "pnpm" -ErrorAction SilentlyContinue) {
    $packageManager = "pnpm"
    Write-Host "✅ Using pnpm package manager" -ForegroundColor Green
} else {
    Write-Host "✅ Using npm package manager" -ForegroundColor Green
}

# Install frontend dependencies
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
try {
    if ($packageManager -eq "pnpm") {
        pnpm install
    } else {
        npm install
    }
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
}

# Navigate back to root
Set-Location ".."

Write-Host "`n🔧 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit ca_agent\.env file with your credentials:" -ForegroundColor White
Write-Host "   - AWS_ACCESS_KEY_ID" -ForegroundColor Gray
Write-Host "   - AWS_SECRET_ACCESS_KEY" -ForegroundColor Gray
Write-Host "   - CEREBRAS_API_KEY" -ForegroundColor Gray

Write-Host "`n2. Start the backend server:" -ForegroundColor White
Write-Host "   cd ca_agent" -ForegroundColor Gray
Write-Host "   uvicorn app:app --reload --host 127.0.0.1 --port 8000" -ForegroundColor Gray

Write-Host "`n3. Start the frontend server (in a new terminal):" -ForegroundColor White
Write-Host "   cd ca-frontend" -ForegroundColor Gray
if ($packageManager -eq "pnpm") {
    Write-Host "   pnpm dev" -ForegroundColor Gray
} else {
    Write-Host "   npm run dev" -ForegroundColor Gray
}

Write-Host "`n4. Test the security components:" -ForegroundColor White
Write-Host "   python test_security.py" -ForegroundColor Gray

Write-Host "`n🌐 URLs:" -ForegroundColor Cyan
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Gray
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Gray

Write-Host "`n📖 For detailed setup instructions, see SECURE_SETUP.md" -ForegroundColor Yellow

Write-Host "`n🔒 Security Features Enabled:" -ForegroundColor Green
Write-Host "• AES-256-CBC encryption" -ForegroundColor Gray
Write-Host "• AWS S3 secure storage" -ForegroundColor Gray
Write-Host "• Session-based access control" -ForegroundColor Gray
Write-Host "• Automatic file cleanup" -ForegroundColor Gray
Write-Host "• Grant access workflow" -ForegroundColor Gray