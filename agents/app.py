from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from ca_agent.router import router as ca_router
from ca_agent.secure_router import secure_router
from ITR_agent.router import router as itr_router
from equity_agent.router import router as equity_router
from assest_agent.router import router as asset_router
from pathlib import Path
from pict_route import router as pict_router
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

# Create main FastAPI app
app = FastAPI(title="Multi-Agent CrewAI Orchestrator", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include agent routers
app.include_router(ca_router)
app.include_router(secure_router)  # Secure CA agent endpoints
app.include_router(itr_router)
app.include_router(equity_router)
app.include_router(asset_router, prefix="/asset", tags=["asset"])


# Static files mounting - CA agent static files (primary)
app.mount("/static", StaticFiles(directory="ca_agent/static"), name="static")
# ITR agent static files on separate path
app.mount("/itr-static", StaticFiles(directory="ITR_agent/static"), name="itr-static")
# Equity agent static files on separate path
app.mount("/equity-static", StaticFiles(directory="equity_agent/static"), name="equity-static")

# Include the pictorial analysis router
app.include_router(pict_router, prefix="/api", tags=["pictorial"])

@app.get("/")
async def root():
    """
    Root endpoint showing available agents
    """
    return {
        "message": "Multi-Agent CrewAI Orchestrator",
        "available_agents": {
            "ca_agent": {
                "endpoint": "/ca",
                "description": "Chartered Accountant agent for tax and financial analysis"
            },
            "secure_ca_agent": {
                "endpoint": "/secure",
                "description": "Secure Chartered Accountant agent with encrypted document processing"
            },
            "itr_agent": {
                "endpoint": "/itr", 
                "description": "Income Tax Return agent for ITR processing"
            },
            "equity_agent": {
                "endpoint": "/equity",
                "description": "Equity Investment Analysis agent for stock and mutual fund recommendations"
            },
            "asset_agent": {
                "endpoint": "/asset",
                "description": "Asset Investment Analysis agent for real estate and investment opportunities"
            }
        },
        "secure_features": {
            "upload": "/secure/upload",
            "process": "/secure/session/{session_id}/grant"
        },
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy", 
        "agents": ["ca_agent", "secure_ca_agent", "itr_agent", "equity_agent", "asset_agent"],
        "encryption": "enabled"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)