# crew.py
# Orchestrator for Crew-style agents and tasks.
# Minimal, illustrative implementation — adapt to your CrewAI runtime.

import os
import yaml
import json
import time
from typing import Dict, Any, List
from pathlib import Path
from subprocess import Popen, PIPE

# Load YAML definitions for agents and tasks
def load_yaml(path: str):
    with open(path, 'r') as f:
        return yaml.safe_load(f)

class Crew:
    def __init__(self, agents_file='agents.yaml', tasks_file='tasks.yaml', env=None):
        self.agents_def = load_yaml(agents_file)
        self.tasks_def = load_yaml(tasks_file)
        self.env = env or os.environ.copy()

    def run_task(self, task_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Find the task in tasks_def and dispatch to appropriate agent(s).
        This example supports 'parse_markdown', 'ask_user_pref', 'scrape_listings', 'filter_listings'.
        """
        task = self.tasks_def.get('tasks', {}).get(task_name)
        if not task:
            raise ValueError(f"Task {task_name} not found")

        agent = task.get('agent')
        if agent == 'parser':
            return self._run_parser(payload)
        if agent == 'preference_agent':
            return self._run_preference_agent(payload)
        if agent == 'scraper':
            return self._run_scraper(payload)
        if agent == 'filter_agent':
            return self._run_filter_agent(payload)

        raise ValueError(f"No handler for agent {agent}")

    def _run_parser(self, payload):
        # Run local parser function
        from text_parsers import parse_markdown_income_expense
        md = payload.get('markdown', '')
        parsed = parse_markdown_income_expense(md)
        return {'status': 'ok', 'parsed': parsed}

    def _run_preference_agent(self, payload):
        # This agent simply reads preferences from payload or returns default
        pref = payload.get('preference')
        if pref:
            return {'status': 'ok', 'preference': pref}
        # If none provided, indicate interactive required
        return {'status': 'need_input', 'message': 'User preference not provided'}

    def _run_scraper(self, payload):
        # Delegates to scraper module
        from scrapers import scrape_listings_for_locality
        locality = payload.get('locality')
        budget = payload.get('budget')
        max_results = payload.get('max_results', 20)
        listings = scrape_listings_for_locality(locality, budget, max_results, env=self.env)
        return {'status': 'ok', 'listings': listings}

    def _run_filter_agent(self, payload):
        # Simple filter logic
        listings = payload.get('listings', [])
        budget = payload.get('budget')
        preferred_locality = payload.get('locality')
        filtered = []
        for L in listings:
            price = L.get('price_value')
            loc = L.get('locality', '').lower()
            if budget and price and price > budget:
                continue
            if preferred_locality and preferred_locality.lower() not in loc and payload.get('allow_other') is False:
                continue
            filtered.append(L)
        return {'status': 'ok', 'filtered': filtered}

# Example usage when run as script
if __name__ == '__main__':
    crew = Crew()
    sample_md = Path('sample.md').read_text() if Path('sample.md').exists() else ""
    print(crew.run_task('parse_markdown', {'markdown': sample_md}))
