#!/usr/bin/env python3
"""
Hospital Appointment Voice Agent (MedCare) — LiveKit Cloud Ready
- Full prewarm of VAD, LLM, STT, TTS
- Keeps a pool of warm processes to avoid cold starts
- Framework-compliant structure & logging
"""

import logging
import time
import os
import asyncio
from collections.abc import AsyncIterable
from datetime import datetime, timezone

from dotenv import load_dotenv

from livekit import rtc
from livekit.agents import (
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    AgentFalseInterruptionEvent,
    NOT_GIVEN,
    Agent,
    ModelSettings,
    RoomInputOptions,
    RoomOutputOptions,
    RunContext,
)
from livekit.agents.llm import function_tool
from livekit.agents.voice.transcription.filters import filter_markdown
from livekit.plugins import deepgram, openai, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.plugins import noise_cancellation

# Optional Redis hooks kept commented for a basic agent:
# from shared.redis_service import redis_service

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("phi.voice.agent.hospital")

load_dotenv()
print("🚀 Hospital Appointment Agent configured for LiveKit Cloud deployment")

# -----------------------------------------------------------------------------
# Agent definition
# -----------------------------------------------------------------------------

class HospitalAppointmentAgent(Agent):
    """Medical appointment coordinator agent - Framework compliant"""

    def __init__(self):
        super().__init__(
            instructions=(
                "You are a professional medical appointment coordinator at MedCare Hospital in London, UK.\n"
                "\n"
                "CORE IDENTITY:\n"
                "• Hospital: MedCare Hospital\n"
                "• Location: London, UK\n"
                "• Your Role: Senior Appointment Coordinator and Patient Services Specialist\n"
                "• Experience: 8+ years in healthcare administration\n"
                "\n"
                "MEDICAL EXPERTISE:\n"
                "• Appointment scheduling and management\n"
                "• Medical department coordination\n"
                "• Patient registration and information management\n"
                "• Emergency triage and urgent care protocols\n"
                "• Insurance and billing assistance\n"
                "• Medical department referrals\n"
                "• Patient privacy and confidentiality compliance\n"
                "\n"
                "COMMUNICATION STYLE:\n"
                "• Professional, compassionate, and reassuring\n"
                "• Use appropriate medical terminology\n"
                "• Be clear and precise in communication\n"
                "• Show empathy and understanding\n"
                "• Maintain patient confidentiality\n"
                "• Speak clearly and at a comfortable pace\n"
                "\n"
                "Remember: You represent a medical facility. Always prioritize patient safety, privacy, and care while providing efficient service."
            ),
        )

    async def on_enter(self):
        logger.info("Hospital Appointment agent entered")
        await self.session.generate_reply()

    async def tts_node(
        self, text: AsyncIterable[str], model_settings: ModelSettings
    ) -> AsyncIterable[rtc.AudioFrame]:
        filtered_text = filter_markdown(text)
        return super().tts_node(filtered_text, model_settings)

    # ------------------------- Tools -----------------------------------------

    @function_tool
    async def echo(self, phrase: str, context: RunContext) -> str:
        logger.info(f"Echo tool called with: {phrase}")
        return phrase

    @function_tool
    async def get_agent_info(self, context: RunContext) -> str:
        info = {
            "hospital_name": "MedCare Hospital",
            "location": "London, UK",
            "role": "Senior Appointment Coordinator and Patient Services Specialist",
            "experience": "8+ years in healthcare administration",
            "core_services": [
                "Appointment scheduling and management",
                "Medical department coordination",
                "Patient registration and information management",
                "Emergency triage and urgent care protocols",
                "Insurance and billing assistance",
                "Medical department referrals",
                "Patient privacy and confidentiality compliance",
            ],
            "specialties": [
                "Healthcare administration",
                "Medical appointment coordination",
                "Patient care management",
                "Medical department referrals",
                "Emergency protocols",
                "Healthcare compliance",
            ],
        }
        logger.info(f"Hospital agent info requested: {info}")
        return (
            f"Welcome to {info['hospital_name']} in {info['location']}! "
            f"I'm your {info['role']} with {info['experience']}. "
            f"I can help you with {', '.join(info['core_services'][:3])} and more. "
            f"My specialties include {', '.join(info['specialties'][:3])}. "
            f"How may I assist you with your healthcare needs today?"
        )

    @function_tool
    async def schedule_appointment(
        self,
        patient_name: str,
        department: str,
        context: RunContext,
        urgency: str = "routine",
        preferred_date: str = "",
    ) -> str:
        logger.info(
            f"Appointment scheduling: patient={patient_name}, department={department}, "
            f"urgency={urgency}, date={preferred_date}"
        )

        departments = {
            "cardiology": "Cardiology Department",
            "dermatology": "Dermatology Department",
            "orthopedics": "Orthopedics Department",
            "pediatrics": "Pediatrics Department",
            "general": "General Medicine",
        }

        urgency_levels = {
            "emergency": "immediate",
            "urgent": "within 24 hours",
            "routine": "within 1-2 weeks",
        }

        dept_name = departments.get(department.lower(), department)
        urgency_time = urgency_levels.get(urgency.lower(), "within 1-2 weeks")

        response = (
            f"Thank you, {patient_name}. I'm scheduling your appointment with the {dept_name}. "
            f"Based on the {urgency} urgency level, I can get you an appointment {urgency_time}. "
        )

        if preferred_date:
            response += (
                f"I'll check availability for {preferred_date} and get back to you with confirmation. "
            )
        else:
            response += (
                f"I'll find the next available slot and contact you with the details. "
            )

        response += (
            "Please have your insurance information and ID ready when you arrive. "
            "Is there anything else I can help you with regarding your appointment?"
        )
        return response

    @function_tool
    async def check_department_availability(
        self, department: str, context: RunContext, date: str = ""
    ) -> str:
        logger.info(f"Department availability check: department={department}, date={date}")

        departments = {
            "cardiology": {"availability": "Mon–Fri 8:00–17:00", "wait_time": "2–3 weeks"},
            "dermatology": {"availability": "Mon–Thu 9:00–16:00", "wait_time": "1–2 weeks"},
            "orthopedics": {"availability": "Mon–Fri 8:00–18:00", "wait_time": "1–3 weeks"},
            "pediatrics": {"availability": "Mon–Fri 8:00–17:00; Sat 9:00–13:00", "wait_time": "1–2 weeks"},
            "general": {"availability": "Mon–Fri 8:00–18:00; Sat 9:00–14:00", "wait_time": "3–5 days"},
        }

        dept_info = departments.get(
            department.lower(),
            {"availability": "Please call for availability", "wait_time": "Varies"},
        )

        response = (
            f"Here's the availability for the {department.title()} Department:\n\n"
            f"Hours: {dept_info['availability']}\n"
            f"Current wait time: {dept_info['wait_time']}\n\n"
        )

        if date:
            response += (
                f"For {date}, I can check specific time slots. "
                f"Would you like me to look for available appointments on that date?"
            )
        else:
            response += (
                "Would you like me to schedule an appointment or check availability for a specific date?"
            )

        return response

