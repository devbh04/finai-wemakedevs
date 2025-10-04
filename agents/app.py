from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from ca_agent.router import router as ca_router
from ITR_agent.router import router as itr_router
from pathlib import Path
from pict_route import router as pict_router

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

# Create shared directories
UPLOAD_DIR = Path("./input_files")
UPLOAD_DIR.mkdir(exist_ok=True)

# Include agent routers first
app.include_router(ca_router)
app.include_router(itr_router)


# Static files mounting - CA agent static files (primary)
# app.mount("/static", StaticFiles(directory="ca_agent/static"), name="static")
# # ITR agent static files on separate path
# app.mount("/itr-static", StaticFiles(directory="ITR_agent/static"), name="itr-static")

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
            "itr_agent": {
                "endpoint": "/itr", 
                "description": "Income Tax Return agent for ITR processing"
            }
        },
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "agents": ["ca_agent", "itr_agent"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
