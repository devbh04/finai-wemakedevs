import os
from pathlib import Path
import pandas as pd
from typing import List, Dict, Optional
import re

def process_financial_documents(file_paths: List[str]) -> List[Dict]:
    """
    Process uploaded financial documents and extract relevant information
    
    Args:
        file_paths: List of file paths to process
        
    Returns:
        List of dictionaries containing processed document information
    """
    processed_docs = []
    MAX_CONTENT_SIZE = 2000  # Limit content size to prevent token overflow
    
    for file_path in file_paths:
        try:
            doc_info = {
                'filename': Path(file_path).name,
                'file_path': file_path,
                'content': '',
                'type': 'unknown',
                'metadata': {}
            }
            
            # Determine file type and process accordingly
            file_extension = Path(file_path).suffix.lower()
            
            if file_extension == '.md':
                doc_info.update(process_markdown_file(file_path))
            elif file_extension in ['.txt', '.text']:
                doc_info.update(process_text_file(file_path))
            elif file_extension == '.csv':
                doc_info.update(process_csv_file(file_path))
            elif file_extension in ['.xlsx', '.xls']:
                doc_info.update(process_excel_file(file_path))
            else:
                # Try to read as text file
                doc_info.update(process_text_file(file_path))
            
            # Truncate content to prevent token overflow
            if len(doc_info.get('content', '')) > MAX_CONTENT_SIZE:
                doc_info['content'] = doc_info['content'][:MAX_CONTENT_SIZE] + "\n... [Content truncated for efficiency]"
            
            processed_docs.append(doc_info)
            
        except Exception as e:
            print(f"Error processing file {file_path}: {str(e)}")
            processed_docs.append({
                'filename': Path(file_path).name,
                'file_path': file_path,
                'content': f"Error processing file: {str(e)}",
                'type': 'error',
                'metadata': {}
            })
    
    return processed_docs

def process_markdown_file(file_path: str) -> Dict:
    """Process markdown financial report files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract financial information using regex patterns
        financial_data = extract_financial_metrics(content)
        
        return {
            'content': content,
            'type': 'financial_report_markdown',
            'metadata': {
                'financial_metrics': financial_data,
                'sections': extract_markdown_sections(content)
            }
        }
    except Exception as e:
        return {
            'content': f"Error reading markdown file: {str(e)}",
            'type': 'error',
            'metadata': {}
        }

def process_text_file(file_path: str) -> Dict:
    """Process plain text financial documents"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract financial information
        financial_data = extract_financial_metrics(content)
        
        return {
            'content': content,
            'type': 'financial_report_text',
            'metadata': {
                'financial_metrics': financial_data
            }
        }
    except Exception as e:
        return {
            'content': f"Error reading text file: {str(e)}",
            'type': 'error',
            'metadata': {}
        }

def process_csv_file(file_path: str) -> Dict:
    """Process CSV financial data files"""
    try:
        df = pd.read_csv(file_path)
        
        # Convert DataFrame to readable text format
        content = f"CSV Financial Data Summary:\n"
        content += f"Total Rows: {len(df)}\n"
        content += f"Columns: {', '.join(df.columns.tolist())}\n\n"
        content += "Data Preview:\n"
        content += df.head(10).to_string(index=False)
        
        # Extract numeric columns for financial analysis
        numeric_columns = df.select_dtypes(include=['number']).columns.tolist()
        
        return {
            'content': content,
            'type': 'financial_data_csv',
            'metadata': {
                'total_rows': len(df),
                'columns': df.columns.tolist(),
                'numeric_columns': numeric_columns,
                'data_types': df.dtypes.to_dict()
            }
        }
    except Exception as e:
        return {
            'content': f"Error reading CSV file: {str(e)}",
            'type': 'error',
            'metadata': {}
        }

