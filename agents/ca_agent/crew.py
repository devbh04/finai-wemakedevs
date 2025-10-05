import os
from crewai import Crew, Agent, Task, Process, LLM
from pathlib import Path
import yaml

CONFIG_DIR = Path(__file__).parent / "config"  # Absolute path

def create_crew(client_type: str, processed_documents=None):
    """
    Create CrewAI crew for a given client type
    """
    # Load YAML files
    with open(CONFIG_DIR / "agents.yaml", "r") as f:
        agents_yaml = yaml.safe_load(f)
    with open(CONFIG_DIR / "tasks.yaml", "r") as f:  # Use singular name if that's the file
        tasks_yaml = yaml.safe_load(f)

    # Map task by client_type
    task_name_map = {
        "salaried": "SalariedAnalysis",
        "self_employed": "SelfEmployedAnalysis",
        "business": "BusinessAnalysis"
    }
    task_name = task_name_map.get(client_type.lower(), "SalariedAnalysis")
    
    # Find the task configuration with better error handling
    task_config = None
    for t in tasks_yaml["tasks"]:
        if t["name"] == task_name:
            task_config = t
            break
    
    if not task_config:
        raise ValueError(f"Task configuration not found for task name: {task_name}. Available tasks: {[t['name'] for t in tasks_yaml['tasks']]}")

    # Setup LLM using your Cerebras API key
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

    # Create agents
    agent_instances = []
    for agent_def in agents_yaml["agents"]:
        agent_instances.append(
            Agent(
                role=agent_def["role"],
                goal=agent_def["goal"],
                backstory=agent_def.get("backstory", ""),
                llm=llm,
                verbose=agent_def.get("verbose", True),
                allow_delegation=agent_def.get("allow_delegation", True)
            )
        )

    # Create tasks - assign main task to the CharteredAccountant agent
    # Find the CharteredAccountant agent
    ca_agent = next((agent for agent in agent_instances 
                    if "Chartered Accountant" in agent.role), agent_instances[0])
    
    # Prepare task description with document content
    task_description = task_config["description"]
    
    # If we have processed documents, include their content in the task description
    if processed_documents:
        document_content = "\n\n=== DOCUMENT CONTENT TO ANALYZE ===\n"
        for doc in processed_documents:
            document_content += f"\n--- Document: {doc['filename']} ---\n"
            document_content += doc['content'][:3000] + ("..." if len(doc['content']) > 3000 else "")
            document_content += "\n" + "="*50 + "\n"
        
        task_description += document_content
        task_description += "\n\nPlease analyze the above document content and provide the requested financial analysis."
    
    task_instances = [
        Task(
            description=task_description,
            expected_output=task_config["expected_output"],
            agent=ca_agent
        )
    ]

    # Create Crew
    crew = Crew(
        agents=agent_instances,
        tasks=task_instances,
        process=Process.sequential,
        verbose=True
    )

    return crew, task_name
