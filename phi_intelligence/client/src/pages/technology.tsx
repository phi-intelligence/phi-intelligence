import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import TechLogoNetwork from "@/components/three/TechLogoNetwork";

/* ── Commercial API logo imports ────────────────────────────────────── */
import openaiLogo    from "../../../additional_logos_icons/openai_logo.png";
import anthropicLogo from "../../../additional_logos_icons/anthropic_logo.png";
import deepgramLogo  from "../../../additional_logos_icons/deepgram_logo.png";
import geminiLogo    from "../../../additional_logos_icons/gemini_logo.png";

/* ── AI logo imports ─────────────────────────────────────────────────── */
import metaLogo        from "../../../ai_logos/meta_logo.png";
import mistralLogo     from "../../../ai_logos/mistral_logo.png";
import qwenLogo        from "../../../ai_logos/qwen_logo.png";
import microsoftLogo   from "../../../ai_logos/microsoft_logo.png";
import gemmaLogo       from "../../../ai_logos/gemma_logo.png";
import deepseekLogo    from "../../../ai_logos/deepseek_logo.png";
import ollamaLogo      from "../../../ai_logos/ollama_logo.png";
import lmstudioLogo    from "../../../ai_logos/lmstudio_logo.png";
import vllmLogo        from "../../../ai_logos/vllm_logo.png";
import aiLangchainLogo from "../../../ai_logos/langchain_logo.png";
import aiLlamaindexLogo from "../../../ai_logos/llamaindex_logo.png";
import huggingfaceLogo from "../../../ai_logos/huggingface_logo.png";
import awsLogo         from "../../../ai_logos/aws_logo.png";
import googlecloudLogo from "../../../ai_logos/googlecloud_logo.png";
import azureLogo       from "../../../ai_logos/azure_logo.png";
import googleLogo      from "../../../ai_logos/google_logo.png";
import elevenlabsLogo  from "../../../ai_logos/elevenlabs_logo.png";
import livekitLogo     from "../../../ai_logos/livekit_logo.png";

/* ── Framework / language logo imports ──────────────────────────────── */
import reactLogo        from "../../../frameworks_logos/react_logo.png";
import nextjsLogo       from "../../../frameworks_logos/nextdotjs_logo.png";
import typescriptLogo   from "../../../frameworks_logos/typescript_logo.png";
import javascriptLogo   from "../../../frameworks_logos/javascript_logo.png";
import tailwindLogo     from "../../../frameworks_logos/tailwindcss_logo.png";
import vueLogo          from "../../../frameworks_logos/vue_logo.png";
import pythonLogo       from "../../../frameworks_logos/python_logo.png";
import nodejsLogo       from "../../../frameworks_logos/nodedotjs_logo.png";
import fastapiLogo      from "../../../frameworks_logos/fastapi_logo.png";
import djangoLogo       from "../../../frameworks_logos/django_logo.png";
import expressLogo      from "../../../frameworks_logos/express_logo.png";
import goLogo           from "../../../frameworks_logos/go_logo.png";
import reactnativeLogo  from "../../../frameworks_logos/reactnative_logo.png";
import flutterLogo      from "../../../frameworks_logos/flutter_logo.png";
import swiftLogo        from "../../../frameworks_logos/swift_logo.png";
import kotlinLogo       from "../../../frameworks_logos/kotlin_logo.png";
import pytorchLogo      from "../../../frameworks_logos/pytorch_logo.png";
import tensorflowLogo   from "../../../frameworks_logos/tensorflow_logo.png";
import scikitlearnLogo  from "../../../frameworks_logos/scikitlearn_logo.png";
import transformersLogo from "../../../frameworks_logos/transformers_logo.png";
import langchainLogo    from "../../../frameworks_logos/langchain_logo.png";
import llamaindexLogo   from "../../../frameworks_logos/llamaindex_logo.png";
import postgresLogo     from "../../../frameworks_logos/postgresql_logo.png";
import mongodbLogo      from "../../../frameworks_logos/mongodb_logo.png";
import redisLogo        from "../../../frameworks_logos/redis_logo.png";
import qdrantLogo       from "../../../frameworks_logos/qdrant_logo.png";
import supabaseLogo     from "../../../frameworks_logos/supabase_logo.png";
import s3Logo           from "../../../frameworks_logos/s3_logo.png";

