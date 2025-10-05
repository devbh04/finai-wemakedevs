# FinAI - AI-Powered Financial Analysis Platform

**Democratizing Financial Intelligence Through Multi-Agent AI**

[![Next.js](https://img.shields.io/badge/Next.js-13-informational?style=flat&logo=nextdotjs)](https://nextjs.org)  [![FastAPI](https://img.shields.io/badge/FastAPI-0.95-informational?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)

## 🚀 Overview

FinAI is a comprehensive financial technology platform that leverages cutting-edge AI agents to provide instant, accurate, and cost-effective financial analysis services. Built with modern web technologies and powered by advanced AI models, FinAI transforms complex financial processes into simple, automated workflows.

### 🎯 Key Features

- **Multi-Agent CrewAI Architecture**: Specialized AI agents for ITR, CA reports, equity analysis, and asset management
- **Lightning Fast Processing**: Powered by Cerebras LLMs for sub-second inference
- **Secure Document Handling**: End-to-end encryption with AWS S3 storage
- **Interactive Dashboards**: Real-time visualizations and insights
- **24/7 AI Assistant**: Intelligent chatbot for financial queries


## 🏗️ Architecture

### Multi-Agent System (CrewAI Framework)

FinAI utilizes the **CrewAI framework** to orchestrate specialized AI agents:


```
                    ┌──────────────────┐
                    │   CA Agent       │
                    │                  │
                    │ • Gets documents │
                    │ • Analyze them   │
                    │ • Generate Report│
                    └──────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   ITR Agent     │    │  Asset Agent    │    │  Equity Agent    │
│                 │    │                 │    │                  │
│ • Tax Filing    │    │ • Investment    │    │ • Stocks and MFs │
│ • Optimization  │    │ • Allocation    │    │ • Analysis       │
│ • Future Plan   │    │ • Risk Analysis │    │ • Investment Plan│
└─────────────────┘    └─────────────────┘    └──────────────────┘
```

### Fast Inference with Cerebras LLMs

FinAI leverages **Cerebras AI** for ultra-fast inference:
- **Sub-second response times** for complex financial analysis
- **High throughput processing** for multiple concurrent users
- **Cost-efficient inference** compared to traditional GPU solutions
- **Specialized financial models** fine-tuned for accuracy

### Secure Data Management with AWS S3

All user documents are encrypted and securely stored:
- **Client-side encryption** before upload
- **AWS S3** encrypted storage with versioning
- **Automatic data retention** policies
- **GDPR compliant** data handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 19** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Modern UI components
- **Recharts, D3.js, Chart.js** - Data visualization

### Backend
- **Python 3.12** - Core backend language
- **FastAPI** - High-performance API framework
- **CrewAI** - Multi-agent orchestration
- **Cerebras AI** - Fast LLM inference
- **AWS S3** - Secure document storage

## 📋 Prerequisites

- **Node.js** 22+ and **pnpm**
- **Python** 3.12+
- **AWS Account** with S3 access
- **API Keys** for Cerebras, Serper, and Gemini

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/wemakedevs/finai-wemakedevs.git
cd finai-wemakedevs
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd agents
pip install -r requirements.txt
```

#### Environment Configuration

Create a `.env` file in the agents directory:

```env
# API Keys
CEREBRAS_API_KEY="your-cerebras-api-key-here"
SERPER_API_KEY="your-serper-api-key-here"
GEMINI_API_KEY="your-gemini-api-key-here"

# AWS Configuration (Required for S3 storage)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-finai-bucket-name

# Security Configuration
ENCRYPTION_PASSWORD_LENGTH=32
SESSION_TIMEOUT_HOURS=2
MAX_FILE_SIZE_MB=30

# Application Configuration
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Logging Configuration
LOG_LEVEL=INFO
```

#### Start the Backend Server

```bash
uvicorn app:app --reload
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ca-frontend
pnpm install
```

#### Start the Frontend Server

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`


### Customizing Agents

Each agent can be configured via YAML files in their respective `config/` directories:

```yaml
# Example: agents/ITR_agent/config/agents.yaml
itr_specialist:
  role: "Income Tax Return Specialist"
  goal: "Prepare accurate and optimized tax returns"
  backstory: "Expert in Indian tax laws with 10+ years experience"
  verbose: true
  allow_delegation: false
```

## 🔒 Security Features

- **End-to-End Encryption**: All documents encrypted before storage
- **Secure API Authentication**: JWT tokens with configurable expiration
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive data sanitization
- **Audit Logging**: Complete activity tracking

## 📊 API Endpoints

### Core Endpoints

- `POST /itr/analyze` - ITR document analysis
- `POST /ca/analyze` - CA report generation
- `POST /equity/analyze` - Equity portfolio analysis
- `POST /asset/analyze` - Asset allocation recommendations
- `POST /chatbot/chat` - AI chatbot interaction

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.


**Built with ❤️ by The Neural Networks for the WeMAkeDevs Community**
