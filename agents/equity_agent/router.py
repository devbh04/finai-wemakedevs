from fastapi import APIRouter, Form, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
import re
from datetime import datetime
import os

from .crew import create_crew

router = APIRouter(prefix="/equity", tags=["Equity Agent"])

templates = Jinja2Templates(directory="equity_agent/templates")

@router.get("/", response_class=HTMLResponse)
def index(request: Request):
    """Render the equity analysis form"""
    return templates.TemplateResponse("index.html", {"request": request})

@router.post("/analyze")
async def analyze_equity_investment(
    request: Request,
    sector: str = Form(default=""),
    goal: str = Form(...),
    style: str = Form(...),
    duration: str = Form(...),
    risk_level: str = Form(...),
    ca_report: str = Form(default="")
):
    """
    Analyze equity investment based on user inputs and optional CA report
    """
    try:
        # Prepare user inputs
        user_inputs = {
            "sector": sector if sector else None,
            "goal": goal,
            "style": style,
            "duration": duration,
            "risk_level": risk_level
        }
        
        # Create crew with user inputs and optional CA report
        crew, task_name = create_crew(user_inputs, ca_report if ca_report else None)
        
        # Execute the crew
        print("🚀 Starting equity analysis...")
        result = crew.kickoff()
        
        # Generate report filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_filename = f"Equity_Analysis_{user_inputs['style']}_{timestamp}.md"
        
        # Save the report
        output_dir = Path("./equity_agent/output_reports")
        output_dir.mkdir(exist_ok=True)
        
        report_path = output_dir / report_filename
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(str(result))
        
        return JSONResponse(content={
            "status": "success",
            "result": str(result),
            "task_name": f"Equity Analysis - {user_inputs['style'].title()}",
            "report_file": report_filename,
            "user_inputs": user_inputs
        })
        
    except Exception as e:
        error_msg = str(e) if str(e) else "Unknown error occurred during analysis"
        print(f"❌ Error during equity analysis: {error_msg}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        return JSONResponse(content={
            "status": "error",
            "error": error_msg,
            "error_type": type(e).__name__
        }, status_code=500)

@router.get("/test")
async def test_crew():
    """Test endpoint to debug crew creation"""
    try:
        # Test with sample data
        test_inputs = {
            "sector": "Technology",
            "goal": "Long-term wealth creation",
            "style": "invest",
            "duration": "5+ years",
            "risk_level": "medium"
        }
        
        crew, task_name = create_crew(test_inputs)
        
        return JSONResponse(content={
            "status": "success",
            "task_name": task_name,
            "crew_created": True,
            "agents_count": len(crew.agents),
            "tasks_count": len(crew.tasks),
            "test_inputs": test_inputs
        })
    except Exception as e:
        return JSONResponse(content={
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__
        }, status_code=500)

@router.get("/reports")
async def list_reports():
    """List all generated equity analysis reports"""
    try:
        output_dir = Path("./equity_agent/output_reports")
        if not output_dir.exists():
            return JSONResponse(content={"reports": []})
        
        reports = []
        for file in output_dir.glob("*.md"):
            reports.append({
                "filename": file.name,
                "created": datetime.fromtimestamp(file.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                "size": file.stat().st_size
            })
        
        # Sort by creation time (newest first)
        reports.sort(key=lambda x: x["created"], reverse=True)
        
        return JSONResponse(content={"reports": reports})
        
    except Exception as e:
        return JSONResponse(content={
            "status": "error",
            "error": str(e)
        }, status_code=500)

@router.get("/report/{filename}")
async def get_report(filename: str):
    """Get a specific report content"""
    try:
        output_dir = Path("./equity_agent/output_reports")
        report_path = output_dir / filename
        
        if not report_path.exists():
            return JSONResponse(content={
                "status": "error",
                "error": "Report not found"
            }, status_code=404)
        
        with open(report_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return JSONResponse(content={
            "status": "success",
            "filename": filename,
            "content": content
        })
        
    except Exception as e:
        return JSONResponse(content={
            "status": "error",
            "error": str(e)
        }, status_code=500)
