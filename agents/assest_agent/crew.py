"""
Asset Agent Crew - Optimized for Performance

OPTIMIZATIONS APPLIED:
1. Reduced max_completion_tokens from 15000 to 8000 (47% reduction)
2. Disabled agent verbosity and delegation to reduce overhead
3. Added fast_mode option for single-task execution (like CA agent)
4. Limited agent iterations and added execution timeouts
5. Simplified task dependencies to minimize sequential waits
6. Reduced financial report content limit to 2000 chars

PERFORMANCE COMPARISON:
- CA Agent: 1 task, sequential process, ~3000 tokens
- Asset Agent (Fast): 1 task, sequential process, ~8000 tokens
- Asset Agent (Full): 4 tasks, sequential process, higher token usage

Usage: crew, report_type = create_crew(location, financial_report, fast_mode=True)
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional, List, Dict, Any
import yaml
import datetime
import os
from dotenv import load_dotenv

# CrewAI imports
from crewai import Agent, Task, Crew, Process
from crewai import LLM
from crewai_tools import SerperDevTool

# Utils - temporarily commented out to test
# from .utils.document_processor import (
# 	process_financial_documents,
# )

ROOT = Path(__file__).resolve().parent

# Load environment variables from the main .env file
MAIN_ENV_PATH = ROOT.parent / ".env"  # Path to main agents/.env
load_dotenv(MAIN_ENV_PATH)

CONFIG_DIR = ROOT / "config"
REPORTS_DIR = ROOT.parent / "reports"
INPUT_DIR = ROOT / "input_files"


# Helper functions removed - now using direct YAML loading like other agents


def create_crew(location: str, financial_report_content: Optional[str] = None, fast_mode: bool = True, include_serper: bool = True) -> Crew:
	"""
	Create CrewAI crew for asset investment analysis
	Optimized for performance to match CA agent speed and token efficiency
	
	Args:
		location (str): User's location for investment analysis
		financial_report_content (str, optional): Financial report content to analyze
		fast_mode (bool): If True, uses optimized approach for faster execution
		include_serper (bool): If True, includes Serper-based market data even in fast mode
	
	Returns:
		tuple: (crew, report_type) for consistency with CA agent
	"""
	# Load YAML files
	with open(CONFIG_DIR / "agents.yaml", "r") as f:
		agents_yaml = yaml.safe_load(f)
	with open(CONFIG_DIR / "tasks.yaml", "r") as f:
		tasks_yaml = yaml.safe_load(f)
	
	# Check for required API keys
	api_key = os.getenv("CEREBRAS_API_KEY")
	if not api_key:
		raise ValueError("CEREBRAS_API_KEY environment variable not found. Please check your .env file.")
	
	serper_key = os.getenv("SERPER_API_KEY")
	if not serper_key:
		print("Warning: SERPER_API_KEY not found. Agents requiring web search may not work properly.")
	
	# Configure Cerebras LLM optimized for comprehensive responses
	llm = LLM(
		model="cerebras/gpt-oss-120b",
		api_key=api_key,
		base_url="https://api.cerebras.ai/v1",
		temperature=0.7,  # Higher temperature to prevent stuck loops
		max_completion_tokens=10000,  # Adequate tokens for full responses
		timeout=180,  # 3 minute timeout for complex tasks
		max_retries=1,  # Single retry to prevent loops
		stop=None,  # Remove any stop sequences that might interfere
	)
	
	print(f"DEBUG: Using Cerebras API key: {api_key[:10]}...")
	print(f"DEBUG: Using model: gpt-oss-120b")
	print(f"Performance mode: {'FAST' if fast_mode else 'FULL'}")
	print(f"Include Serper: {include_serper}")
	
	# Initialize Serper tool for agents that need it (optimized initialization)
	serper_tool = None
	if serper_key:
		try:
			serper_tool = SerperDevTool()
			print("DEBUG: SerperDevTool initialized successfully")
		except Exception as e:
			print(f"SerperDevTool initialization failed: {e}")
			serper_tool = None
	
	# Create agents with performance optimizations
	agent_instances = []
	for agent_def in agents_yaml["agents"]:
		# Add tools for agents that need web search
		tools = []
		if agent_def.get("use_serper", False) and serper_tool:
			tools = [serper_tool]
			print(f"DEBUG: Assigning Serper tool to {agent_def['name']}")
		elif agent_def.get("use_serper", False) and not serper_tool:
			print(f"WARNING: {agent_def['name']} needs Serper but tool not available")
			
		# Add specific instructions for Financial_Profile_Analyzer to extract actual numbers
		enhanced_backstory = agent_def.get("backstory", "")
		if agent_def["name"] == "Financial_Profile_Analyzer":
			enhanced_backstory += " You extract actual numbers from financial data and calculate precise amounts."
		
		agent = Agent(
			role=agent_def["role"],
			goal=agent_def["goal"],
			backstory=enhanced_backstory + " Complete your task thoroughly and provide comprehensive results.",
			llm=llm,
			verbose=False,
			allow_delegation=agent_def.get("allow_delegation", False),  # Keep original delegation settings
			tools=tools,
			max_execution_time=900,  # 15 minutes for comprehensive responses
			max_iter=5,  # Allow sufficient iterations for tool usage
		)
		agent_instances.append(agent)
		
	print(f"Created {len(agent_instances)} agents (optimized for performance):")
	for i, agent in enumerate(agent_instances):
		agent_def = agents_yaml["agents"][i]
		tool_count = len(agent.tools) if hasattr(agent, 'tools') and agent.tools else 0
		print(f"  - {agent_def['name']}: {tool_count} tools, delegation: {agent.allow_delegation}, verbose: {agent.verbose}")
	
	# Task creation - always use full mode when Serper is enabled for comprehensive analysis
	task_instances = []
	
	if include_serper:
		# FULL MODE: Execute all tasks for comprehensive analysis with live data scraping
		print("Using FULL MODE with Serper: All tasks will be executed for comprehensive investment analysis")
		for task_config in tasks_yaml["tasks"]:
			# Find the agent for this task
			agent_name = task_config["agent"]
			assigned_agent = None
			for agent in agent_instances:
				# Match by the name field in the YAML
				agent_yaml = next((a for a in agents_yaml["agents"] if a["name"] == agent_name), None)
				if agent_yaml and agent.role == agent_yaml["role"]:
					assigned_agent = agent
					break
			
			if not assigned_agent:
				print(f"Warning: Could not find agent for task {task_config['name']}")
				continue
				
			# Prepare task description with context
			task_description = task_config["description"]
			task_description += f"\n\n=== USER LOCATION ===\n{location}\n"
			
			# Add financial report to the first task (Financial_Profile_Analyzer)
			if task_config["agent"] == "Financial_Profile_Analyzer" and financial_report_content:
				report_content = financial_report_content[:2000] if len(financial_report_content) > 2000 else financial_report_content
				task_description += f"\n=== FINANCIAL STATEMENT TO ANALYZE ===\n{report_content}\n"
			
			# Create task with explicit output format
			task = Task(
				description=task_description + "\n\nIMPORTANT: Return your response as a single, well-formatted text string. Do not return lists, arrays, or other data structures.",
				expected_output=task_config["expected_output"] + "\n\nFormat: Single text string with markdown formatting.",
				agent=assigned_agent,
				output_format="string"  # Ensure string output
			)
			task_instances.append(task)
	
	else:
		# FAST MODE: Single comprehensive task without web scraping
		print("Using FAST MODE: Single comprehensive task for optimal performance (no web scraping)")
		primary_task_config = next((t for t in tasks_yaml["tasks"] if t["agent"] == "Financial_Profile_Analyzer"), None)
		
		if primary_task_config:
			# Find the Financial Profile Analyzer agent
			financial_agent = next((agent for agent in agent_instances 
			                       if any(a["name"] == "Financial_Profile_Analyzer" and agent.role == a["role"] 
			                             for a in agents_yaml["agents"])), agent_instances[0])
			
			# Create comprehensive single task with direct, clear instructions
			comprehensive_description = f"""
			You are a Personal Financial Analyst for {location}. Your task depends on whether financial data is provided:
			
			IF FINANCIAL DATA IS PROVIDED BELOW:
			- Extract actual numbers from the financial data
			- Calculate monthly surplus (Income - Expenses) using real figures  
			- Provide investment capacity analysis with specific amounts in rupees
			- Give home loan eligibility based on income multiples
			- Create detailed asset allocation with actual amounts
			
			IF NO FINANCIAL DATA IS PROVIDED:
			- Create a template requesting the required financial information
			- Explain the methodology for calculations
			- Provide examples of what the analysis will look like
			
			CRITICAL: Use actual calculated amounts, never placeholders like [Amount] or [Net Salary].
			"""
			
			# Add financial report content if available
			if financial_report_content and financial_report_content.strip():
				report_content = financial_report_content[:2000] if len(financial_report_content) > 2000 else financial_report_content
				comprehensive_description += f"""
				
				=== FINANCIAL DATA TO ANALYZE (EXTRACT ACTUAL NUMBERS FROM THIS) ===
				{report_content}
				=== END OF FINANCIAL DATA ===
				
				MANDATORY: You must extract and use the actual numerical values from the above financial data.
				Replace all placeholders with real calculated amounts based on the provided information.
				If any specific amount is not clearly stated, indicate "Amount not specified in data" and proceed with analysis.
				"""
			else:
				comprehensive_description += """
				
				=== NO SPECIFIC FINANCIAL DATA PROVIDED ===
				Since no financial data was provided, create a template analysis and clearly indicate 
				that actual numbers need to be provided for precise calculations.
				"""
			
			# Create single comprehensive task with explicit string output
			task = Task(
				description=comprehensive_description + "\n\nIMPORTANT: Return your response as a single, well-formatted text string. Do not return lists, arrays, or other data structures.",
				expected_output=f"""
				Generate a financial analysis report for {location} as a single text string. 
				
				If financial data was provided: Extract and calculate actual amounts in rupees.
				If no financial data was provided: Create a data collection template.
				
				Always use real calculated numbers when data is available - never placeholders.
				Return your response as plain text, not as a list or array.
				Format: Single text string with markdown formatting.
				""",
				agent=financial_agent,
				output_format="string"  # Ensure string output
			)
			task_instances.append(task)
	
	# Create Crew optimized for comprehensive analysis
	crew = Crew(
		agents=agent_instances,
		tasks=task_instances,
		process=Process.sequential,
		verbose=False,
		full_output=True,
		memory=False,
		max_execution_time=2700,  # 45 minutes for comprehensive analysis
	)
	print(f"Created optimized crew with {len(task_instances)} tasks in sequential workflow")
	return crew, "asset_investment_analysis"


def save_report_to_md(report_content: str, report_type: str, location: str) -> str:
	REPORTS_DIR.mkdir(parents=True, exist_ok=True)
	safe_loc = "".join(c for c in location if c.isalnum() or c in ("-", "_")) or "unknown"
	ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
	filename = f"{report_type}_{safe_loc}_{ts}.md"
	out_path = REPORTS_DIR / filename
	with open(out_path, "w", encoding="utf-8") as f:
		f.write(report_content)
	return str(out_path)


def process_financial_report(file_path: str) -> str:
	# Simplified version for testing - just read text files
	p = Path(file_path)
	try:
		if p.suffix.lower() in {".md", ".txt", ".text"}:
			content = p.read_text(encoding="utf-8")
			# Limit content size
			return content[:2000] + "..." if len(content) > 2000 else content
		else:
			return f"File type {p.suffix} not supported in simplified mode"
	except Exception as e:
		return f"Error processing financial report: {e}"
