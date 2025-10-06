from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from pathlib import Path
import shutil
import re
from datetime import datetime

from .crew import create_crew
from .utils.document_processor import DocumentProcessor

router = APIRouter(prefix="/ca", tags=["CA Agent"])

UPLOAD_DIR = Path("./ca_agent/input_files")
UPLOAD_DIR.mkdir(exist_ok=True)

templates = Jinja2Templates(directory="ca_agent/templates")

@router.get("/")
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/test")
async def test_crew():
    """Test endpoint to debug crew creation"""
    try:
        from .crew import create_crew
        
        # Test with minimal data
        test_docs = [{"filename": "test.pdf", "content": "Test document content"}]
        crew, task_name = create_crew("business", test_docs)
        
        return JSONResponse(content={
            "status": "success",
            "task_name": task_name,
            "crew_created": True,
            "agents_count": len(crew.agents),
            "tasks_count": len(crew.tasks)
        })
    except Exception as e:
        return JSONResponse(content={
            "status": "error",
            "error": str(e),
            "error_type": type(e)._name_
        }, status_code=500)

@router.post("/analyze")
async def analyze_documents(
    client_type: str = Form(...),
    files: list[UploadFile] = File(...)
):
    saved_files = []
    for file in files:
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved_files.append(str(file_path))

    try:
        # Process documents
        doc_processor = DocumentProcessor(saved_files)
        processed_docs = doc_processor.process_documents()
        print(f"DEBUG: Processed {len(processed_docs)} documents")

        # Create and execute crew
        try:
            crew, task_name = create_crew(client_type, processed_docs)
            print(f"DEBUG: Created crew with task_name: {task_name}")
            
            if not task_name:
                task_name = f"CA_Analysis_{client_type}"
                print(f"DEBUG: Using fallback task_name: {task_name}")
            
            print("DEBUG: Starting crew kickoff...")
            result = crew.kickoff()
            print(f"DEBUG: Crew kickoff completed!")
            print(f"DEBUG: Crew result type: {type(result)}")
            print(f"DEBUG: Crew result repr: {repr(result)}")
            print(f"DEBUG: Crew result str: {str(result)[:200]}...")
            
            # Check if result has attributes we expect
            if hasattr(result, '_dict_'):
                print(f"DEBUG: Result attributes: {list(result._dict_.keys())}")
            if hasattr(result, 'raw'):
                print(f"DEBUG: Result.raw type: {type(result.raw)}")
                print(f"DEBUG: Result.raw: {str(result.raw)[:100]}...")
            if hasattr(result, 'pydantic_task_output'):
                print(f"DEBUG: Result.pydantic_task_output: {result.pydantic_task_output}")
            if hasattr(result, 'tasks_output'):
                print(f"DEBUG: Result.tasks_output: {result.tasks_output}")
            
        except Exception as crew_error:
            print(f"ERROR: Crew execution failed: {str(crew_error)}")
            # Fallback result
            result = f"CA Analysis for {client_type} client completed. Error during detailed analysis: {str(crew_error)}"
            task_name = f"CA_Analysis_{client_type}"

        # Handle result with comprehensive checking
        result_content = None
        
        # Try different ways to extract content from CrewAI result
        if hasattr(result, 'raw') and result.raw:
            result_content = str(result.raw)
            print(f"DEBUG: Using result.raw: {result_content[:100]}...")
        elif hasattr(result, 'output') and result.output:
            result_content = str(result.output)
            print(f"DEBUG: Using result.output: {result_content[:100]}...")
        elif hasattr(result, 'result') and result.result:
            result_content = str(result.result)
            print(f"DEBUG: Using result.result: {result_content[:100]}...")
        elif isinstance(result, str) and result.strip():
            result_content = result
            print(f"DEBUG: Using result as string: {result_content[:100]}...")
        elif hasattr(result, 'tasks_output') and result.tasks_output:
            # Try to get output from tasks
            if isinstance(result.tasks_output, list) and len(result.tasks_output) > 0:
                task_output = result.tasks_output[0]
                if hasattr(task_output, 'raw'):
                    result_content = str(task_output.raw)
                elif hasattr(task_output, 'output'):
                    result_content = str(task_output.output)
                else:
                    result_content = str(task_output)
            print(f"DEBUG: Using tasks_output: {result_content[:100] if result_content else 'None'}...")
        
        # Final fallback
        if not result_content or result_content.strip() == "" or str(result_content).lower() in ["none", "null"]:
            result_content = f"CA Analysis completed for {client_type} client. The analysis was processed successfully but no detailed output was generated. This might be due to API limitations or configuration issues."
            print("DEBUG: Using fallback content")

        # Clean up content
        result_content = str(result_content).replace('', '').replace('*', '')
        result_content = re.sub(r'\n{3,}', '\n\n', result_content)

        # Save as markdown
        markdown_dir = Path("./ca_agent/markdown_files")
        markdown_dir.mkdir(exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"CA_Report_{client_type}_{timestamp}.md"
        file_path = markdown_dir / filename

        markdown_content = f"# CA Analysis Report - {client_type.title()}\n\n"
        markdown_content += f"*Generated:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        markdown_content += f"*Task:* {task_name}\n\n---\n\n{result_content}"

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)

        return JSONResponse(content={
            "task": task_name or "CA_Analysis", 
            "result": result_content or "Analysis completed successfully",
            "markdown": markdown_content,
            "file_saved": str(file_path)
        })

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/reports")
async def list_ca_reports():
    """List all CA analysis reports"""
    try:
        reports_dir = Path("./ca_agent/markdown_files")
        if not reports_dir.exists():
            return JSONResponse(content={"reports": []})
        
        reports = []
        for file_path in reports_dir.glob("*.md"):
            reports.append({
                "filename": file_path.name,
                "created": file_path.stat().st_mtime,
                "size": file_path.stat().st_size,
                "path": str(file_path)
            })
        
        return JSONResponse(content={
            "reports": sorted(reports, key=lambda x: x["created"], reverse=True)
        })
        
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/reports/{filename}")
async def download_ca_report(filename: str):
    """Download a specific CA report file"""  
    try:
        from fastapi.responses import FileResponse
        report_path = Path("./ca_agent/markdown_files") / filename
        if not report_path.exists():
            return JSONResponse(content={"error": "Report not found"}, status_code=404)
        
        return FileResponse(
            path=str(report_path),
            filename=filename,
            media_type="text/markdown"
        )
        
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)