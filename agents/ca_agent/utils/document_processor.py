from pathlib import Path
import PyPDF2

class DocumentProcessor:
    """
    Simple PDF parser to extract text from uploaded PDFs
    """
    def __init__(self, file_paths):
        self.file_paths = file_paths if isinstance(file_paths, list) else [file_paths]

    def process_documents(self):
        docs = []
        for path in self.file_paths:
            try:
                with open(path, "rb") as f:
                    reader = PyPDF2.PdfReader(f)
                    content = ""
                    for page in reader.pages:
                        page_text = page.extract_text() or ""
                        content += page_text
                    
                    # Log content length for debugging
                    print(f"Extracted {len(content)} characters from {Path(path).name}")
                    
                    if not content.strip():
                        content = f"[No text could be extracted from {Path(path).name}. The PDF might be image-based or encrypted.]"
                    
                docs.append({"filename": Path(path).name, "content": content})
            except Exception as e:
                print(f"Error processing {path}: {str(e)}")
                docs.append({"filename": Path(path).name, "content": f"[Error processing document: {str(e)}]"})
        
        return docs
