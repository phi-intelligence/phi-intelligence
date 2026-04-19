"""AI Planner service - converts markdown plans to structured tasks"""
import json
import logging
from typing import Dict, Any
from app.services.ai.gemini_client import ask_gemini

logger = logging.getLogger(__name__)

PLANNER_SYSTEM_PROMPT = """You are a project planning assistant. Convert project plans into structured JSON tasks.

Output format:
{
  "title": "Project title",
  "summary": "Brief summary of the plan",
  "phases": [
    {
      "name": "Phase name",
      "description": "Phase description",
      "tasks": [
        {
          "title": "Task title",
          "description": "Task details",
          "priority": "HIGH|MEDIUM|LOW",
          "estimated_hours": number,
          "dependencies": []
        }
      ]
    }
  ]
}

Only output valid JSON, no markdown formatting."""


async def analyze_plan(plan_text: str) -> Dict[str, Any]:
    """Analyze a markdown plan and return structured JSON"""
    prompt = f"""Analyze this project plan and convert it to structured tasks:

{plan_text}

Output the structured plan as JSON."""
    result = await ask_gemini(prompt, PLANNER_SYSTEM_PROMPT, json_mode=True)
    # Belt-and-braces: some environments still prepend a code fence even
    # when JSON mode is on, so strip it before json.loads.
    text = (result or "").strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines[1:]).strip()
    return json.loads(text)
