from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from crew import create_crew
from utils.document_processor import DocumentProcessor
import shutil
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="CA Agent - Document Analysis")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("./input_files")
UPLOAD_DIR.mkdir(exist_ok=True)

# Static files & templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/analyze")
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
        # Check if API key is available
        if not os.environ.get("CEREBRAS_API_KEY"):
            return JSONResponse(
                content={"error": "CEREBRAS_API_KEY not found in environment variables. Please set your Cerebras API key."}, 
                status_code=500
            )
        
        # Process documents first
        doc_processor = DocumentProcessor(saved_files)
        processed_docs = doc_processor.process_documents()
        
        # Create crew with processed documents
        crew, task_name = create_crew(client_type, processed_docs)
        result = crew.kickoff()
        
        # Handle the result properly - convert to string if it's not serializable
        if hasattr(result, 'raw'):
            result_content = result.raw
        elif isinstance(result, str):
            result_content = result
        else:
            result_content = str(result)
        
        # Clean up the result content for better display
        if isinstance(result_content, str):
            # Remove excessive asterisks and format better
            result_content = result_content.replace('***', '')
            result_content = result_content.replace('**', '')
            # Clean up excessive newlines
            import re
            result_content = re.sub(r'\n{3,}', '\n\n', result_content)
        
        # Save the result to a markdown file
        try:
            from datetime import datetime
            from pathlib import Path
            
            # Create markdown_files directory if it doesn't exist
            markdown_dir = Path("./markdown_files")
            markdown_dir.mkdir(exist_ok=True)
            
            # Generate filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"CA_Report_{client_type}_{timestamp}.md"
            file_path = markdown_dir / filename
            
            # Create markdown content with header
            markdown_content = f"# CA Analysis Report - {client_type.title()}\n\n"
            markdown_content += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            markdown_content += f"**Task:** {task_name}\n\n"
            markdown_content += "---\n\n"
            markdown_content += result_content
            
            # Write to markdown file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            print(f"Report saved to: {file_path}")
            
        except Exception as save_error:
            print(f"Failed to save markdown file: {str(save_error)}")
            markdown_content = result_content  # Fallback if markdown creation fails
            
        # Return both JSON data and markdown for display
        return JSONResponse(content={
            "task": task_name, 
            "result": result_content,
            "markdown": markdown_content,
            "file_saved": str(file_path) if 'file_path' in locals() else "Error saving file"
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
