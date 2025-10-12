#!/usr/bin/env python3
"""
Hotel Receptionist Voice Agent (Grand Plaza) — LiveKit Cloud Ready
- Full prewarm of VAD, LLM, STT, TTS
- Keeps a pool of warm processes to avoid cold starts
- Framework-compliant structure, tools & logging
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

# Optional Redis hooks (kept disabled for this basic agent):
# from shared.redis_service import redis_service

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("phi.voice.agent.hotel")

load_dotenv()
print("🚀 Hotel Receptionist Agent configured for LiveKit Cloud deployment")

# -----------------------------------------------------------------------------
# Agent definition
# -----------------------------------------------------------------------------

class HotelReceptionistAgent(Agent):
    """Hotel receptionist agent - Framework compliant"""

    def __init__(self):
        super().__init__(
            instructions=(
                "You are a professional hotel receptionist at Grand Plaza Hotel in London, UK.\n"
                "\n"
                "CORE IDENTITY:\n"
                "• Hotel: Grand Plaza Hotel\n"
                "• Location: London, UK\n"
                "• Your Role: Senior Receptionist and Guest Services Coordinator\n"
                "• Experience: 5+ years in luxury hospitality\n"
                "\n"
                "HOSPITALITY EXPERTISE:\n"
                "• Room reservations and booking management\n"
                "• Check-in and check-out procedures\n"
                "• Guest services and concierge assistance\n"
                "• Hotel amenities and facilities information\n"
                "• Pricing and availability management\n"
                "• Special requests and accommodations\n"
                "• Multi-cultural guest communication\n"
                "\n"
                "COMMUNICATION STYLE:\n"
                "• Warm, professional, and welcoming\n"
                "• Use hospitality industry terminology appropriately\n"
                "• Be helpful and solution-oriented\n"
                "• Show genuine care for guest needs\n"
                "• Maintain confidentiality and discretion\n"
                "• Speak clearly and at a comfortable pace\n"
                "\n"
                "Remember: You represent a luxury hotel. Always prioritize guest satisfaction, comfort, and exceptional service."
            ),
        )

    async def on_enter(self):
        logger.info("Hotel Receptionist agent entered")
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
            "hotel_name": "Grand Plaza Hotel",
            "location": "London, UK",
            "role": "Senior Receptionist and Guest Services Coordinator",
            "experience": "5+ years in luxury hospitality",
            "core_services": [
                "Room reservations and booking management",
                "Check-in and check-out procedures",
                "Guest services and concierge assistance",
                "Hotel amenities and facilities information",
                "Pricing and availability management",
                "Special requests and accommodations",
                "Multi-cultural guest communication",
            ],
            "specialties": [
                "Luxury hospitality",
                "Guest experience management",
                "Concierge services",
                "Hotel operations",
                "Reservation management",
                "Guest relations",
            ],
        }
        logger.info(f"Hotel agent info requested: {info}")
        return (
            f"Welcome to {info['hotel_name']} in {info['location']}! "
            f"I'm your {info['role']} with {info['experience']}. "
            f"I can help you with {', '.join(info['core_services'][:3])} and more. "
            f"My specialties include {', '.join(info['specialties'][:3])} and exceptional guest service. "
            f"How may I assist you with your stay today?"
        )

    @function_tool
    async def check_room_availability(
        self,
        check_in_date: str,
        check_out_date: str,
        context: RunContext,
        room_type: str = "standard",
        guests: int = 2,
    ) -> str:
        logger.info(
            f"Room availability: check_in={check_in_date}, check_out={check_out_date}, "
            f"room_type={room_type}, guests={guests}"
        )

        # Simulated availability
        room_types = {
            "standard": {"price": 200, "available": True,  "description": "Comfortable room with city view"},
            "deluxe":   {"price": 350, "available": True,  "description": "Spacious room with premium amenities"},
            "suite":    {"price": 600, "available": False, "description": "Luxury suite with separate living area"},
            "presidential": {"price": 1200, "available": True, "description": "Ultimate luxury with panoramic views"},
        }

        info = room_types.get(room_type.lower(), room_types["standard"])

        if info["available"]:
            return (
                f"Excellent! I have availability for a {room_type.title()} room "
                f"from {check_in_date} to {check_out_date}. "
                f"The {info['description']} is available for £{info['price']} per night. "
                f"This room can accommodate up to {guests} guests comfortably. "
                f"Would you like me to proceed with the reservation?"
            )
        else:
            return (
                f"I'm sorry, but the {room_type.title()} room is not available for those dates. "
                f"However, I can offer you our Deluxe room for £350 per night, or check availability for different dates. "
                f"Would you like me to explore these alternatives?"
            )

    @function_tool
    async def get_hotel_amenities(self, context: RunContext, amenity_type: str = "all") -> str:
        logger.info(f"Hotel amenities requested: type={amenity_type}")

        amenities = {
            "dining": [
                "The Grand Restaurant - Fine dining with international cuisine",
                "Plaza Café - Casual dining and coffee bar",
                "Sky Lounge - Rooftop bar with panoramic city views",
                "Room Service - 24/7 in-room dining",
            ],
            "wellness": [
                "Spa & Wellness Center - Full-service spa with treatments",
                "Fitness Center - State-of-the-art gym equipment",
                "Indoor Pool - Heated pool with relaxation area",
                "Sauna & Steam Room - Traditional wellness facilities",
            ],
            "business": [
                "Business Center - 24/7 access with computers and printing",
                "Meeting Rooms - Flexible spaces for conferences",
                "High-Speed WiFi - Complimentary throughout the hotel",
                "Concierge Services - Personal assistance for all needs",
            ],
            "recreation": [
                "Rooftop Terrace - Outdoor space with city views",
                "Library Lounge - Quiet reading and relaxation area",
                "Game Room - Entertainment for all ages",
                "Valet Parking - Complimentary for all guests",
            ],
        }

        if amenity_type.lower() == "all":
            lines = ["Here are all our hotel amenities and facilities:\n"]
            for category, items in amenities.items():
                lines.append(f"{category.title()}:")
                lines.extend(f"• {item}" for item in items)
                lines.append("")
            lines.append("Is there anything specific you'd like to know more about or would you like to make a reservation?")
            return "\n".join(lines)

        category_items = amenities.get(amenity_type.lower(), amenities["dining"])
        lines = [f"Here are our {amenity_type.title()} amenities:\n"]
        lines.extend(f"• {item}" for item in category_items)
        lines.append("Is there anything specific you'd like to know more about or would you like to make a reservation?")
        return "\n".join(lines)

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
    """Main entry point for the Hotel Receptionist agent - Framework compliant"""
    await ctx.connect()

    ctx.log_context_fields = {
        "room": getattr(ctx.room, "name", "<unknown>"),
        "worker_id": ctx.worker_id,
    }

    room_name = getattr(ctx.room, "name", "<unknown>")
    logger.info(f"Starting Hotel Receptionist Agent for room: {room_name}")
    logger.info("✅ Grand Plaza Hotel Receptionist Agent starting")

    # Optional Redis init (kept disabled for this build)
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
                "hotel_name": "Grand Plaza Hotel",
                "agent_type": "hotel_receptionist",
                "mode": "hotel",
                "capabilities": ["voice", "real_time", "hotel_services", "guest_management"],
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
        agent=HotelReceptionistAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
        room_output_options=RoomOutputOptions(transcription_enabled=True),
    )

    logger.info("✅ Noise cancellation enabled (BVC)")
    logger.info("✅ Hotel Receptionist Agent session started successfully")

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
