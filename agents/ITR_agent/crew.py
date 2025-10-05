import os
from crewai import Crew, Agent, Task, Process, LLM
from crewai_tools import SerperDevTool
from pathlib import Path
import yaml
import json

CONFIG_DIR = Path(__file__).parent / "config"

def create_crew(client_type: str, processed_documents=None, ca_report_data=None):
    """
    Create focused CrewAI crew for ITR processing with complete output generation
    """
    print(f"Creating ITR crew for client_type: {client_type}")
    print(f"CA report available: {ca_report_data is not None}")
    print(f"Documents provided: {len(processed_documents) if processed_documents else 0}")
    
    # Load ITR-specific YAML configuration files
    with open(CONFIG_DIR / "agents.yaml", "r") as f:
        agents_yaml = yaml.safe_load(f)
    with open(CONFIG_DIR / "tasks.yaml", "r") as f:
        tasks_yaml = yaml.safe_load(f)
    
    # Setup LLM using Cerebras API key
    cerebras_api_key = os.environ.get("CEREBRAS_API_KEY")
    if not cerebras_api_key:
        raise ValueError("CEREBRAS_API_KEY not found in environment variables.")
    
    llm = LLM(
        model="cerebras/gpt-oss-120b",
        api_key=cerebras_api_key,
        base_url="https://api.cerebras.ai/v1",
        temperature=0.3,
        max_completion_tokens=20000,
    )
    
    # Initialize Serper tool for web research
    serper_tool = SerperDevTool()
    
    # Create agents based on YAML configuration
    agents = {}
    for agent_config in agents_yaml["agents"]:
        tools = []
        if agent_config.get("use_serper", False):
            tools.append(serper_tool)
            
        agent = Agent(
            role=agent_config["role"],
            goal=agent_config["goal"],
            backstory=agent_config["backstory"],
            llm=llm,
            verbose=agent_config.get("verbose", True),
            allow_delegation=agent_config.get("allow_delegation", False),
            tools=tools
        )
        agents[agent_config["name"]] = agent
    
    # Task workflow using actual task names from YAML
    task_workflows = {
        "salaried": ["analyze_salaried_documents", "salaried_tax_optimization", "generate_salaried_financial_plan"],
        "self_employed": ["analyze_self_employed_documents", "self_employed_tax_optimization", "generate_self_employed_financial_plan"], 
        "business": ["analyze_business_documents", "business_tax_optimization", "generate_business_financial_plan"]
    }
    
    # Get tasks for the client type
    selected_tasks = task_workflows.get(client_type.lower(), task_workflows["salaried"])
    
    # Create tasks
    task_instances = []
    for task_name in selected_tasks:
        task_config = next((t for t in tasks_yaml["tasks"] if t["name"] == task_name), None)
        if task_config:
            # Determine which agent to assign
            agent_name = task_config.get("agent", "DocumentMaster")
            assigned_agent = agents.get(agent_name, agents.get("DocumentMaster", list(agents.values())[0]))
            
            # Prepare context with CA report data and processed documents
            context_data = {
                "processed_documents": processed_documents or [],
                "ca_report_data": ca_report_data or {},
                "client_type": client_type
            }
            
            # Create comprehensive context for the task
            context_info = _build_task_context(processed_documents, ca_report_data, client_type)
            
            # Enhanced task description with full context
            full_description = f"""
{task_config["description"]}

CONTEXT INFORMATION:
{context_info}

IMPORTANT: Provide a complete, detailed analysis. Do not just mention what you will do - actually perform the analysis and provide specific recommendations, numbers, and actionable insights.
"""
            
            task = Task(
                description=full_description,
                expected_output=task_config["expected_output"],
                agent=assigned_agent
            )
            
            print(f"Created task: {task_name} for agent: {agent_name}")
            task_instances.append(task)
    
    # Create Crew with enhanced configuration
    crew = Crew(
        agents=list(agents.values()),
        tasks=task_instances,
        process=Process.sequential,
        verbose=True,
        memory=False,  # Disable memory to avoid issues
        max_execution_time=300  # 5 minute timeout
    )
    
    print(f"Created crew with {len(agents)} agents and {len(task_instances)} tasks")
    for i, task in enumerate(task_instances):
        print(f"Task {i+1}: {task.description[:100]}...")
    
    return crew, f"ITR_TaxReduction_{client_type.title()}"

def _build_task_context(processed_documents, ca_report_data, client_type):
    """
    Build comprehensive context information for tasks
    """
    context_parts = []
    
    # Add client type information
    context_parts.append(f"CLIENT CATEGORY: {client_type.upper()}")
    
    # Add document information
    if processed_documents:
        if isinstance(processed_documents, dict):
            doc_text = processed_documents.get("combined_text", "")
            doc_count = len(processed_documents.get("individual_documents", []))
            context_parts.append(f"USER DOCUMENTS: {doc_count} documents processed")
            context_parts.append(f"DOCUMENT CONTENT PREVIEW: {doc_text[:1000]}...")
        else:
            context_parts.append(f"USER DOCUMENTS: {str(processed_documents)[:500]}...")
    else:
        context_parts.append("USER DOCUMENTS: No additional documents provided")
    
    # Add CA report information
    if ca_report_data:
        ca_insights = ca_report_data.get("extracted_insights", {})
        context_parts.append("CA REPORT ANALYSIS AVAILABLE:")
        context_parts.append(f"- Client type: {ca_insights.get('client_type', 'Unknown')}")
        
        # Add full CA report content for comprehensive analysis
        raw_content = ca_report_data.get("raw_content", "")
        if raw_content:
            context_parts.append("COMPLETE CA REPORT CONTENT:")
            context_parts.append(raw_content)
            context_parts.append("\n--- END OF CA REPORT ---\n")
        else:
            context_parts.append("CA REPORT: Content not available")
    else:
        context_parts.append("CA REPORT: No CA analysis provided")
    
    return "\n".join(context_parts)