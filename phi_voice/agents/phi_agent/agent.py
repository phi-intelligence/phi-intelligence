#!/usr/bin/env python3
"""
Phi Intelligence Voice Agent - General AI Assistant
Framework-compliant version following LiveKit Agents best practices.
- LiveKit Cloud ready
- Full prewarm of VAD, LLM, STT, TTS
- Uses a pool of warm processes to avoid cold starts
"""

import logging
import time
import os
import asyncio
from collections.abc import AsyncIterable
from typing import Optional
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
from livekit.plugins import (
    deepgram,
    openai,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.plugins import noise_cancellation

# ✅ Optional: Redis service (safe if missing)
try:
    from shared.redis_service import redis_service
except Exception:  # pragma: no cover
    class _DummyRedisService:
        async def initialize(self): ...
        async def store_voice_session(self, *a, **k): ...
        def is_available(self): return False
    redis_service = _DummyRedisService()  # type: ignore

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("phi.voice.agent")

load_dotenv()
print("🚀 Phi Voice Agent configured for LiveKit Cloud deployment")

# -----------------------------------------------------------------------------
# Agent definition
# -----------------------------------------------------------------------------

class PhiVoiceAgent(Agent):
    """General Phi Intelligence voice agent - Framework compliant"""

    def __init__(self):
        super().__init__(
            instructions=(
                "You are Phi Intelligence's production-grade realtime voice assistant, representing a leading AI company. "
                "You are the general AI assistant for Phi Intelligence, a company that revolutionizes business operations through innovative AI solutions. "
                "\n\n"
                "COMPANY OVERVIEW:\n"
                "• Company: Phi Intelligence\n"
                "• Location: London, UK\n"
                "• Mission: Revolutionize business operations through innovative AI solutions\n"
                "• Founded: 2024\n"
                "\n"
                "CORE SERVICES & EXPERTISE:\n"
                "• Custom Voice Bots & AI-Powered Voice Assistants (24/7 availability, natural conversation)\n"
                "• AI Business Intelligence (data-driven decision making, predictive insights)\n"
                "• AI-Enhanced Mobile Development (iOS/Android with voice recognition, computer vision)\n"
                "• Web Development with AI Integration\n"
                "• Conversational AI Solutions\n"
                "• Data Science & Machine Learning\n"
                "• IoT & Smart Home Solutions\n"
                "• Custom Analytics & Reporting\n"
                "• AI Integration Services\n"
                "• Workforce Management Solutions\n"
                "• Custom Development & AI Consulting\n"
                "\n"
                "TECHNICAL CAPABILITIES:\n"
                "• RAG-Powered AI Systems (Retrieval-Augmented Generation)\n"
                "• Real-time Voice Processing\n"
                "• Computer Vision & Image Recognition\n"
                "• Predictive Analytics & Pattern Recognition\n"
                "• Natural Language Processing\n"
                "• Smart Notifications & Location Awareness\n"
                "• Agentic Software Development\n"
                "• Multi-platform Integration (Web, Mobile, IoT)\n"
                "\n"
                "COMMUNICATION STYLE:\n"
                "• Keep responses concise, natural, and professional\n"
                "• No emojis or markdown formatting\n"
                "• Use clear, friendly tone that reflects Phi Intelligence's expertise\n"
                "• Adapt to interruptions gracefully\n"
                "• Focus on practical AI solutions and business value\n"
                "• Emphasize innovation, reliability, and cutting-edge technology\n"
                "\n"
                "WHEN DISCUSSING PHI INTELLIGENCE:\n"
                "• Highlight our London-based expertise and global reach\n"
                "• Emphasize our comprehensive AI service portfolio\n"
                "• Mention our focus on business transformation through AI\n"
                "• Reference our 24/7 voice assistant capabilities\n"
                "• Discuss our expertise in RAG-powered systems\n"
                "• Highlight our multi-industry experience\n"
                "\n"
                "You are a knowledgeable representative of Phi Intelligence, ready to discuss our AI services, technical capabilities, and help users understand how we can transform their business operations through innovative AI solutions."
            ),
        )

    async def on_enter(self):
        """Called when the agent enters the session - Framework pattern"""
        logger.info("Phi Intelligence agent entered")
        await self.session.generate_reply()

    async def tts_node(
        self, text: AsyncIterable[str], model_settings: ModelSettings
    ) -> AsyncIterable[rtc.AudioFrame]:
        """Process text through TTS - Framework pattern"""
        filtered_text = filter_markdown(text)  # strip markdown before TTS
        return super().tts_node(filtered_text, model_settings)

    # Tools --------------------------------------------------------------------

    @function_tool
    async def echo(self, phrase: str, context: RunContext) -> str:
        """Echo back a phrase. Useful for latency checks or diagnostics."""
        logger.info(f"Echo tool called with: {phrase}")
        return phrase

    @function_tool
    async def get_agent_info(self, context: RunContext) -> str:
        """Get agent information and capabilities."""
        info = {
            "company_name": "Phi Intelligence",
            "location": "London, UK",
            "mission": "Revolutionize business operations through innovative AI solutions",
            "core_services": [
                "Custom Voice Bots & AI-Powered Voice Assistants",
                "AI Business Intelligence & Data Analytics",
                "AI-Enhanced Mobile & Web Development",
                "Conversational AI Solutions",
                "Data Science & Machine Learning",
                "IoT & Smart Home Solutions",
                "Workforce Management Solutions",
                "Custom Development & AI Consulting"
            ],
            "technical_capabilities": [
                "RAG-Powered AI Systems",
                "Real-time Voice Processing",
                "Computer Vision & Image Recognition",
                "Predictive Analytics",
                "Natural Language Processing",
                "Multi-platform Integration"
            ]
        }
        logger.info(f"Agent info requested: {info}")
        return (
            f"I'm your {info['company_name']} AI assistant, representing a leading AI company based in {info['location']}. "
            f"Our mission is to {info['mission']}. "
            f"We specialize in {', '.join(info['core_services'][:3])} and more. "
            f"Our technical expertise includes {', '.join(info['technical_capabilities'][:3])} and advanced AI technologies. "
            f"How can I help you with AI solutions for your business today?"
        )

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
    #    Keep the same models you use inside the session.
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
            # Some providers allow a tiny synthesis to prime caches.
            _ = tts_client.synthesize("Hi.")
    except Exception as e:
        logger.info(f"TTS warm-up request optional/failed: {e}")

    logger.info("✅ Prewarm completed: VAD + (LLM/STT/TTS if available) primed")

# -----------------------------------------------------------------------------
# Entrypoint
# -----------------------------------------------------------------------------

async def entrypoint(ctx: JobContext):
    """Main entry point for the Phi voice agent - Framework compliant"""
    await ctx.connect()

    # Structured logging context per job
    ctx.log_context_fields = {
        "room": getattr(ctx.room, "name", "<unknown>"),
        "worker_id": ctx.worker_id,
    }

    room_name = getattr(ctx.room, "name", "<unknown>")
    logger.info(f"Starting Phi voice agent for room: {room_name}")
    logger.info("✅ Phi Intelligence general agent starting")

    # Optional Redis init (non-blocking friendly)
    try:
        redis_host = os.getenv("REDIS_HOST", "localhost")
        if redis_host == "localhost" and not os.getenv("REDIS_URL"):
            logger.info("ℹ️ Cloud environment assumed - Redis not on localhost")
            logger.info("ℹ️ Voice works without Redis (session persistence disabled)")
        else:
            await redis_service.initialize()
            logger.info("✅ Redis service initialized for session persistence")
    except Exception as e:
        logger.warning(f"⚠️ Redis initialization failed: {e}")
        logger.info("ℹ️ Continuing without Redis")

    # Set room metadata (best-effort)
    if hasattr(ctx.room, 'update_metadata'):
        try:
            await ctx.room.update_metadata({
                "company_name": "Phi Intelligence",
                "agent_type": "phi_voice",
                "mode": "phi",
                "capabilities": ["voice", "real_time", "ai_assistant"],
            })
            logger.info("✅ Room metadata updated")
        except Exception as e:
            logger.warning(f"Could not update room metadata: {e}")

    # Store session in Redis (best-effort)
    try:
        if getattr(redis_service, "is_available", lambda: False)():
            session_id = f"phi_session:{ctx.worker_id}:{int(time.time())}"
            session_data = {
                "voicebot_id": "phi_general",
                "company_name": "Phi Intelligence",
                "room_name": room_name,
                "worker_id": ctx.worker_id,
                "start_time": datetime.now(timezone.utc).isoformat(),
                "status": "active",
                "agent_type": "phi_voice",
                "last_activity": int(time.time())
            }
            asyncio.create_task(
                redis_service.store_voice_session(session_id, session_data)
            )
            logger.info("✅ Redis session persistence enabled")
        else:
            logger.info("ℹ️ Redis not available - session persistence disabled")
    except Exception as e:
        logger.warning(f"⚠️ Redis session storage failed: {e}")

    # Build session using prewarmed assets (fallback to fresh if missing)
    session = AgentSession(
        vad=ctx.proc.userdata.get("vad") or silero.VAD.load(),

        # LLM
        llm=ctx.proc.userdata.get("llm") or openai.LLM(
            model="gpt-4o-mini",
            api_key=os.getenv("OPENAI_API_KEY"),
        ),

        # STT
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

        # TTS
        tts=ctx.proc.userdata.get("tts_client") or deepgram.TTS(
            model="aura-2-andromeda-en",
            sample_rate=24000,
            api_key=os.getenv("DEEPGRAM_API_KEY"),
        ),

        # Performance & UX knobs
        preemptive_generation=True,
        allow_interruptions=True,
        min_interruption_duration=0.3,
        discard_audio_if_uninterruptible=True,
        min_consecutive_speech_delay=0.0,
        agent_false_interruption_timeout=4.0,
        use_tts_aligned_transcript=True,

        # AI-powered turn detection
        turn_detection=MultilingualModel(),
    )

    logger.info("✅ LiveKit best practices active:")
    logger.info("   - Preemptive generation: ON")
    logger.info("   - Interruptions: 0.3s detection")
    logger.info("   - Deepgram STT: punctuate + smart_format")
    logger.info("   - TTS aligned transcript: ON")
    logger.info("   - Turn detection: MultilingualModel")

    # Events -------------------------------------------------------------------

    @session.on("agent_false_interruption")
    def _on_agent_false_interruption(ev: AgentFalseInterruptionEvent):
        logger.info("False positive interruption, resuming agent speech")
        session.generate_reply(instructions=ev.extra_instructions or NOT_GIVEN)

    # Start the session
    await session.start(
        agent=PhiVoiceAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
        room_output_options=RoomOutputOptions(transcription_enabled=True),
    )

    logger.info("✅ Noise cancellation enabled (BVC)")
    logger.info("✅ Phi voice agent session started successfully")

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    # WorkerOptions for LiveKit Cloud deployment
    options = WorkerOptions(
        entrypoint_fnc=entrypoint,
        prewarm_fnc=prewarm,
        # Keep a small pool of hot processes to avoid cold start on first call
        num_idle_processes=3,
        # Give prewarm a bit more time if your models/providers are heavier
        initialize_process_timeout=20.0,
        # Optional tuning:
        # load_threshold=0.85,
    )
    cli.run_app(options)
