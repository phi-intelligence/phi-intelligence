"""AI Reporter service - processes daily reports into actions"""
import json
import logging
from typing import List, Dict, Any
from app.services.ai.gemini_client import ask_gemini

logger = logging.getLogger(__name__)

REPORTER_SYSTEM_PROMPT = """You are a daily report analyzer. Extract actions from daily reports.

Output format:
{
  "summary": "Brief summary of the day",
  "actions": [
    {
      "type": "update_status|add_comment|log_time|create_task",
      "description": "What was done",
      "task_id": null,  // For update_status, add_comment, log_time
      "task_title": null,  // For create_task
      "status": null,  // For update_status: TODO|IN_PROGRESS|DONE
      "comment": null,  // For add_comment
      "hours": null,  // For log_time
      "project": null  // For create_task
    }
  ]
}

Only output valid JSON, no markdown formatting."""


async def process_report(report_text: str) -> Dict[str, Any]:
    """Process a daily report and extract actions"""
    prompt = f"""Analyze this daily report and extract actions:

{report_text}

Output the actions as JSON."""
    result = await ask_gemini(prompt, REPORTER_SYSTEM_PROMPT, json_mode=True)
    text = (result or "").strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines[1:]).strip()
    return json.loads(text)
