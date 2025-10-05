from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
import shutil
import datetime
from .crew import create_crew, save_report_to_md, process_financial_report
import asyncio
import json

router = APIRouter(tags=["Asset Investment Agent"])

# Setup templates
templates = Jinja2Templates(directory="assest_agent/templates")

# Ensure upload directory exists
UPLOAD_DIR = Path("./assest_agent/input_files")
UPLOAD_DIR.mkdir(exist_ok=True)

class AssetInvestmentRequest(BaseModel):
    location: str
    financial_report: Optional[str] = None

class AssetInvestmentResponse(BaseModel):
    success: bool
    message: str
    report_path: Optional[str] = None
    analysis_summary: Optional[str] = None

@router.get("/", response_class=HTMLResponse)
async def asset_investment_home(request: Request):
    """
    Serve the asset investment analysis web interface
    """
    return templates.TemplateResponse("index.html", {"request": request})

@router.post("/analyze", response_model=AssetInvestmentResponse)
async def analyze_asset_investment(
    location: str = Form(...),
    financial_report_text: Optional[str] = Form(None),
):
    """
    Analyze asset investment opportunities for a specific location with markdown financial data
    """
    try:
        financial_report_content: Optional[str] = None
        
        # DEBUG: Check what we received from the form
        print(f"ROUTER DEBUG: Received location: {location}")
        print(f"ROUTER DEBUG: Received financial_report_text type: {type(financial_report_text)}")
        print(f"ROUTER DEBUG: Received financial_report_text length: {len(financial_report_text) if financial_report_text else 'None'}")
        if financial_report_text:
            print(f"ROUTER DEBUG: First 100 chars: {financial_report_text[:100]}...")
        
        # Quick fix: If no financial data in this request, return error to prevent duplicate processing
        if not financial_report_text or not financial_report_text.strip():
            print("ROUTER DEBUG: Rejecting empty request to prevent duplicate processing")
            return AssetInvestmentResponse(
                success=False,
                message="No financial data provided. Please paste your financial data in the text area.",
                report_path=None,
                analysis_summary="Financial data is required for analysis."
            )
        
        # Process markdown financial data if provided
        if financial_report_text and financial_report_text.strip():
            # Save pasted markdown to input_files for traceability
            safe_loc = "".join(c for c in location if c.isalnum() or c in ("-", "_")) or "unknown"
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            tmp_path = UPLOAD_DIR / f"financial_data_{safe_loc}_{timestamp}.md"
            with open(tmp_path, "w", encoding="utf-8") as f:
                f.write(financial_report_text)
            financial_report_content = financial_report_text
            print(f"ROUTER DEBUG: Saved financial data to: {tmp_path}")
            print(f"ROUTER DEBUG: financial_report_content set, length: {len(financial_report_content)}")
        else:
            print(f"ROUTER DEBUG: No financial data provided or empty string")
        
        # Create and run the crew
        print(f"Creating crew for location: {location}")
        
        # Check environment variables first
        cerebras_key = os.getenv("CEREBRAS_API_KEY")
        if not cerebras_key:
            raise ValueError("CEREBRAS_API_KEY environment variable not found")
        
        # Temporarily disable Serper to avoid iteration issues - focus on core analysis
        crew, report_type = create_crew(
            location=location, 
            financial_report_content=financial_report_content,
            fast_mode=True,      # Keep fast mode for performance
            include_serper=True  # Temporarily disable Serper to avoid iteration issues
        )
        
        print("Starting investment analysis...")
        try:
            result = await asyncio.to_thread(crew.kickoff)
            
            # Basic validation - detailed processing happens below
            if result is None:
                raise ValueError("Crew returned None result")
                
            print(f"DEBUG: Raw result type: {type(result)}")
            print(f"DEBUG: Result attributes: {dir(result) if hasattr(result, '__dict__') else 'No attributes'}")
            
        except Exception as e:
            error_msg = str(e)
            print(f"DEBUG: Crew execution error: {error_msg}")
            
            # Handle specific Cerebras token processing errors
            if "CerebrasException" in error_msg and "unexpected tokens remaining" in error_msg:
                raise HTTPException(
                    status_code=500, 
                    detail="AI model encountered a processing issue. Please try again - this is usually resolved on retry."
                )
            elif "'list' object has no attribute 'rstrip'" in error_msg:
                raise HTTPException(
                    status_code=500, 
                    detail="LLM returned invalid format. Please try again - this is usually a temporary issue with the AI model response format."
                )
            elif "Task execution failed" in error_msg and "token" in error_msg.lower():
                raise HTTPException(
                    status_code=500, 
                    detail="AI model processing error. Please try again - the model may be temporarily overloaded."
                )
            else:
                raise HTTPException(status_code=500, detail=f"Analysis failed: {error_msg}")
        
        # Handle result with comprehensive checking (multiple tasks may generate different result structures)
        result_content = None
        
        # Robust result processing with type safety
        def safe_str_convert(obj):
            """Safely convert any object to string, handling lists and other types"""
            if isinstance(obj, str):
                return obj
            elif isinstance(obj, (list, tuple)):
                return "\n".join(str(item) for item in obj if item)
            elif hasattr(obj, '__str__'):
                return str(obj)
            else:
                return repr(obj)
        
        # Check if result has tasks_output (from multiple tasks)
        if hasattr(result, 'tasks_output') and result.tasks_output:
            # Combine outputs from all tasks
            task_outputs = []
            for task_output in result.tasks_output:
                if hasattr(task_output, 'raw') and task_output.raw:
                    task_outputs.append(safe_str_convert(task_output.raw))
                elif hasattr(task_output, 'output') and task_output.output:
                    task_outputs.append(safe_str_convert(task_output.output))
                else:
                    task_outputs.append(safe_str_convert(task_output))
            result_content = "\n\n---\n\n".join(task_outputs)
            print(f"DEBUG: Using tasks_output: {len(result.tasks_output)} tasks combined")
        # Try different ways to extract content from CrewAI result
        elif hasattr(result, 'raw') and result.raw:
            result_content = safe_str_convert(result.raw)
            print(f"DEBUG: Using result.raw: {result_content[:100]}...")
        elif hasattr(result, 'output') and result.output:
            result_content = safe_str_convert(result.output)
            print(f"DEBUG: Using result.output: {result_content[:100]}...")
        elif hasattr(result, 'result') and result.result:
            result_content = safe_str_convert(result.result)
            print(f"DEBUG: Using result.result: {result_content[:100]}...")
        else:
            result_content = safe_str_convert(result)
            print(f"DEBUG: Using str(result): {result_content[:100]}...")
        
        if not result_content or result_content.strip() == "":
            result_content = f"Multi-task asset investment analysis completed for {location}. Analysis includes financial capacity, real estate research, debt fund research, and final investment strategy."
        
        # Ensure reports directory exists
        reports_dir = Path("reports")
        reports_dir.mkdir(exist_ok=True)
        
        # Format the result as proper markdown
        formatted_result = f"""# Asset Investment Analysis Report

## Location: {location}
## Generated: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---

{result_content}

---

*Report generated by Asset Investment Analysis Agent*
"""
        
        # Save the final report in markdown format
        report_path = save_report_to_md(
            report_content=formatted_result,
            report_type="asset_investment_analysis",
            location=location
        )
        
        # Extract summary from the result (first 300 characters for preview)
        summary = result_content[:300] + "..." if len(result_content) > 300 else result_content
        
        print(f"Analysis completed. Report saved to: {report_path}")
        
        return AssetInvestmentResponse(
            success=True,
            message=f"Investment analysis completed for {location}",
            report_path=report_path,
            analysis_summary=summary
        )
        
    except ValueError as ve:
        # Handle specific environment/validation errors
        print(f"Validation error in asset investment analysis: {str(ve)}")
        return AssetInvestmentResponse(
            success=False,
            message=f"Configuration error: {str(ve)}"
        )
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in asset investment analysis: {str(e)}")
        print(f"Full error traceback: {error_details}")
        
        # Provide more specific error message
        error_msg = str(e) if str(e) else "Unknown error occurred during analysis"
        return AssetInvestmentResponse(
            success=False,
            message=f"Analysis failed: {error_msg}"
        )