# -----------------------------------------------------------------------------
# Prewarm
# -----------------------------------------------------------------------------

def prewarm(proc: JobProcess):
    """
    Preload heavy assets & prime providers for low first-byte latency.
    Runs once per worker process (before any job is assigned).
    """
    # 1) Local models/libs
    proc.userdata["vad"] = silero.VAD.load()

    # 2) External clients (constructed once per process)
    try:
        proc.userdata["llm"] = openai.LLM(
            model="gpt-4o-mini",
            api_key=os.getenv("OPENAI_API_KEY"),
        )
    except Exception as e:
        logger.warning(f"LLM client prewarm failed (will retry on session): {e}")

    try:
        proc.userdata["stt_client"] = deepgram.STT(
            model="nova-3",
            language="en-US",
            interim_results=True,
            endpointing_ms=500,
            filler_words=True,
            punctuate=True,
            smart_format=True,
            api_key=os.getenv("DEEPGRAM_API_KEY"),
        )
    except Exception as e:
        logger.warning(f"STT client prewarm failed (will retry on session): {e}")

    try:
        proc.userdata["tts_client"] = deepgram.TTS(
            model="aura-2-andromeda-en",
            sample_rate=24000,
            api_key=os.getenv("DEEPGRAM_API_KEY"),
        )
    except Exception as e:
        logger.warning(f"TTS client prewarm failed (will retry on session): {e}")

    # 3) Tiny “hello” calls to warm network/auth stacks (best-effort)
    try:
        llm = proc.userdata.get("llm")
        if llm:
            _ = llm.complete("hi")
    except Exception as e:
        logger.info(f"LLM warm-up request skipped: {e}")

    try:
        tts_client = proc.userdata.get("tts_client")
        if tts_client:
            _ = tts_client.synthesize("Hi.")
    except Exception as e:
        logger.info(f"TTS warm-up request optional/failed: {e}")

    logger.info("✅ Prewarm completed: VAD + (LLM/STT/TTS if available) primed")