/* ── Category dot colours (static strings for Tailwind JIT) ─────────── */
const CAT_DOT = {
  frontend: "bg-blue-400",
  backend:  "bg-emerald-400",
  mobile:   "bg-violet-400",
  aiml:     "bg-amber-400",
  data:     "bg-rose-400",
} as const;

/* ── Languages & Frameworks data ─────────────────────────────────────── */
const langFrameworks: {
  category: string;
  dotKey: keyof typeof CAT_DOT;
  items: { name: string; logo: string }[];
}[] = [
  {
    category: "Frontend",
    dotKey: "frontend",
    items: [
      { name: "React",        logo: reactLogo       },
      { name: "Next.js",      logo: nextjsLogo      },
      { name: "TypeScript",   logo: typescriptLogo  },
      { name: "JavaScript",   logo: javascriptLogo  },
      { name: "Tailwind CSS", logo: tailwindLogo    },
      { name: "Vue.js",       logo: vueLogo         },
    ],
  },
  {
    category: "Backend",
    dotKey: "backend",
    items: [
      { name: "Python",     logo: pythonLogo  },
      { name: "Node.js",    logo: nodejsLogo  },
      { name: "FastAPI",    logo: fastapiLogo },
      { name: "Django",     logo: djangoLogo  },
      { name: "Express.js", logo: expressLogo },
      { name: "Go",         logo: goLogo      },
    ],
  },
  {
    category: "Mobile",
    dotKey: "mobile",
    items: [
      { name: "React Native", logo: reactnativeLogo },
      { name: "Flutter",      logo: flutterLogo     },
      { name: "Swift",        logo: swiftLogo       },
      { name: "Kotlin",       logo: kotlinLogo      },
    ],
  },
  {
    category: "AI / ML",
    dotKey: "aiml",
    items: [
      { name: "PyTorch",        logo: pytorchLogo      },
      { name: "TensorFlow",     logo: tensorflowLogo   },
      { name: "scikit-learn",   logo: scikitlearnLogo  },
      { name: "Transformers",   logo: transformersLogo },
      { name: "LangChain",      logo: langchainLogo    },
      { name: "LlamaIndex",     logo: llamaindexLogo   },
      { name: "Vercel AI SDK",  logo: nextjsLogo       },
    ],
  },
  {
    category: "Data & Storage",
    dotKey: "data",
    items: [
      { name: "PostgreSQL", logo: postgresLogo },
      { name: "MongoDB",    logo: mongodbLogo  },
      { name: "Redis",      logo: redisLogo    },
      { name: "Qdrant",     logo: qdrantLogo   },
      { name: "Supabase",   logo: supabaseLogo },
      { name: "AWS S3",     logo: s3Logo       },
    ],
  },
];

/* ── AI model data ────────────────────────────────────────────────────── */
const llms = [
  { model: "Llama 3.x / 4",    provider: "Meta",          logo: metaLogo,      useCases: ["General reasoning", "Code generation", "Multilingual", "RAG"] },
  { model: "Mistral / Mixtral", provider: "Mistral AI",    logo: mistralLogo,   useCases: ["Efficient inference", "MoE architecture", "Cost-effective"] },
  { model: "Qwen 2.5 / QwQ",   provider: "Alibaba Cloud", logo: qwenLogo,      useCases: ["Code generation", "Reasoning", "Multilingual"] },
  { model: "Phi-4",             provider: "Microsoft",     logo: microsoftLogo, useCases: ["Small model", "On-device AI", "Efficient inference"] },
  { model: "Gemma 3",           provider: "Google",        logo: gemmaLogo,     useCases: ["Lightweight tasks", "On-device", "Vision-language"] },
  { model: "DeepSeek V3 / R1",  provider: "DeepSeek",      logo: deepseekLogo,  useCases: ["Advanced reasoning", "Mathematics", "Code generation"] },
  { model: "Devstral",          provider: "Mistral AI",    logo: mistralLogo,   useCases: ["Code-specialised", "Agentic coding workflows", "Cursor & Claude Code integration"] },
];

