import os
from crewai import Crew, Agent, Task, Process, LLM
from crewai_tools import SerperDevTool
from pathlib import Path
import yaml

CONFIG_DIR = Path(__file__).parent / "config"  # Absolute path

def create_crew(user_inputs: dict, ca_report_content: str = None):
    """
    Create CrewAI crew for equity investment analysis
    
    Args:
        user_inputs (dict): Dictionary containing user investment preferences
            - sector (str, optional): Preferred investment sector
            - goal (str): Investment goal
            - style (str): Investment style (trade/invest/swing_trade)
            - duration (str): Investment duration
            - risk_level (str): Risk level (low/medium/high)
        ca_report_content (str, optional): CA report markdown content
    """
    # Load YAML files
    with open(CONFIG_DIR / "agents.yaml", "r") as f:
        agents_yaml = yaml.safe_load(f)
    with open(CONFIG_DIR / "tasks.yaml", "r") as f:
        tasks_yaml = yaml.safe_load(f)

    # Setup LLM using Cerebras API key
    cerebras_api_key = os.environ.get("CEREBRAS_API_KEY")
    if not cerebras_api_key:
        raise ValueError("CEREBRAS_API_KEY not found in environment variables. Please set your Cerebras API key.")
    
    print(f"DEBUG: Using Cerebras API key: {cerebras_api_key[:10]}...")

    llm = LLM(
        model="cerebras/gpt-oss-120b",
        api_key=cerebras_api_key,
        base_url="https://api.cerebras.ai/v1",
        temperature=0.3,
        max_completion_tokens=15000,
    )

    # Initialize web search tool for agents that need it
    serper_tool = SerperDevTool()

    # Create agents
    agent_instances = []
    for agent_def in agents_yaml["agents"]:
        # Add tools for agents that need web search
        tools = []
        if agent_def.get("use_serper", False):
            tools = [serper_tool]
            
        agent_instances.append(
            Agent(
                role=agent_def["role"],
                goal=agent_def["goal"],
                backstory=agent_def.get("backstory", ""),
                llm=llm,
                verbose=agent_def.get("verbose", True),
                allow_delegation=agent_def.get("allow_delegation", False),
                tools=tools
            )
        )

    # Create task instances - both data scraping and investment planning
    task_instances = []
    
    # Task 1: Scrape Financial Data
    scrape_task_config = next(t for t in tasks_yaml["tasks"] if t["name"] == "scrape_financial_data")
    scraper_agent = agent_instances[0]  # Use first agent (LiveDataScraper)
    
    scrape_description = scrape_task_config["description"]
    if ca_report_content:
        scrape_description += f"\n\n=== CA REPORT CONTENT ===\n{ca_report_content}\n==================="
    
    # Add user inputs to the task description
    scrape_description += f"""
    
    === USER INVESTMENT PREFERENCES ===
    - Preferred Sector: {user_inputs.get('sector', 'Any sector')}
    - Investment Goal: {user_inputs.get('goal', 'Not specified')}
    - Investment Style: {user_inputs.get('style', 'invest')}
    - Investment Duration: {user_inputs.get('duration', 'Not specified')}
    - Risk Level: {user_inputs.get('risk_level', 'medium')}
    =====================================
    """
    
    scrape_task = Task(
        description=scrape_description,
        expected_output=scrape_task_config["expected_output"],
        agent=scraper_agent
    )
    task_instances.append(scrape_task)

    # Task 2: Create Investment Plan
    plan_task_config = next(t for t in tasks_yaml["tasks"] if t["name"] == "create_investment_plan")
    planner_agent = agent_instances[1]  # Use second agent (InvestmentPlanner)
    
    plan_description = plan_task_config["description"]
    if ca_report_content:
        plan_description += f"\n\n=== CA REPORT CONTENT ===\n{ca_report_content}\n==================="
    
    # Add user inputs to the investment planning task description
    plan_description += f"""
    
    === USER INVESTMENT PREFERENCES ===
    - Preferred Sector: {user_inputs.get('sector', 'Any sector')}
    - Investment Goal: {user_inputs.get('goal', 'Not specified')}
    - Investment Style: {user_inputs.get('style', 'invest')}
    - Investment Duration: {user_inputs.get('duration', 'Not specified')}
    - Risk Level: {user_inputs.get('risk_level', 'medium')}
    =====================================
    """
    
    plan_task = Task(
        description=plan_description,
        expected_output=plan_task_config["expected_output"],
        agent=planner_agent
    )
    task_instances.append(plan_task)

    # Create Crew
    crew = Crew(
        agents=agent_instances,
        tasks=task_instances,
        process=Process.sequential,
        verbose=True
    )

    return crew, "equity_analysis"
