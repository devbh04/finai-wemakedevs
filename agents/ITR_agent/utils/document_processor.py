import os
import PyPDF2
from pathlib import Path
import re

class ITRDocumentProcessor:
    """
    Enhanced document processor for ITR agent with CA report matching logic
    """
    def __init__(self, file_paths, ca_report_path=None, client_category=None):
        self.file_paths = file_paths if isinstance(file_paths, list) else [file_paths]
        self.ca_report_path = ca_report_path
        self.client_category = client_category
        
    def process_documents(self):
        """
        Process documents with intelligent CA report matching
        """
        # First process user documents
        user_docs = self._process_user_documents()
        
        # Process CA report if available
        ca_data = self._process_ca_report() if self.ca_report_path else None
        
        # Determine if CA report should be used based on matching logic
        use_ca_report = self._should_use_ca_report(user_docs, ca_data)
        
        processed_data = {
            "user_documents": user_docs,
            "ca_report_data": ca_data if use_ca_report else None,
            "ca_report_used": use_ca_report,
            "ca_report_path": self.ca_report_path if use_ca_report else None,
            "matching_analysis": self._get_matching_analysis(user_docs, ca_data) if ca_data else None
        }
        
        return processed_data
    
    def _should_use_ca_report(self, user_docs, ca_data):
        """
        Determine if CA report should be used based on document matching
        """
        if not ca_data or not user_docs:
            return False
            
        # Extract client category from CA report
        ca_insights = ca_data.get("extracted_insights", {}) if ca_data else {}
        ca_client_type = ca_insights.get("client_type", "") or ""
        ca_client_type = ca_client_type.lower() if ca_client_type else ""
        
        # Map ITR categories to CA categories
        category_mapping = {
            "salaried": ["salaried", "salary", "employee"],
            "self_employed": ["self_employed", "self employed", "freelancer", "professional"],
            "business": ["business", "company", "firm", "trader"]
        }
        
        # Check if categories match
        client_category = self.client_category or ""
        expected_ca_types = category_mapping.get(client_category.lower(), [])
        category_match = any(ca_type in ca_client_type for ca_type in expected_ca_types) if expected_ca_types and ca_client_type else False
        
        # Check document content similarity
        content_match = self._check_content_similarity(user_docs, ca_data)
        
        # Use CA report only if both category and content match reasonably
        return category_match and content_match
    
    def _check_content_similarity(self, user_docs, ca_data):
        """
        Check if user documents are similar to those used in CA report
        """
        try:
            user_text = (user_docs.get("combined_text", "") or "").lower() if user_docs else ""
            ca_content = (ca_data.get("raw_content", "") or "").lower() if ca_data else ""
            
            # Look for common financial keywords
            financial_keywords = [
                "salary", "income", "tax", "deduction", "investment", 
                "form 16", "tds", "pf", "hra", "invoice", "gst", 
                "business", "profit", "loss", "revenue"
            ]
            
            user_keywords = [kw for kw in financial_keywords if kw in user_text]
            ca_keywords = [kw for kw in financial_keywords if kw in ca_content]
            
            # Calculate similarity ratio
            common_keywords = set(user_keywords) & set(ca_keywords)
            similarity_ratio = len(common_keywords) / max(len(user_keywords), len(ca_keywords), 1)
            
            # Consider similar if at least 30% keywords match
            return similarity_ratio >= 0.3
            
        except Exception as e:
            print(f"Warning: Content similarity check failed: {e}")
            return False
    
    def _get_matching_analysis(self, user_docs, ca_data):
        """
        Provide analysis of matching between user docs and CA report
        """
        if not ca_data:
            return "No CA report available for comparison"
            
        ca_insights = ca_data.get("extracted_insights", {}) if ca_data else {}
        ca_client_type = ca_insights.get("client_type", "Unknown") or "Unknown"
        client_category = self.client_category or "Unknown"
        
        analysis = {
            "ca_report_client_type": ca_client_type,
            "itr_client_category": client_category,
            "category_match": ca_client_type.lower() in client_category.lower() if ca_client_type and client_category else False,
            "documents_uploaded": len(self.file_paths),
            "recommendation": ""
        }
        
        if analysis["category_match"]:
            analysis["recommendation"] = f"CA report matches ITR category ({self.client_category}). Using CA analysis for enhanced recommendations."
        else:
            analysis["recommendation"] = f"CA report category ({ca_client_type}) doesn't match ITR category ({self.client_category}). Proceeding with fresh analysis based on uploaded documents only."
            
        return analysis
    
    def _process_user_documents(self):
        """
        Process user uploaded documents (PDFs)
        """
        all_text = []
        document_metadata = []
        
        for file_path in self.file_paths:
            try:
                if file_path.lower().endswith('.pdf'):
                    text, metadata = self._extract_pdf_content(file_path)
                    all_text.append(text)
                    document_metadata.append(metadata)
                else:
                    # Handle other file types if needed
                    with open(file_path, 'r', encoding='utf-8') as file:
                        content = file.read()
                        all_text.append(content)
                        document_metadata.append({
                            "file_path": file_path,
                            "file_type": "text",
                            "size": len(content)
                        })
            except Exception as e:
                print(f"Error processing {file_path}: {str(e)}")
                continue
        
        return {
            "combined_text": "\n\n--- Document Separator ---\n\n".join(all_text),
            "individual_documents": all_text,
            "metadata": document_metadata
        }
    
    def _extract_pdf_content(self, file_path):
        """
        Extract text content from PDF files
        """
        text = ""
        metadata = {
            "file_path": file_path,
            "file_type": "pdf",
            "pages": 0,
            "size": 0
        }
        
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                metadata["pages"] = len(pdf_reader.pages)
                metadata["size"] = os.path.getsize(file_path)
                
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                    
        except Exception as e:
            print(f"Error extracting PDF content from {file_path}: {str(e)}")
            
        return text, metadata
    
    def _process_ca_report(self):
        """
        Process CA report markdown file and extract structured data
        """
        if not self.ca_report_path or not os.path.exists(self.ca_report_path):
            return None
            
        try:
            with open(self.ca_report_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # Extract structured data from CA report
            extracted_data = self._extract_ca_report_insights(content)
            
            return {
                "raw_content": content,
                "extracted_insights": extracted_data,
                "file_path": self.ca_report_path
            }
            
        except Exception as e:
            print(f"Error processing CA report {self.ca_report_path}: {str(e)}")
            return None
    
    def _extract_ca_report_insights(self, content):
        """
        Extract key insights from CA report markdown content
        """
        insights = {
            "financial_summary": {},
            "tax_details": {},
            "recommendations": [],
            "client_type": None,
            "income_sources": [],
            "deductions_claimed": [],
            "investment_details": []
        }
        
        try:
            # Extract client type
            client_match = re.search(r'Client Type[:\s]*([^\n]+)', content, re.IGNORECASE)
            if client_match:
                insights["client_type"] = client_match.group(1).strip()
            
            # Extract financial amounts
            amount_pattern = r'₹\s*[\d,]+\.?\d*|Rs\.?\s*[\d,]+\.?\d*'
            amounts = re.findall(amount_pattern, content)
            
            # Extract income information
            income_keywords = ['salary', 'income', 'gross', 'net', 'total income', 'taxable income']
            for keyword in income_keywords:
                pattern = f'{keyword}[:\s]*{amount_pattern}'
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    insights["financial_summary"][keyword] = matches
            
            # Extract tax-related information
            tax_keywords = ['tax', 'tds', 'advance tax', 'refund', 'liability']
            for keyword in tax_keywords:
                pattern = f'{keyword}[:\s]*{amount_pattern}'
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    insights["tax_details"][keyword] = matches
            
            # Extract deductions mentioned
            deduction_pattern = r'(80[A-Z]|Section\s*80[A-Z])\b'
            deductions = re.findall(deduction_pattern, content, re.IGNORECASE)
            insights["deductions_claimed"] = list(set(deductions))
            
            # Extract investment mentions
            investment_keywords = ['ELSS', 'PPF', 'NPS', 'LIC', 'EPF', 'NSC', 'ULIP', 'FD', 'mutual fund']
            for keyword in investment_keywords:
                if re.search(keyword, content, re.IGNORECASE):
                    insights["investment_details"].append(keyword)
            
            # Extract recommendations if any
            recommendation_patterns = [
                r'Recommendation[s]?[:\s]*([^\n]+)',
                r'Suggest[s]?[:\s]*([^\n]+)',
                r'Advice[:\s]*([^\n]+)'
            ]
            for pattern in recommendation_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                insights["recommendations"].extend(matches)
            
        except Exception as e:
            print(f"Error extracting insights from CA report: {str(e)}")
        
        return insights

class CAReportFetcher:
    """
    Utility to fetch the latest CA report for a client
    """
    def __init__(self, ca_reports_dir="./ca_agent/markdown_files"):
        self.ca_reports_dir = Path(ca_reports_dir)
    
    def get_latest_ca_report(self, client_type=None):
        """
        Get the latest CA report file path
        """
        if not self.ca_reports_dir.exists():
            return None
        
        # Get all markdown files
        markdown_files = list(self.ca_reports_dir.glob("CA_Report_*.md"))
        
        if not markdown_files:
            return None
        
        # Filter by client type if specified
        if client_type:
            filtered_files = [f for f in markdown_files if client_type.lower() in f.name.lower()]
            if filtered_files:
                markdown_files = filtered_files
        
        # Sort by modification time and return the latest
        latest_file = max(markdown_files, key=lambda f: f.stat().st_mtime)
        return str(latest_file)
    
    def get_all_ca_reports(self):
        """
        Get all CA report file paths
        """
        if not self.ca_reports_dir.exists():
            return []
        
        markdown_files = list(self.ca_reports_dir.glob("CA_Report_*.md"))
        return [str(f) for f in sorted(markdown_files, key=lambda f: f.stat().st_mtime, reverse=True)]