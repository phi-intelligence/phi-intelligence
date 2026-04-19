"""AI-generated narrative insights for the admin dashboard.

Pulls a small structured snapshot of the workspace (who is clocked in, what
tasks were completed today, where each active project stands, what's
blocked) and asks Gemini to summarise it in a few short, factual bullets the
admin can scan in 5 seconds.
"""
import json
import logging
from typing import Any, Dict, List

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.admin_service import get_live_dashboard_service
from app.services.ai.gemini_client import ask_gemini

logger = logging.getLogger(__name__)


INSIGHTS_SYSTEM_PROMPT = """You are the operations co-pilot for a small software
engineering company. The admin opens their dashboard once or twice a day and
needs a 30-second briefing.

You will receive a JSON snapshot describing:
- workforce.clocked_in: people currently working
- workforce.finished_today: people who have already logged hours and clocked out
- projects[]: every active project with task counts and progress %
- completed_recent[]: tasks finished in the last 24 hours, with assignee and project

Return STRICT JSON only, in this shape:
{
  "headline": "one sentence summarising the day so far",
  "highlights": [
    "Sreehari finished \"X\" on Project Y",
    "Project Z is 45% complete and on track",
    "3 tasks are blocked on Project A"
  ],
  "risks": [
    "Project Beta has 0 progress and 5 open tasks"
  ],
  "next_actions": [
    "Re-assign blocked tasks on Project A",
    "Schedule a sync with Melbin (no hours logged today)"
  ]
}

Rules:
- Keep every sentence under 18 words.
- Use real names from the snapshot. Never invent people, tasks or projects.
- If there is nothing to say in a section, return an empty array (not null).
- Never include markdown, never wrap in code fences. JSON only.
"""


def _strip_code_fence(text: str) -> str:
    text = (text or "").strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines[1:])
    return text.strip()


def _fallback_insights(snapshot: Dict[str, Any]) -> Dict[str, List[str]]:
    """Deterministic insights used when the LLM is unavailable or fails."""
    workforce = snapshot.get("workforce", {}) or {}
    projects = snapshot.get("projects", []) or []
    completed = snapshot.get("completed_recent", []) or []

    headline_bits = []
    if workforce.get("clocked_in_count"):
        headline_bits.append(f"{workforce['clocked_in_count']} working now")
    if workforce.get("total_hours_today"):
        headline_bits.append(f"{workforce['total_hours_today']:.1f}h logged")
    if completed:
        headline_bits.append(f"{len(completed)} task(s) completed today")
    headline = "; ".join(headline_bits) or "Quiet day so far — no activity yet."

    highlights: List[str] = []
    for task in completed[:5]:
        who = (task.get("assignee") or {}).get("name") or "Someone"
        project = (task.get("project") or {}).get("name") or "a project"
        highlights.append(f"{who} finished “{task['title']}” on {project}")

    risks: List[str] = []
    for project in projects:
        counts = project.get("task_counts", {}) or {}
        if counts.get("blocked", 0) > 0:
            risks.append(
                f"{project['name']}: {counts['blocked']} blocked task(s)"
            )
        elif counts.get("total", 0) > 0 and project.get("progress_percent", 0) == 0:
            risks.append(f"{project['name']}: no completed tasks yet")

    return {
        "headline": headline,
        "highlights": highlights,
        "risks": risks[:5],
        "next_actions": [],
    }


async def generate_admin_insights(db: AsyncSession) -> Dict[str, Any]:
    """Build a workspace snapshot and return AI insights + the snapshot."""
    snapshot = await get_live_dashboard_service(db)

    # Strip noisy fields the model doesn't need.
    compact = {
        "workforce": snapshot.get("workforce"),
        "projects": [
            {
                "name": p["name"],
                "status": p["status"],
                "progress_percent": p["progress_percent"],
                "task_counts": p["task_counts"],
                "lead": (p.get("lead") or {}).get("name"),
                "members": p["members"],
            }
            for p in snapshot.get("projects", [])
        ],
        "completed_recent": [
            {
                "title": t["title"],
                "project": (t.get("project") or {}).get("name"),
                "assignee": (t.get("assignee") or {}).get("name"),
                "actual_hours": t.get("actual_hours"),
            }
            for t in snapshot.get("completed_recent", [])
        ],
    }

    prompt = (
        "Workspace snapshot:\n"
        + json.dumps(compact, indent=2, default=str)
        + "\n\nReturn the JSON briefing now."
    )

    try:
        raw = await ask_gemini(prompt, INSIGHTS_SYSTEM_PROMPT, json_mode=True)
        cleaned = _strip_code_fence(raw)
        insights = json.loads(cleaned)
        # Guarantee shape
        for key in ("highlights", "risks", "next_actions"):
            if key not in insights or not isinstance(insights[key], list):
                insights[key] = []
        if "headline" not in insights:
            insights["headline"] = _fallback_insights(snapshot)["headline"]
        return {"insights": insights, "snapshot": snapshot, "source": "gemini"}
    except Exception as e:  # noqa: BLE001
        logger.warning("Admin insights LLM failed, using fallback: %s", e)
        return {
            "insights": _fallback_insights(snapshot),
            "snapshot": snapshot,
            "source": "fallback",
        }


# ---------------------------------------------------------------------------
# AI task generator: turn a free-text objective into a list of tasks scoped to
# a specific project. The endpoint returns proposals; the existing
# /ai/plan/apply endpoint can commit them.
# ---------------------------------------------------------------------------

GENERATE_TASKS_SYSTEM_PROMPT = """You are a project manager assistant. Given a
project name plus a short objective, produce a list of concrete, atomic tasks
ready to drop on a Kanban board.

Output STRICT JSON, no markdown, in this exact shape:
{
  "title": "<project name>",
  "summary": "<one-sentence summary of the objective>",
  "phases": [
    {
      "name": "Phase name",
      "description": "Why this phase exists",
      "tasks": [
        {
          "title": "Verb-led task title (max 80 chars)",
          "description": "1-2 sentences of detail",
          "priority": "HIGH" | "MEDIUM" | "LOW",
          "estimated_hours": number
        }
      ]
    }
  ]
}

Rules:
- Always include at least one phase.
- Every task must have title, description, priority and estimated_hours.
- Keep estimates realistic (0.5 to 16 hours each).
- Total tasks: at most 12.
- Respond with JSON only.
"""


async def generate_tasks_from_objective(
    project_name: str,
    objective: str,
    member_names: List[str],
) -> Dict[str, Any]:
    """Ask the LLM to draft tasks for a project objective. Caller commits."""
    prompt = (
        f"Project: {project_name}\n"
        f"Team: {', '.join(member_names) if member_names else 'no specific assignees'}\n\n"
        f"Objective:\n{objective.strip()}\n\n"
        "Produce the JSON plan now."
    )
    raw = await ask_gemini(prompt, GENERATE_TASKS_SYSTEM_PROMPT, json_mode=True)
    cleaned = _strip_code_fence(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.warning("Task generator returned invalid JSON: %s", e)
        raise ValueError("AI response was not valid JSON. Try again.") from e