# -----------------------------------------------------------------------------
# Entrypoint
# -----------------------------------------------------------------------------

async def entrypoint(ctx: JobContext):
    """Main entry point for the Hospital Appointment agent - Framework compliant"""
    await ctx.connect()

    ctx.log_context_fields = {
        "room": getattr(ctx.room, "name", "<unknown>"),
        "worker_id": ctx.worker_id,
    }

    room_name = getattr(ctx.room, "name", "<unknown>")
    logger.info(f"Starting Hospital Appointment Agent for room: {room_name}")
    logger.info("✅ MedCare Hospital Appointment Agent starting")

    # Optional Redis init (kept disabled for basic agent)
    try:
        redis_host = os.getenv("REDIS_HOST", "localhost")
        if redis_host == "localhost" and not os.getenv("REDIS_URL"):
            logger.info("ℹ️ Cloud environment assumed - Redis not on localhost")
            logger.info("ℹ️ Voice will work without Redis (session persistence disabled)")
        else:
            logger.info("✅ Redis service would initialize here (disabled in this build)")
            # await redis_service.initialize()
    except Exception as e:
        logger.warning(f"⚠️ Redis initialization failed: {e}")
        logger.info("ℹ️ Continuing without Redis")

    # Set room metadata (best-effort)
    if hasattr(ctx.room, "update_metadata"):
        try:
            await ctx.room.update_metadata({
                "hospital_name": "MedCare Hospital",
                "agent_type": "hospital_appointment",
                "mode": "hospital",
                "capabilities": ["voice", "real_time", "medical_appointments", "patient_services"],
            })
            logger.info("✅ Room metadata updated successfully")
        except Exception as e:
            logger.warning(f"Could not update room metadata: {e}")

    logger.info("ℹ️ Redis not available - session persistence disabled (voice functionality unaffected)")

    # Build session using prewarmed assets (fallback to fresh if missing)
    session = AgentSession(
        vad=ctx.proc.userdata.get("vad") or silero.VAD.load(),

        llm=ctx.proc.userdata.get("llm") or openai.LLM(
            model="gpt-4o-mini",
            api_key=os.getenv("OPENAI_API_KEY"),
        ),

        stt=ctx.proc.userdata.get("stt_client") or deepgram.STT(
            model="nova-3",
            language="en-US",
            interim_results=True,
            endpointing_ms=500,
            filler_words=True,
            punctuate=True,
            smart_format=True,
            api_key=os.getenv("DEEPGRAM_API_KEY"),
        ),

        tts=ctx.proc.userdata.get("tts_client") or deepgram.TTS(
            model="aura-2-andromeda-en",
            sample_rate=24000,
            api_key=os.getenv("DEEPGRAM_API_KEY"),
        ),

        preemptive_generation=True,
        allow_interruptions=True,
        min_interruption_duration=0.3,
        discard_audio_if_uninterruptible=True,
        min_consecutive_speech_delay=0.0,
        agent_false_interruption_timeout=4.0,
        use_tts_aligned_transcript=True,

        turn_detection=MultilingualModel(),
    )

    logger.info("✅ LiveKit best practices active:")
    logger.info("   - Preemptive generation: ON")
    logger.info("   - Interruptions: 0.3s detection")
    logger.info("   - Deepgram STT: punctuate + smart_format")
    logger.info("   - TTS aligned transcript: ON")
    logger.info("   - Turn detection: MultilingualModel")

    @session.on("agent_false_interruption")
    def _on_agent_false_interruption(ev: AgentFalseInterruptionEvent):
        logger.info("False positive interruption, resuming agent speech")
        session.generate_reply(instructions=ev.extra_instructions or NOT_GIVEN)

    await session.start(
        agent=HospitalAppointmentAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
        room_output_options=RoomOutputOptions(transcription_enabled=True),
    )

    logger.info("✅ Noise cancellation enabled (BVC)")
    logger.info("✅ Hospital Appointment Agent session started successfully")

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    options = WorkerOptions(
        entrypoint_fnc=entrypoint,
        prewarm_fnc=prewarm,
        num_idle_processes=3,            # keep 3 hot processes ready
        initialize_process_timeout=20.0, # allow heavier prewarm
        # load_threshold=0.85,           # optional tuning
    )
    cli.run_app(options)
