import metaLogo        from "../../../../ai_logos/meta_logo.png";
import mistralLogo     from "../../../../ai_logos/mistral_logo.png";
import qwenLogo        from "../../../../ai_logos/qwen_logo.png";
import microsoftLogo   from "../../../../ai_logos/microsoft_logo.png";
import gemmaLogo       from "../../../../ai_logos/gemma_logo.png";
import deepseekLogo    from "../../../../ai_logos/deepseek_logo.png";
import ollamaLogo      from "../../../../ai_logos/ollama_logo.png";
import lmstudioLogo    from "../../../../ai_logos/lmstudio_logo.png";
import vllmLogo        from "../../../../ai_logos/vllm_logo.png";
import langchainLogo   from "../../../../ai_logos/langchain_logo.png";
import llamaindexLogo  from "../../../../ai_logos/llamaindex_logo.png";
import huggingfaceLogo from "../../../../ai_logos/huggingface_logo.png";
import awsLogo         from "../../../../ai_logos/aws_logo.png";
import googlecloudLogo from "../../../../ai_logos/googlecloud_logo.png";
import azureLogo       from "../../../../ai_logos/azure_logo.png";
import elevenlabsLogo  from "../../../../ai_logos/elevenlabs_logo.png";
import livekitLogo     from "../../../../ai_logos/livekit_logo.png";
import googleLogo      from "../../../../ai_logos/google_logo.png";

/* ── Row data ───────────────────────────────────────────────────────── */
const ROW1 = [
  { logo: metaLogo,      name: "Meta Llama",   tag: "LLM"   },
  { logo: mistralLogo,   name: "Mistral",       tag: "LLM"   },
  { logo: qwenLogo,      name: "Qwen",          tag: "LLM"   },
  { logo: microsoftLogo, name: "Microsoft",     tag: "LLM"   },
  { logo: gemmaLogo,     name: "Gemma",         tag: "LLM"   },
  { logo: deepseekLogo,  name: "DeepSeek",      tag: "LLM"   },
];

const ROW2 = [
  { logo: ollamaLogo,      name: "Ollama",        tag: "Infra"  },
  { logo: lmstudioLogo,    name: "LM Studio",     tag: "Infra"  },
  { logo: vllmLogo,        name: "vLLM",          tag: "Infra"  },
  { logo: langchainLogo,   name: "LangChain",     tag: "SDK"    },
  { logo: llamaindexLogo,  name: "LlamaIndex",    tag: "SDK"    },
  { logo: huggingfaceLogo, name: "Hugging Face",  tag: "Models" },
];

const ROW3 = [
  { logo: awsLogo,         name: "AWS",           tag: "Cloud"  },
  { logo: googlecloudLogo, name: "Google Cloud",  tag: "Cloud"  },
  { logo: azureLogo,       name: "Azure",         tag: "Cloud"  },
  { logo: googleLogo,      name: "Gemini",        tag: "API"    },
  { logo: elevenlabsLogo,  name: "ElevenLabs",    tag: "Voice"  },
  { logo: livekitLogo,     name: "LiveKit",       tag: "Voice"  },
];

/* ── Logo card ──────────────────────────────────────────────────────── */
function LogoCard({ logo, name, tag }: { logo: string; name: string; tag: string }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 group cursor-default min-w-[160px]">
      <img
        src={logo}
        alt={name}
        className="w-7 h-7 object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
      />
      <div>
        <p className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors leading-tight">{name}</p>
        <p className="text-[9px] font-bold tracking-widest uppercase text-white/25 mt-0.5">{tag}</p>
      </div>
    </div>
  );
}

/* ── Marquee row ────────────────────────────────────────────────────── */
function MarqueeRow({
  items, reverse = false, duration = "28s",
}: {
  items: typeof ROW1;
  reverse?: boolean;
  duration?: string;
}) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="flex overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
      <div
        className="flex gap-3"
        style={{
          animation: `${reverse ? "marquee-right" : "marquee-left"} ${duration} linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((item, i) => (
          <LogoCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────────── */
export default function TechLogoNetwork({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-full bg-black overflow-hidden ${className}`}>

      {/* Keyframe injection */}
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      {/* Perspective tilt wrapper */}
      <div
        className="absolute inset-0 flex flex-col justify-center gap-3.5 px-2 py-6"
        style={{
          perspective: "900px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            transform: "rotateX(18deg) scale(1.02)",
            transformStyle: "preserve-3d",
          }}
          className="flex flex-col gap-3.5"
        >
          <MarqueeRow items={ROW1} reverse={false} duration="32s" />
          <MarqueeRow items={ROW2} reverse={true}  duration="26s" />
          <MarqueeRow items={ROW3} reverse={false} duration="30s" />
        </div>
      </div>

      {/* Top & bottom depth fades */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
    </div>
  );
}
