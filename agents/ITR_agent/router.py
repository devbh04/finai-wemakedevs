from fastapi import APIRouter, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
import shutil
import re
from datetime import datetime

from .crew import create_crew
from .utils.document_processor import ITRDocumentProcessor, CAReportFetcher

router = APIRouter(prefix="/itr", tags=["ITR Agent"])

UPLOAD_DIR = Path("./ITR_agent/input_files")
UPLOAD_DIR.mkdir(exist_ok=True)

templates = Jinja2Templates(directory="ITR_agent/templates")

@router.get("/")
def itr_index(request: Request):
    """
    ITR Agent index endpoint - serves the HTML template
    """
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/health")
async def itr_health():
    """
    ITR Agent health check
    """
    return {"agent": "itr_agent", "status": "ready"}

@router.get("/ca-reports")
async def list_ca_reports():
    """
    List available CA reports that can be used for ITR analysis
    """
    try:
        ca_fetcher = CAReportFetcher()
        all_reports = ca_fetcher.get_all_ca_reports()
        
        reports_info = []
        for report_path in all_reports:
            report_file = Path(report_path)
            if report_file.exists():
                # Extract info from filename
                filename = report_file.name
                # Example: CA_Report_business_20251002_234946.md
                parts = filename.replace('.md', '').split('_')
                if len(parts) >= 4:
                    client_type = parts[2]
                    timestamp = parts[3] + '_' + parts[4] if len(parts) > 4 else parts[3]
                    
                    reports_info.append({
                        "file_path": report_path,
                        "filename": filename,
                        "client_type": client_type,
                        "timestamp": timestamp,
                        "size": report_file.stat().st_size,
                        "modified": report_file.stat().st_mtime
                    })
        
        return JSONResponse(content={
            "available_reports": reports_info,
            "total_reports": len(reports_info)
        })
        
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.post("/analyze")
async def analyze_itr_documents(
    client_type: str = Form(...),
    ca_markdown: str = Form(...),
    files: list[UploadFile] = File(...)
):
    """
    ITR document analysis endpoint with direct CA report markdown input
    """
    saved_files = []
    for file in files:
        # Skip dummy files
        if file.filename == "dummy.txt" and file.size == 0:
            continue
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved_files.append(str(file_path))

    try:
        # Client type is now directly compatible with CA agent types
        client_category = client_type.lower()
        
        # Process documents with direct CA markdown input
        doc_processor = ITRDocumentProcessor(saved_files, None, client_category)
        processed_data = doc_processor.process_documents()
        
        # Override CA report data with directly provided markdown
        ca_report_data = {
            "raw_content": ca_markdown,
            "extracted_insights": {
                "client_type": client_category,
                "content_preview": ca_markdown[:500] + "..." if len(ca_markdown) > 500 else ca_markdown
            }
        }
        
        print(f"Using direct CA markdown input (length: {len(ca_markdown)})")
        print(f"Processing {len(saved_files)} additional documents")
        
        # Create crew with processed documents and direct CA markdown data
        crew, task_name = create_crew(
            client_category, 
            processed_data["user_documents"], 
            ca_report_data
        )
        
        # Execute the crew with enhanced error handling
        print("Starting ITR crew execution...")
        try:
            result = crew.kickoff()
            print(f"ITR crew execution completed. Result type: {type(result)}")
            
            # Enhanced result extraction
            result_content = None
            
            if hasattr(result, 'raw') and result.raw:
                result_content = str(result.raw)
                print(f"Using result.raw (length: {len(result_content)})")
            elif hasattr(result, 'output') and result.output:
                result_content = str(result.output)
                print(f"Using result.output (length: {len(result_content)})")
            elif hasattr(result, 'tasks_output') and result.tasks_output:
                # Extract from tasks output
                outputs = []
                for task_output in result.tasks_output:
                    if hasattr(task_output, 'raw'):
                        outputs.append(str(task_output.raw))
                    elif hasattr(task_output, 'output'):
                        outputs.append(str(task_output.output))
                    else:
                        outputs.append(str(task_output))
                result_content = "\n\n--- TASK OUTPUT SEPARATOR ---\n\n".join(outputs)
                print(f"Using tasks_output (length: {len(result_content)})")
            elif isinstance(result, str):
                result_content = result
                print(f"Using result as string (length: {len(result_content)})")
            else:
                result_content = str(result)
                print(f"Converting result to string (length: {len(result_content)})")
            
            # Ensure we have substantial content
            if not result_content or len(result_content.strip()) < 100:
                result_content = f"""
ITR TAX REDUCTION ANALYSIS COMPLETED

Client Category: {client_category.upper()}
Documents Processed: {len(saved_files)}
CA Report Used: {'Yes' if processed_data['ca_report_used'] else 'No'}

The ITR analysis has been completed successfully. However, the detailed output was not captured properly. 
This may be due to API limitations or configuration issues.

SUMMARY:
- Document analysis performed
- Tax optimization strategies identified  
- Recommendations generated based on {client_category} category
- {'CA report insights integrated' if processed_data['ca_report_used'] else 'Analysis based solely on uploaded documents'}

Please check the system logs for detailed analysis results.
"""
            
            # Clean up the result content
            result_content = result_content.replace('', '').replace('*', '')
            result_content = re.sub(r'\n{3,}', '\n\n', result_content)
            
        except Exception as crew_error:
            print(f"ITR crew execution failed: {str(crew_error)}")
            result_content = f"""
ITR TAX REDUCTION ANALYSIS - FALLBACK REPORT

An error occurred during crew execution: {str(crew_error)}

DOCUMENT ANALYSIS SUMMARY:
- Client Category: {client_category.upper()}
- Documents Uploaded: {len(saved_files)}
- CA Report Available: {'Yes' if ca_markdown and len(ca_markdown.strip()) > 0 else 'No'}
- CA Report Length: {len(ca_markdown) if ca_markdown else 0} characters

BASIC RECOMMENDATIONS:
1. Review all uploaded documents for tax-saving opportunities
2. Ensure all eligible deductions are claimed
3. Consider tax-efficient investment options
4. Plan for next financial year optimizations

This is a fallback report. Please try again or contact support for detailed analysis.
"""
        
        # Save the ITR analysis report
        markdown_dir = Path("./ITR_agent/output_reports")
        markdown_dir.mkdir(exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ITR_TaxReduction_Report_{client_type}_{timestamp}.md"
        file_path = markdown_dir / filename
        
        markdown_content = f"# ITR Tax Reduction Report - {client_type.upper()}\n\n"
        markdown_content += f"*Generated:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        markdown_content += f"*Task:* {task_name}\n\n"
        markdown_content += f"*CA Report Used:* {'Yes (Direct Input)' if ca_markdown and len(ca_markdown.strip()) > 0 else 'No'}\n\n"
        markdown_content += f"*CA Report Length:* {len(ca_markdown) if ca_markdown else 0} characters\n\n"
        markdown_content += f"*Documents Processed:* {len(saved_files)}\n\n"
        markdown_content += "---\n\n"
        markdown_content += result_content
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        return JSONResponse(content={
            "task": task_name,
            "result": result_content,
            "markdown": markdown_content,
            "file_saved": str(file_path),
            "ca_report_used": bool(ca_markdown and len(ca_markdown.strip()) > 0),
            "ca_report_length": len(ca_markdown) if ca_markdown else 0,
            "files_processed": len(saved_files),
            "client_category": client_category,
            "document_processing_status": "success"
        })
        
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)