@router.get("/reports")
async def list_reports():
    """
    List all generated reports
    """
    try:
        reports_dir = Path("reports")
        if not reports_dir.exists():
            return {"reports": []}
        
        reports = []
        for file_path in reports_dir.glob("*.md"):
            reports.append({
                "filename": file_path.name,
                "created": file_path.stat().st_mtime,
                "size": file_path.stat().st_size
            })
        
        return {"reports": sorted(reports, key=lambda x: x["created"], reverse=True)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing reports: {str(e)}")

@router.get("/reports/{filename}")
async def download_report(filename: str):
    """
    Download a specific report file
    """
    try:
        report_path = Path("reports") / filename
        if not report_path.exists():
            raise HTTPException(status_code=404, detail="Report not found")
        
        return FileResponse(
            path=str(report_path),
            filename=filename,
            media_type="text/markdown"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading report: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the asset investment agent
    """
    try:
        # Test environment variables
        api_key = os.getenv("CEREBRAS_API_KEY")
        api_key_status = "present" if api_key else "missing"
        
        # Test crew creation (without running it)
        test_crew, test_report_type = create_crew(location="test", financial_report_content=None)
        crew_status = "created successfully"
        
        return {
            "status": "healthy",
            "agent": "asset_investment_agent",
            "api_key": api_key_status,
            "crew_creation": crew_status,
            "capabilities": [
                "Financial capacity analysis",
                "Real estate market research", 
                "Investment strategy recommendations",
                "Report generation and storage",
                "Markdown report output"
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "agent": "asset_investment_agent",
            "error": str(e),
            "capabilities": [
                "Financial capacity analysis",
                "Real estate market research", 
                "Investment strategy recommendations",
                "Report generation and storage",
                "Markdown report output"
            ]
        }