def process_excel_file(file_path: str) -> Dict:
    """Process Excel financial documents"""
    try:
        # Read all sheets
        excel_data = pd.read_excel(file_path, sheet_name=None)
        
        content = f"Excel Financial Document Summary:\n"
        content += f"Total Sheets: {len(excel_data)}\n\n"
        
        for sheet_name, df in excel_data.items():
            content += f"Sheet: {sheet_name}\n"
            content += f"Rows: {len(df)}, Columns: {len(df.columns)}\n"
            content += f"Column Names: {', '.join(df.columns.tolist())}\n"
            content += "Data Preview:\n"
            content += df.head(5).to_string(index=False)
            content += "\n" + "="*50 + "\n"
        
        return {
            'content': content,
            'type': 'financial_data_excel',
            'metadata': {
                'sheets': list(excel_data.keys()),
                'total_sheets': len(excel_data)
            }
        }
    except Exception as e:
        return {
            'content': f"Error reading Excel file: {str(e)}",
            'type': 'error',
            'metadata': {}
        }

def extract_financial_metrics(text: str) -> Dict:
    """
    Extract financial metrics from text using regex patterns
    """
    metrics = {}
    
    # Common financial patterns
    patterns = {
        'income': r'(?:annual\s+income|yearly\s+income|salary|income)[\s:]*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        'expenses': r'(?:monthly\s+expenses|expenses|expenditure)[\s:]*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        'savings': r'(?:savings|saved|saving)[\s:]*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        'investments': r'(?:investments?|invested)[\s:]*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        'loans': r'(?:loan|debt|emi|outstanding)[\s:]*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
        'assets': r'(?:assets?|property|properties)[\s:]*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)'
    }
    
    for metric, pattern in patterns.items():
        matches = re.findall(pattern, text.lower(), re.IGNORECASE)
        if matches:
            # Convert string numbers to float, removing commas
            values = [float(match.replace(',', '')) for match in matches]
            metrics[metric] = {
                'values': values,
                'total': sum(values),
                'count': len(values)
            }
    
    return metrics

def extract_markdown_sections(content: str) -> List[str]:
    """
    Extract section headers from markdown content
    """
    sections = []
    lines = content.split('\n')
    
    for line in lines:
        # Check for markdown headers
        if line.strip().startswith('#'):
            sections.append(line.strip())
    
    return sections

def create_financial_summary(processed_docs: List[Dict]) -> str:
    """
    Create a summary of all processed financial documents
    """
    summary = "## Financial Documents Summary\n\n"
    
    for doc in processed_docs:
        summary += f"### {doc['filename']}\n"
        summary += f"- **Type**: {doc['type']}\n"
        
        if 'financial_metrics' in doc.get('metadata', {}):
            metrics = doc['metadata']['financial_metrics']
            summary += f"- **Financial Metrics Found**: {len(metrics)} categories\n"
            
            for metric, data in metrics.items():
                summary += f"  - {metric.title()}: {data['count']} entries, Total: ₹{data['total']:,.2f}\n"
        
        summary += f"- **Content Length**: {len(doc['content'])} characters\n"
        summary += "\n"
    
    return summary

# Utility functions for land investment analysis
def analyze_location_data(location: str) -> Dict:
    """
    Analyze location-specific data for land investment
    """
    # This could be enhanced with real data APIs
    location_analysis = {
        'location': location,
        'search_terms': generate_location_search_terms(location),
        'market_indicators': {
            'infrastructure_development': 'Research required',
            'population_growth': 'Research required',
            'economic_indicators': 'Research required',
            'real_estate_trends': 'Research required'
        }
    }
    
    return location_analysis

def generate_location_search_terms(location: str) -> List[str]:
    """
    Generate search terms for location-based research
    """
    base_terms = [
        f"{location} land prices",
        f"{location} real estate development",
        f"{location} infrastructure projects",
        f"{location} master plan",
        f"{location} property investment",
        f"{location} land acquisition",
        f"{location} government projects",
        f"{location} metro connectivity",
        f"{location} IT parks",
        f"{location} industrial development"
    ]
    
    return base_terms