const cvModels = [
  { model: "SAM 2",          provider: "Meta",                logo: metaLogo,      capabilities: ["Image & video segmentation", "Zero-shot"] },
  { model: "YOLO v10 / v11", provider: "Ultralytics",         logo: null,          capabilities: ["Real-time object detection", "Tracking"] },
  { model: "FLUX.1 / SDXL",  provider: "BFL / Stability AI", logo: null,          capabilities: ["Image generation", "Product visualisation"] },
  { model: "Docling",        provider: "IBM",                 logo: null,          capabilities: ["Document understanding", "Layout analysis"] },
  { model: "Florence-2",     provider: "Microsoft",           logo: microsoftLogo, capabilities: ["Vision-language", "Visual QA"] },
];

const speechModels = [
  { model: "Whisper Large V3", provider: "OpenAI (open-source)", logo: null,     capabilities: ["Speech-to-text", "100+ languages"] },
  { model: "Bark / XTTS",      provider: "Suno AI / Coqui",      logo: null,     capabilities: ["Text-to-speech", "Voice cloning"] },
  { model: "MMS",              provider: "Meta",                  logo: metaLogo, capabilities: ["1000+ languages", "Massively multilingual"] },
];

const infrastructure = [
  { name: "Ollama",                       logo: ollamaLogo,       desc: "Local model deployment and serving" },
  { name: "LM Studio",                    logo: lmstudioLogo,     desc: "Desktop GUI for running LLMs locally" },
  { name: "vLLM",                         logo: vllmLogo,         desc: "High-throughput memory-efficient inference engine" },
  { name: "LangChain",                    logo: aiLangchainLogo,  desc: "LLM orchestration, RAG pipelines, and autonomous agents" },
  { name: "LlamaIndex",                   logo: aiLlamaindexLogo, desc: "Data connectors, RAG pipelines, and query engines" },
  { name: "Hugging Face Hub",             logo: huggingfaceLogo,  desc: "1M+ pre-trained models, 200K+ datasets, Transformers library" },
  { name: "AWS",                          logo: awsLogo,          desc: "GPU instances, SageMaker, Lambda, and S3 for AI workloads" },
  { name: "Google Cloud",                 logo: googlecloudLogo,  desc: "Vertex AI, GKE, Cloud Run, and GCS for scalable deployments" },
  { name: "Azure",                        logo: azureLogo,        desc: "Azure ML, AKS, and OpenAI Service integrations" },
  { name: "Qdrant / Weaviate / ChromaDB", logo: null,             desc: "Vector databases for semantic search and RAG" },
  { name: "BentoML / TorchServe",         logo: null,             desc: "Production model serving with auto-scaling" },
  { name: "Docker / Kubernetes",          logo: null,             desc: "Containerised AI deployments with orchestration" },
];

const commercial = [
  { name: "OpenAI",        detail: "GPT-4o, o3-mini",             logo: openaiLogo    },
  { name: "Anthropic",     detail: "Claude Opus, Sonnet, Haiku",   logo: anthropicLogo },
  { name: "Google Gemini", detail: "Multimodal AI, Long context",  logo: geminiLogo    },
  { name: "Deepgram",      detail: "Enterprise STT, Nova-3",       logo: deepgramLogo  },
  { name: "ElevenLabs",    detail: "Realistic TTS, Voice cloning", logo: elevenlabsLogo },
  { name: "LiveKit",       detail: "Real-time WebRTC, Voice AI",   logo: livekitLogo   },
];

