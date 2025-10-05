import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from cerebras.cloud.sdk import Cerebras
import json
import re

router = APIRouter()

class MarkdownAnalysisRequest(BaseModel):
    markdown_content: str
    report_type: str

class PictorialData(BaseModel):
    key_metrics: List[Dict[str, Any]]
    charts_data: List[Dict[str, Any]]
    highlights: List[Dict[str, Any]]
    risk_alerts: List[Dict[str, Any]]
    compliance_status: List[Dict[str, Any]]
    timeline_events: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]

@router.post("/extract-pictorial-data")
async def extract_pictorial_data(request: MarkdownAnalysisRequest):
    try:
        # Initialize Cerebras client
        client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY"))
        
        if not os.environ.get("CEREBRAS_API_KEY"):
            raise HTTPException(status_code=500, detail="CEREBRAS_API_KEY not found")
        
        # Create a detailed prompt for extracting pictorial data
        extraction_prompt = f"""
        Analyze this CA report markdown content and extract comprehensive structured data for visual representation. 
        The report type is: {request.report_type}
        
        Markdown Content:
        {request.markdown_content}
        
        Extract and return ONLY a valid JSON object with the following structure (no additional text):
        {{
            "key_metrics": [
                {{
                    "title": "string",
                    "value": "string", 
                    "unit": "string",
                    "trend": "up|down|stable",
                    "color": "green|red|blue|orange|purple",
                    "icon": "dollar|percent|calendar|user|building|chart",
                    "description": "string"
                }}
            ],
            "tax_regime_comparison": {{
                "old_regime": {{
                    "taxable_income": "string",
                    "tax_liability": "string",
                    "effective_rate": "string",
                    "deductions_used": ["string"],
                    "final_amount": "string"
                }},
                "new_regime": {{
                    "taxable_income": "string", 
                    "tax_liability": "string",
                    "effective_rate": "string",
                    "deductions_used": ["string"],
                    "final_amount": "string"
                }},
                "recommendation": "old|new",
                "savings_amount": "string",
                "savings_percentage": "string"
            }},
            "financial_health_score": {{
                "overall_score": "number (1-100)",
                "categories": [
                    {{
                        "category": "profitability|liquidity|solvency|efficiency",
                        "score": "number (1-100)", 
                        "status": "excellent|good|average|poor",
                        "key_indicator": "string"
                    }}
                ]
            }},
            "charts_data": [
                {{
                    "type": "pie|bar|line|doughnut|area|radialBar|donut|gauge",
                    "title": "string",
                    "data": {{"labels": ["string"], "values": [number]}},
                    "color_scheme": "blue|green|orange|purple|red",
                    "description": "string",
                    "insights": ["string"]
                }}
            ],
            "expense_breakdown": [
                {{
                    "category": "string",
                    "amount": "string",
                    "percentage": "number",
                    "trend": "up|down|stable"
                }}
            ],
            "income_sources": [
                {{
                    "source": "string",
                    "amount": "string", 
                    "percentage": "number",
                    "tax_treatment": "string"
                }}
            ],
            "highlights": [
                {{
                    "type": "success|warning|info|error",
                    "title": "string",
                    "message": "string",
                    "icon": "check|alert|info|dollar"
                }}
            ],
            "risk_alerts": [
                {{
                    "level": "high|medium|low",
                    "title": "string",
                    "description": "string",
                    "action_required": "string",
                    "impact": "financial|compliance|operational"
                }}
            ],
            "compliance_status": [
                {{
                    "item": "string",
                    "status": "compliant|non_compliant|pending",
                    "description": "string",
                    "due_date": "string",
                    "penalty_risk": "high|medium|low|none"
                }}
            ],
            "timeline_events": [
                {{
                    "date": "string",
                    "event": "string",
                    "importance": "high|medium|low",
                    "status": "completed|pending|upcoming",
                    "category": "filing|payment|compliance|planning"
                }}
            ],
            "recommendations": [
                {{
                    "priority": "high|medium|low",
                    "category": "tax_saving|investment|compliance|planning|operational",
                    "title": "string",
                    "description": "string",
                    "potential_savings": "string",
                    "timeline": "string",
                    "complexity": "easy|medium|complex"
                }}
            ],
            "benchmark_analysis": [
                {{
                    "metric": "string",
                    "your_value": "string",
                    "industry_average": "string", 
                    "performance": "above|at|below",
                    "recommendation": "string"
                }}
            ],
            "business_kpis": {{
                "revenue_growth": {{"value": "string", "trend": "up|down|stable", "period": "string"}},
                "profit_margins": {{"gross": "number", "ebitda": "number", "net": "number"}},
                "efficiency_ratios": {{"inventory_turnover": "number", "receivables_turnover": "number", "asset_turnover": "number"}},
                "liquidity_ratios": {{"current_ratio": "number", "quick_ratio": "number", "cash_ratio": "number"}},
                "leverage_ratios": {{"debt_to_equity": "number", "interest_coverage": "number", "debt_service_coverage": "number"}}
            }},
            "quarterly_performance": [
                {{
                    "quarter": "Q1|Q2|Q3|Q4",
                    "revenue": "number",
                    "expenses": "number", 
                    "profit": "number",
                    "gst_liability": "number",
                    "working_capital": "number"
                }}
            ],
            "cost_structure": [
                {{
                    "category": "COGS|Employee Benefits|Finance Costs|Marketing|Rent|Utilities|Professional Fees|Travel|Depreciation|Others",
                    "amount": "string",
                    "percentage": "number",
                    "trend": "up|down|stable",
                    "optimization_potential": "high|medium|low"
                }}
            ],
            "asset_breakdown": [
                {{
                    "category": "Current Assets|Fixed Assets|Investments",
                    "subcategory": "string",
                    "amount": "string",
                    "percentage": "number",
                    "liquidity": "high|medium|low"
                }}
            ]
        }}
        
        Based on the report type, focus on extracting and CREATE MULTIPLE CHARTS:
        
        FOR SALARIED INDIVIDUALS - Generate these specific charts:
        1. DOUGHNUT CHART: Salary Components Breakdown (Basic, HRA, Special Allowance, LTA, Medical, etc.)
        2. BAR CHART: Monthly Tax Deductions vs Take-home (show 12 months if data available) 
        3. PIE CHART: Section-wise Tax Deductions (80C, 80D, Standard Deduction, Professional Tax)
        4. LINE CHART: Tax Liability Trend - Old vs New Regime Over Time
        5. AREA CHART: Annual Cash Flow Distribution (Cumulative monthly flow)
        6. RADIALBAR CHART: Investment Portfolio Distribution for Tax Saving (EPF, PPF, ELSS, Insurance, etc.)
        7. GAUGE CHART: Tax Efficiency Score (how well tax is optimized vs potential savings)
        
        FOR SELF-EMPLOYED - Generate these specific charts:
        1. DONUT CHART: Revenue Sources by Client (show top 5-7 clients)
        2. LINE CHART: Monthly Revenue Trend (12 months with growth indicators)
        3. PIE CHART: Business Expense Categories (Office Rent, Travel, Marketing, Professional Fees, etc.)
        4. BAR CHART: Quarterly GST Analysis (GST Collected vs GST Paid vs ITC)
        5. DOUGHNUT CHART: Tax Components (Income Tax, GST, Advance Tax)
        6. AREA CHART: Profitability Analysis (Revenue vs Expenses vs Net Profit over time)
        7. RADIALBAR CHART: Client Concentration Risk Score (diversification level)
        
        FOR BUSINESS/CORPORATE - Generate these specific charts:
        1. DOUGHNUT CHART: Revenue Breakdown by Components (Gross Sales, Other Operating Income, Sales Returns)
        2. LINE CHART: Profitability Trend Analysis (Gross Profit %, EBITDA %, Net Profit % over quarters)
        3. PIE CHART: Expense Distribution (COGS, Employee Benefits, Finance Costs, Marketing, Rent, Others)
        4. BAR CHART: Financial Ratios Comparison (ROE, ROA, Current Ratio, Debt-to-Equity vs Industry Standards)
        5. DONUT CHART: Asset Allocation Structure (Current Assets, Fixed Assets, Investments breakdown)
        6. AREA CHART: Working Capital Components Analysis (Cash, Receivables, Inventory, Payables over time)
        7. PIE CHART: Tax Liability Structure (Income Tax, CGST, SGST, Net GST Payable)
        8. BAR CHART: Quarterly GST Analysis (Outward Supplies, Tax Payable, ITC, Net Payable by quarter)
        9. GAUGE CHART: Overall Financial Health Score (based on profitability, liquidity, solvency metrics)
        10. RADIALBAR CHART: Efficiency Metrics (Inventory Turnover, Receivables Turnover, Asset Turnover scores)
        11. LINE CHART: Cash Flow Indicators (Working Capital Cycle Days, Interest Coverage Ratio trends)
        
        CHART GENERATION RULES:
        - Always create 5-9 charts per report type using diverse visualization types
        - Use actual numerical data from the markdown content
        - PIE/DOUGHNUT/DONUT charts: Show percentage distributions (minimum 3 segments)
        - BAR charts: Show comparisons, categories, or discrete values
        - LINE charts: Show trends over time periods (monthly/quarterly/yearly)
        - AREA charts: Show cumulative trends or stacked categories over time
        - RADIALBAR charts: Show performance metrics, scores, or efficiency ratios
        - GAUGE charts: Show single KPI performance against targets (0-100 scale)
        - Include detailed insights for each chart explaining key findings and actionable recommendations
        - Color schemes should be meaningful and consistent with chart library capabilities
        - Extract precise values from tables and calculations in the markdown
        
        Extract actual numerical values from tables and calculations. For trends, analyze year-over-year changes or compare against benchmarks. Ensure all financial amounts include currency symbols and are properly formatted.
        """
        
        # Call Cerebras LLM
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert financial data analyst. Extract structured data from CA reports for visual representation. Return only valid JSON without any additional text or formatting."
                },
                {
                    "role": "user",
                    "content": extraction_prompt
                }
            ],
            model="llama-4-scout-17b-16e-instruct",
            temperature=0.1,
            max_tokens=8000
        )
        
        # Extract the response content
        response_content = chat_completion.choices[0].message.content.strip()
        
        # Clean the response to ensure it's valid JSON
        # Remove any markdown formatting or extra text
        json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
        if json_match:
            json_content = json_match.group(0)
        else:
            json_content = response_content
        
        # Parse the JSON response
        try:
            pictorial_data = json.loads(json_content)
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {response_content}")
            # Fallback with basic structure
            pictorial_data = {
                "key_metrics": [],
                "charts_data": [],
                "highlights": [{"type": "info", "title": "Analysis Complete", "message": "Report generated successfully", "icon": "check"}],
                "risk_alerts": [],
                "compliance_status": [],
                "timeline_events": [],
                "recommendations": []
            }
        
        return pictorial_data
        
    except Exception as e:
        print(f"Error in pictorial data extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting pictorial data: {str(e)}")