from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request, Path as FastAPIPath
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from ca_agent.router import router as ca_router
from ITR_agent.router import router as itr_router
from pathlib import Path
from pict_route import router as pict_router
from pydantic import BaseModel
from typing import Optional
import os
import shutil
import datetime
import asyncio
import json
import base64
from typing import List
from dotenv import load_dotenv

# Load environment variables from centralized .env file
load_dotenv()

# CA secure utils
from ca_agent.utils.encryption import encrypt_document, decrypt_document
from ca_agent.utils.s3_storage import upload_encrypted_file, download_encrypted_file
from ca_agent.utils.session_manager import (
    create_upload_session as ca_create_upload_session,
    grant_session_access as ca_grant_session_access,
    get_session_files_list as ca_get_session_files_list,
    session_manager as ca_session_manager,
)
from ca_agent.utils.document_processor import DocumentProcessor as CADocumentProcessor
from ca_agent.crew import create_crew as create_ca_crew

# Asset agent imports
from assest_agent.crew import create_crew, save_report_to_md, process_financial_report

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

# Setup templates for asset agent
asset_templates = Jinja2Templates(directory="assest_agent/templates")


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
            },
            "asset_agent": {
                "endpoint": "/assest-investment",
                "web_interface": "/assest-investment",
                "analyze_endpoint": "/analyze",
                "reports_endpoint": "/reports", 
                "description": "Asset Investment Analysis agent for comprehensive investment opportunities and financial planning"
            }
        },
        "docs": "/docs"
    }

# Asset Investment Models
class AssetInvestmentRequest(BaseModel):
    location: str
    financial_report: Optional[str] = None

class AssetInvestmentResponse(BaseModel):
    success: bool
    message: str
    report_path: Optional[str] = None
    analysis_summary: Optional[str] = None

# Asset Investment Routes
@app.get("/assest-investment", response_class=HTMLResponse, tags=["Asset Investment Agent"])
async def asset_investment_home(request: Request):
    """
    Serve the asset investment analysis web interface
    """
    return asset_templates.TemplateResponse("index.html", {"request": request})

