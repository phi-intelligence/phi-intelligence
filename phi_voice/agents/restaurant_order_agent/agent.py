#!/usr/bin/env python3
"""
Restaurant Order Voice Agent (Bella Vista) — LiveKit Cloud Ready
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
logger = logging.getLogger("phi.voice.agent.restaurant")

load_dotenv()
print("🚀 Restaurant Order Agent configured for LiveKit Cloud deployment")

# -----------------------------------------------------------------------------
# Agent definition
# -----------------------------------------------------------------------------

class RestaurantOrderAgent(Agent):
    """Restaurant order management agent - Framework compliant"""

    def __init__(self):
        super().__init__(
            instructions=(
                "You are a professional restaurant server at Bella Vista Restaurant in London, UK.\n"
                "\n"
                "CORE IDENTITY:\n"
                "• Restaurant: Bella Vista Restaurant\n"
                "• Location: London, UK\n"
                "• Your Role: Senior Server and Order Management Specialist\n"
                "• Experience: 6+ years in fine dining service\n"
                "\n"
                "RESTAURANT EXPERTISE:\n"
                "• Menu knowledge and food recommendations\n"
                "• Order taking and customization\n"
                "• Table reservations and seating management\n"
                "• Wine pairing and beverage service\n"
                "• Special dietary accommodations\n"
                "• Payment processing and billing\n"
                "• Customer service and hospitality\n"
                "\n"
                "COMMUNICATION STYLE:\n"
                "• Warm, professional, and enthusiastic about food\n"
                "• Use appropriate culinary terminology\n"
                "• Be helpful and knowledgeable about menu items\n"
                "• Show genuine care for customer preferences\n"
                "• Maintain a welcoming and friendly tone\n"
                "• Speak clearly and at a comfortable pace\n"
                "\n"
                "Remember: You represent a fine dining establishment. Always prioritize customer satisfaction, "
                "food quality, and exceptional dining experience."
            ),
        )

    async def on_enter(self):
        logger.info("Restaurant Order agent entered")
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
            "restaurant_name": "Bella Vista Restaurant",
            "location": "London, UK",
            "role": "Senior Server and Order Management Specialist",
            "experience": "6+ years in fine dining service",
            "core_services": [
                "Menu knowledge and food recommendations",
                "Order taking and customization",
                "Table reservations and seating management",
                "Wine pairing and beverage service",
                "Special dietary accommodations",
                "Payment processing and billing",
                "Customer service and hospitality",
            ],
            "specialties": [
                "Fine dining service",
                "Culinary expertise",
                "Guest experience management",
                "Restaurant operations",
                "Menu planning assistance",
                "Wine and beverage knowledge",
            ],
        }
        logger.info(f"Restaurant agent info requested: {info}")
        return (
            f"Welcome to {info['restaurant_name']} in {info['location']}! "
            f"I'm your {info['role']} with {info['experience']}. "
            f"I can help you with {', '.join(info['core_services'][:3])} and more. "
            f"My specialties include {', '.join(info['specialties'][:3])} and exceptional dining service. "
            f"How may I assist you with your dining experience today?"
        )

    @function_tool
    async def get_menu_recommendations(self, context: RunContext, dietary_preferences: str = "") -> str:
        logger.info(f"Menu recommendations requested for dietary preferences: {dietary_preferences}")

        recommendations = {
            "appetizers": [
                "Truffle Arancini - Creamy risotto balls with truffle oil",
                "Beef Carpaccio - Thinly sliced raw beef with arugula and parmesan",
                "Burrata Caprese - Fresh burrata with heirloom tomatoes and basil",
            ],
            "mains": [
                "Pan-Seared Salmon - With lemon butter sauce and seasonal vegetables",
                "Ribeye Steak - 12oz with red wine reduction and roasted potatoes",
                "Lobster Risotto - Creamy risotto with fresh lobster and herbs",
            ],
            "desserts": [
                "Tiramisu - Classic Italian dessert with coffee and mascarpone",
                "Chocolate Lava Cake - Warm chocolate cake with vanilla ice cream",
                "Panna Cotta - Vanilla custard with berry compote",
            ],
        }

        if "vegetarian" in dietary_preferences.lower():
            recommendations["mains"] = [
                "Mushroom Risotto - Wild mushroom risotto with truffle oil",
                "Eggplant Parmesan - Layered eggplant with marinara and mozzarella",
                "Quinoa Buddha Bowl - With roasted vegetables and tahini dressing",
            ]

        if "vegan" in dietary_preferences.lower():
            recommendations["mains"] = [
                "Vegan Pasta - Zucchini noodles with cashew cream sauce",
                "Stuffed Bell Peppers - With quinoa and seasonal vegetables",
                "Vegan Buddha Bowl - With roasted vegetables and tahini dressing",
            ]

        lines = ["Here are my recommendations for your dining experience:\n"]
        for category, items in recommendations.items():
            lines.append(f"{category.title()}:")
            lines.extend(f"• {item}" for item in items)
            lines.append("")
        lines.append("Would you like to hear about our wine pairings or have any questions about specific dishes?")
        return "\n".join(lines)

    @function_tool
    async def check_table_availability(self, party_size: int, context: RunContext, date: str = "", time: str = "") -> str:
        logger.info(f"Table availability check: party_size={party_size}, date={date}, time={time}")

        # Simulated availability
        available_tables = {
            2: ["Table 12", "Table 15", "Table 18"],
            4: ["Table 5", "Table 8", "Table 11"],
            6: ["Table 3", "Table 7"],
            8: ["Table 1", "Table 2"],
        }

        if party_size in available_tables:
            tables = available_tables[party_size]
            lines = [f"Great news! We have availability for your party of {party_size}:"]
            lines.extend(f"• {t}" for t in tables)
            lines.append("")
            lines.append("Would you like me to reserve one of these tables for you?")
            return "\n".join(lines)

        return (
            f"I'm sorry, but we don't have tables available for parties of {party_size}. "
            f"We can accommodate parties of 2, 4, 6, or 8 people. "
            f"Would you like me to check availability for a different party size?"
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
    """Main entry point for the Restaurant Order agent - Framework compliant"""
    await ctx.connect()

    ctx.log_context_fields = {
        "room": getattr(ctx.room, "name", "<unknown>"),
        "worker_id": ctx.worker_id,
    }

    room_name = getattr(ctx.room, "name", "<unknown>")
    logger.info(f"Starting Restaurant Order Agent for room: {room_name}")
    logger.info("✅ Bella Vista Restaurant Order Agent starting")

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
                "restaurant_name": "Bella Vista Restaurant",
                "agent_type": "restaurant_order",
                "mode": "restaurant",
                "capabilities": ["voice", "real_time", "restaurant_service", "order_management"],
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
        agent=RestaurantOrderAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
        room_output_options=RoomOutputOptions(transcription_enabled=True),
    )

    logger.info("✅ Noise cancellation enabled (BVC)")
    logger.info("✅ Restaurant Order Agent session started successfully")

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