/* ── LangCard ─────────────────────────────────────────────────────────── */
function LangCard({ logo, name }: { logo: string; name: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-phi-blue/30 hover:bg-phi-blue/[0.05] transition-all duration-300 group cursor-default">
      <img
        src={logo}
        alt={name}
        className="w-5 h-5 object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
      />
      <span className="text-xs font-medium text-white/45 group-hover:text-white/90 transition-colors whitespace-nowrap">{name}</span>
    </div>
  );
}

/* ── LogoOrAccent ─────────────────────────────────────────────────────── */
function LogoOrAccent({ logo }: { logo: string | null }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        className="h-7 w-auto object-contain grayscale opacity-50 group-hover:opacity-90 group-hover:grayscale-0 transition-all duration-300 mb-5"
      />
    );
  }
  return (
    <div className="h-[2px] w-12 bg-white/20 rounded-full mb-5 opacity-50 group-hover:opacity-100 group-hover:w-16 transition-all duration-300" />
  );
}

/* ── Component ────────────────────────────────────────────────────────── */
export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* ── Hero ── */}
      <section className="relative min-h-[50vh] flex items-center pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Built For You</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Technology<br />
                <span className="text-phi-blue">That Ships.</span>
              </h1>
              <p className="text-lg text-white/50 font-light max-w-lg leading-relaxed">
                We design and deliver complete AI-powered applications — selecting the right language, framework, and model for your specific problem. Not a fixed template. The right tool for your outcome.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Full-Stack Development", "AI-Native Apps", "Model-Agnostic", "Vendor-Independent"].map((tag) => (
                  <span key={tag} className="px-4 py-2 border border-white/10 rounded-full text-xs text-white/50 font-medium">{tag}</span>
                ))}
              </div>
            </motion.div>
            <div className="relative h-[400px] overflow-hidden">
              <TechLogoNetwork />
            </div>
          </div>
        </div>
      </section>

      {/* ── What This Means For You ── */}
      <section className="section-padding border-t border-white/5 bg-phi-blue/[0.01]">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-10">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-4">What This Means For You</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Model-Agnostic. Outcome-Driven.</h2>
              <p className="text-lg text-white/50 font-light leading-relaxed mt-4 max-w-3xl">
                You don't get a vendor preference — you get the best solution. Whether that means shipping a React Native app with an on-device Llama model, a Python FastAPI backend with a Qdrant vector store, or a full web platform powered by GPT-4o — we pick what actually works for your business.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: "You Own Your Stack",    body: "Open-source models and frameworks mean full data sovereignty, no per-token lock-in, and dramatically lower costs at scale." },
                { title: "We Pick The Best Tool", body: "Every language, model, and cloud choice is made against your requirements — not our partnerships or default preferences." },
                { title: "Built to Last",         body: "We architect systems that can swap models, scale infrastructure, and adopt new frameworks as your business evolves." },
              ].map(({ title, body }) => (
                <div key={title} className="border-l border-phi-blue/30 pl-5 space-y-2">
                  <p className="text-sm font-bold text-white/80 uppercase tracking-wide">{title}</p>
                  <p className="text-sm text-white/40 font-light leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Languages & Frameworks ── */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">What We Build With</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Languages & Frameworks</h2>
            <p className="text-base text-white/40 font-light mt-3 max-w-2xl">
              The full engineering stack we use to ship production applications — from mobile to backend to AI pipelines.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5"
          >
            {langFrameworks.map(({ category, dotKey, items }, i) => (
              <motion.div
                key={category}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 px-6 py-5 hover:bg-phi-blue/[0.03] transition-colors duration-300"
              >
                {/* Category label */}
                <div className="flex items-center gap-3 md:pt-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT_DOT[dotKey]}`} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">{category}</span>
                </div>
                {/* Logo cards */}
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <LangCard key={item.name} logo={item.logo} name={item.name} />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── LLMs ── */}
      <section className="section-padding border-t border-white/5 bg-phi-blue/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">AI We Integrate</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Large Language Models</h2>
            <p className="text-base text-white/40 font-light mt-3 max-w-2xl">
              We select and deploy the right LLM for your workload — optimising for accuracy, cost, latency, and data sovereignty based on your requirements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {llms.map((item, i) => (
              <motion.div
                key={item.model}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <LogoOrAccent logo={item.logo} />
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-phi-blue/50 mb-2">{item.provider}</p>
                <h3 className="text-lg font-bold text-white/90 mb-4">{item.model}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.useCases.map((uc) => (
                    <span key={uc} className="text-[10px] px-2.5 py-1 rounded-full border border-white/8 text-white/40">{uc}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Computer Vision ── */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">We Build With</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Computer Vision & Image Models</h2>
            <p className="text-base text-white/40 font-light mt-3 max-w-2xl">
              From real-time object detection in manufacturing to document layout analysis — we fine-tune and deploy vision models on your data.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cvModels.map((item, i) => (
              <motion.div
                key={item.model}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <LogoOrAccent logo={item.logo} />
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-phi-blue/50 mb-2">{item.provider}</p>
                <h3 className="text-lg font-bold text-white/90 mb-4">{item.model}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.capabilities.map((cap) => (
                    <span key={cap} className="text-[10px] px-2.5 py-1 rounded-full border border-white/8 text-white/40">{cap}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Speech & Audio ── */}
      <section className="section-padding border-t border-white/5 bg-phi-blue/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">We Build With</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Speech & Audio Models</h2>
            <p className="text-base text-white/40 font-light mt-3 max-w-2xl">
              The voice layer in our applications — real-time transcription, multilingual TTS, and voice-cloning pipelines built into your product.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {speechModels.map((item, i) => (
              <motion.div
                key={item.model}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <LogoOrAccent logo={item.logo} />
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-phi-blue/50 mb-2">{item.provider}</p>
                <h3 className="text-lg font-bold text-white/90 mb-4">{item.model}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.capabilities.map((cap) => (
                    <span key={cap} className="text-[10px] px-2.5 py-1 rounded-full border border-white/8 text-white/40">{cap}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Infrastructure ── */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">We Deploy On</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">AI Infrastructure & Orchestration</h2>
            <p className="text-base text-white/40 font-light mt-3 max-w-2xl">
              From local model serving to cloud-scale GPU clusters — we handle the full deployment stack so your AI runs reliably in production.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {infrastructure.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-white/8 rounded-2xl p-6 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                {item.logo ? (
                  <img src={item.logo} alt={item.name} className="h-7 w-auto object-contain grayscale opacity-50 group-hover:opacity-90 group-hover:grayscale-0 transition-all duration-300 mb-4" />
                ) : (
                  <div className="h-[2px] w-10 bg-white/20 rounded-full mb-4 group-hover:w-14 group-hover:bg-white/40 transition-all duration-300" />
                )}
                <h3 className="font-bold text-white/80 mb-2 text-sm group-hover:text-white transition-colors">{item.name}</h3>
                <p className="text-xs text-white/40 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commercial Integrations ── */}
      <section className="section-padding border-t border-white/5 bg-phi-blue/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">When Appropriate</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Commercial API Integrations</h2>
            <p className="text-base text-white/40 font-light mt-3 max-w-2xl">
              We integrate commercial models when they genuinely outperform open-source alternatives — always ensuring you're never locked into a single provider.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {commercial.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 text-center group flex flex-col items-center gap-3"
              >
                {item.logo ? (
                  <img src={item.logo} alt={item.name} className="h-8 w-auto object-contain grayscale opacity-50 group-hover:opacity-90 group-hover:grayscale-0 transition-all duration-300" />
                ) : (
                  <div className="h-8 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{item.name.slice(0, 2)}</span>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold mb-1 text-white/80 group-hover:text-white transition-colors">{item.name}</h3>
                  <p className="text-[11px] text-white/35 font-light">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Ready To Build?</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Let's Find The Right<br />
            <span className="text-white/20 italic">Stack For Your Problem.</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Tell us what you need to build. We'll recommend the right combination of languages, frameworks, and AI models — and then deliver it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold shadow-[0_0_40px_rgba(0,163,255,0.2)]">
                Start a Project <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-10 py-4 text-sm">
                Our Services <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