@app.post("/analyze", response_model=AssetInvestmentResponse, tags=["Asset Investment Agent"])
async def analyze_asset_investment(
    location: str = Form(...),
    financial_report_text: Optional[str] = Form(None),
):
    """
    Analyze asset investment opportunities for a specific location with markdown financial data
    """
    try:
        financial_report_content: Optional[str] = None
        
        # Process markdown financial data if provided
        if financial_report_text and financial_report_text.strip():
            # Save pasted markdown to input_files for traceability
            safe_loc = "".join(c for c in location if c.isalnum() or c in ("-", "_")) or "unknown"
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            tmp_path = UPLOAD_DIR / f"financial_data_{safe_loc}_{timestamp}.md"
            with open(tmp_path, "w", encoding="utf-8") as f:
                f.write(financial_report_text)
            financial_report_content = financial_report_text
            print(f"Saved financial data to: {tmp_path}")
        
        # Create and run the crew
        print(f"Creating crew for location: {location}")
        crew = create_crew(location=location, financial_report_content=financial_report_content)
        
        print("Starting investment analysis...")
        result = await asyncio.to_thread(crew.kickoff)
        
        # Ensure reports directory exists
        reports_dir = Path("reports")
        reports_dir.mkdir(exist_ok=True)
        
        # Format the result as proper markdown
        formatted_result = f"""# Asset Investment Analysis Report

## Location: {location}
## Generated: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---

{str(result)}

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
        result_str = str(result)
        summary = result_str[:300] + "..." if len(result_str) > 300 else result_str
        
        print(f"Analysis completed. Report saved to: {report_path}")
        
        return AssetInvestmentResponse(
            success=True,
            message=f"Investment analysis completed for {location}",
            report_path=report_path,
            analysis_summary=summary
        )
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in asset investment analysis: {str(e)}")
        print(f"Full error traceback: {error_details}")
        return AssetInvestmentResponse(
            success=False,
            message=f"Analysis failed: {str(e)}"
        )

@app.get("/reports", tags=["Asset Investment Agent"])
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

@app.get("/reports/{filename}", tags=["Asset Investment Agent"])
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

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "agents": ["ca_agent", "itr_agent", "asset_agent"]}

# ===== Secure encrypted upload + grant-access flow (CA Agent) =====
@app.post("/secure/session/create", tags=["Secure Upload (CA)"])
async def secure_create_upload_session(user_id: str | None = Form(default=None)):
    """
    Create a secure upload session. Returns upload_session_id and access_token.
    """
    try:
        session = ca_create_upload_session(user_id)
        return {"status": "created", **session}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@app.post("/secure/session/{upload_session_id}/upload", tags=["Secure Upload (CA)"])
async def secure_upload_encrypted(
    upload_session_id: str = FastAPIPath(..., description="Upload session ID"),
    files: List[UploadFile] = File(...),
):
    """
    Encrypt uploaded files client-side on server and store encrypted blobs in S3.
    Stores encryption metadata (without encrypted payload) in the session.
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")

        uploaded = []
        for file in files:
            data = await file.read()
            # Encrypt the file
            enc_meta = encrypt_document(data)

            # Upload encrypted bytes to S3
            encrypted_bytes = base64.b64decode(enc_meta["encrypted_data"])  # store raw in S3
            s3_key = upload_encrypted_file(encrypted_bytes, file.filename, enc_meta)

            # Store metadata in session without the encrypted payload
            enc_meta_copy = dict(enc_meta)
            enc_meta_copy.pop("encrypted_data", None)
            added = ca_session_manager.add_file_to_session(
                upload_session_id=upload_session_id,
                filename=file.filename,
                s3_key=s3_key,
                encryption_metadata=enc_meta_copy,
            )
            if not added:
                raise HTTPException(status_code=500, detail=f"Failed to attach file to session: {file.filename}")

            uploaded.append({"filename": file.filename, "s3_key": s3_key})

        return {
            "status": "files_uploaded",
            "upload_session_id": upload_session_id,
            "count": len(uploaded),
            "files": uploaded,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/secure/session/{upload_session_id}/grant", tags=["Secure Upload (CA)"])
async def secure_grant_and_analyze(
    upload_session_id: str = FastAPIPath(..., description="Upload session ID"),
    access_token: str = Form(...),
    client_type: str = Form("business"),
):
    """
    Grant access to session files and trigger CA agent analysis on decrypted content.
    Returns processing_key and analysis result; also saves a markdown report.
    """
    try:
        # Grant access and get processing key
        grant = ca_grant_session_access(upload_session_id, access_token)
        processing_key = grant.get("processing_key")

        # Get files for the session
        files = ca_get_session_files_list(upload_session_id, processing_key)
        if not files:
            raise HTTPException(status_code=400, detail="No files in session to analyze")

        # Download, decrypt to temp paths
        decrypted_paths: list[str] = []
        temp_dir = Path("./ca_agent/input_files/decrypted") / upload_session_id
        temp_dir.mkdir(parents=True, exist_ok=True)

        for fi in files:
            s3_key = fi.get("s3_key")
            enc_meta = dict(fi.get("encryption_metadata", {}))
            blob = download_encrypted_file(s3_key)
            enc_meta["encrypted_data"] = base64.b64encode(blob).decode("utf-8")

            try:
                original_bytes = decrypt_document(enc_meta)
            except Exception as dec_err:
                raise HTTPException(status_code=500, detail=f"Decryption failed for {fi.get('filename')}: {str(dec_err)}")

            out_path = temp_dir / fi.get("filename", "file")
            with open(out_path, "wb") as f:
                f.write(original_bytes)
            decrypted_paths.append(str(out_path))

        # Process documents into text for CA agent
        doc_processor = CADocumentProcessor(decrypted_paths)
        processed_docs = doc_processor.process_documents()

        # Create CA crew and kickoff
        crew, task_name = create_ca_crew(client_type, processed_docs)

        # Run in thread to avoid blocking
        result = await asyncio.to_thread(crew.kickoff)

        # Extract content robustly (mirrors CA router logic)
        result_content = None
        if hasattr(result, 'raw') and result.raw:
            result_content = str(result.raw)
        elif hasattr(result, 'output') and result.output:
            result_content = str(result.output)
        elif hasattr(result, 'result') and result.result:
            result_content = str(result.result)
        elif isinstance(result, str) and result.strip():
            result_content = result
        elif hasattr(result, 'tasks_output') and getattr(result, 'tasks_output'):
            try:
                task_output = result.tasks_output[0]
                if hasattr(task_output, 'raw'):
                    result_content = str(task_output.raw)
                elif hasattr(task_output, 'output'):
                    result_content = str(task_output.output)
                else:
                    result_content = str(task_output)
            except Exception:
                pass

        if not result_content or str(result_content).strip() == "" or str(result_content).lower() in ["none", "null"]:
            result_content = f"CA Analysis completed for {client_type} client. The analysis was processed successfully but no detailed output was generated."

        # Save report
        markdown_dir = Path("./ca_agent/markdown_files")
        markdown_dir.mkdir(exist_ok=True)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        report_filename = f"CA_Report_{client_type}_{timestamp}_{upload_session_id}.md"
        report_path = markdown_dir / report_filename
        markdown_content = (
            f"# CA Analysis Report - {client_type.title()}\n\n"
            f"**Generated:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            f"**Task:** {task_name or 'CA_Analysis'}\n\n---\n\n{str(result_content)}"
        )
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)

        # Clean up encrypted files from S3 after successful analysis
        cleanup_success = []
        cleanup_failures = []
        
        try:
            from ca_agent.utils.s3_storage import S3DocumentStorage
            s3_storage = S3DocumentStorage()
            
            for fi in files:
                s3_key = fi.get("s3_key")
                if s3_key:
                    try:
                        deleted = s3_storage.delete_document(s3_key)
                        if deleted:
                            cleanup_success.append(s3_key)
                        else:
                            cleanup_failures.append(s3_key)
                    except Exception as cleanup_err:
                        print(f"Failed to delete {s3_key}: {cleanup_err}")
                        cleanup_failures.append(s3_key)
            
            print(f"S3 Cleanup: {len(cleanup_success)} files deleted, {len(cleanup_failures)} failures")
            
        except Exception as storage_err:
            print(f"S3 cleanup error: {storage_err}")

        # Clean up temporary decrypted files
        try:
            import shutil
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
                print(f"Cleaned up temporary directory: {temp_dir}")
        except Exception as temp_cleanup_err:
            print(f"Failed to cleanup temp directory: {temp_cleanup_err}")

        # Clean up session data
        try:
            ca_session_manager.cleanup_session(upload_session_id)
            print(f"Cleaned up session: {upload_session_id}")
        except Exception as session_cleanup_err:
            print(f"Failed to cleanup session: {session_cleanup_err}")

        return {
            "status": grant.get("status", "access_granted"),
            "processing_key": processing_key,
            "files_count": len(files),
            "task": task_name or "CA_Analysis",
            "result": result_content,
            "markdown": markdown_content,
            "report_saved": str(report_path),
            "cleanup_status": {
                "s3_deleted": len(cleanup_success),
                "s3_failures": len(cleanup_failures),
                "temp_files_cleaned": True,
                "session_cleaned": True
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grant/Analyze failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
