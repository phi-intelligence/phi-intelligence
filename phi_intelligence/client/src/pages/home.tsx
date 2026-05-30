import { Link, useLocation } from "wouter";
import { ArrowRight, ChevronRight, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Globe from "@/components/three/Globe";
import NeuralNetworkAnimation from "@/components/three/NeuralNetworkAnimation";
import { useState, useEffect, useCallback } from "react";
import {
  SaaSDashboardMini, PhoneMockupMini, BrowserMockupMini,
  AutomationFlowMini, VoiceWaveformMini, MarketingAnalyticsMini,
  VisionDetectionMini, DocExtractionMini,
} from "@/components/ServiceAnimations";
import AIAgentsScene from "@/components/AIAgentsScene";
import { cn } from "@/lib/utils";
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

/** Homepage bento slot is short — use compact phone so the full device + bezel stays visible */
function MobileApplicationsBentoAnimation() {
  return <PhoneMockupMini compact />;
}

const bentoServices = [
  { title: "AI SaaS Platforms", desc: "Purpose-built AI software replacing legacy tools — HRMS, CRM, inventory, finance, and operations platforms tailored precisely to your workflows.", tags: ["HRMS", "CRM", "Inventory", "Finance"], href: "/services/saas", Animation: SaaSDashboardMini },
  { title: "Mobile Applications", desc: "iOS and Android apps on React Native and Flutter — with LLM chat, image recognition, voice input, and AI-driven personalisation integrated into the product.", tags: ["React Native", "Flutter", "iOS & Android"], href: "/services/mobile-development", Animation: MobileApplicationsBentoAnimation },
  { title: "AI Web Applications", desc: "Custom web apps with AI built into the core — LLM chat, semantic search, intelligent dashboards, and automated workflows your team actually uses.", tags: ["React / Next.js", "LLM Chat", "RAG Search"], href: "/services/web-development", Animation: BrowserMockupMini },
  { title: "AI Workflow Automation", desc: "Multi-step AI agents across CRM, ERP, and email — eliminating manual overhead and cutting operational costs by up to 80%.", tags: ["CRM", "ERP", "Email", "Scheduling"], href: "/services/process-automation", Animation: AutomationFlowMini },
  { title: "Conversational Voice AI", desc: "Autonomous inbound and outbound voice agents with sub-200ms response — live-assist fallback and full telephony integration.", tags: ["Inbound", "Outbound", "Multilingual"], href: "/services/voice-automation", Animation: VoiceWaveformMini },
  { title: "AI-Driven Marketing", desc: "AI content generation, Answer Engine Optimisation, programmatic ad management, and audience segmentation — with performance tracked against real business KPIs.", tags: ["AEO", "Content AI", "Ad Ops"], href: "/services/digital-marketing", Animation: MarketingAnalyticsMini },
  { title: "Visual Intelligence Systems", desc: "Real-time object detection, OCR, segmentation, and video analytics — fine-tuned YOLO and SAM models trained on your data.", tags: ["Detection", "OCR", "Video AI"], href: "/services/computer-vision", Animation: VisionDetectionMini },
  { title: "Intelligent Document AI", desc: "LLM-powered extraction from PDFs, DOCX, and XLSX — structured output, intelligent validation, and compliance-ready pipelines.", tags: ["PDF", "DOCX", "RAG", "Extraction"], href: "/services/document-processing", Animation: DocExtractionMini },
];


const processSteps = [
  { num: "01", title: "Discovery", desc: "Map your business, data, and processes to find where AI delivers the highest impact." },
  { num: "02", title: "Strategy", desc: "Phased roadmap with ROI projections, KPIs, and milestones — no guesswork." },
  { num: "03", title: "Prototype", desc: "Working proof-of-concept in 4–8 weeks. Evidence before commitment." },
  { num: "04", title: "Development", desc: "Full solution built around your tech stack, security, and compliance requirements." },
  { num: "05", title: "Deployment", desc: "Production launch with monitoring, alerting, and reliability engineering." },
  { num: "06", title: "Support", desc: "Ongoing optimisation. We stay your AI partner as your business scales." },
];


export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsSubmitting(true);
    setLocation(`/chat?message=${encodeURIComponent(inputValue.trim())}`);
    setInputValue('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 lg:pt-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-5 lg:space-y-8 z-10 text-center lg:text-left"
          >
            <div className="space-y-3">
              <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none uppercase">
                PHI<br />
                <span className="text-phi-blue block mt-1 sm:mt-2 text-2xl xs:text-3xl sm:text-5xl md:text-7xl lg:text-8xl">INTELLIGENCE</span>
              </h1>
              <p className="text-base md:text-2xl opacity-60 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                We Build Intelligence Into Your Business.
              </p>
              <p className="text-sm text-white/35 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                AI consulting, custom development, and open-source model integration —
                from first strategy to production at scale.
              </p>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link href="/services">
                <button className="inline-flex items-center gap-2 bg-phi-blue text-white font-semibold text-sm px-6 py-3 sm:px-7 sm:py-3.5 rounded-full hover:bg-phi-blue/90 transition-all duration-300">
                  Explore Services <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/products">
                <button className="inline-flex items-center gap-2 border border-white/20 text-white font-medium text-sm px-6 py-3 sm:px-7 sm:py-3.5 rounded-full hover:border-phi-blue/50 hover:bg-phi-blue/5 transition-all duration-300">
                  View Products <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="pt-2 w-full max-w-md mx-auto lg:mx-0"
            >
              <form onSubmit={handleChatSubmit} className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-phi-blue" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Phi AI anything..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full pl-9 pr-12 py-3.5 text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all duration-500 font-light tracking-wide text-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 text-white/50 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </motion.div>

          {/* Right: Globe — hidden on small mobile, shown from sm up */}
          <div className="relative h-[280px] sm:h-[400px] lg:h-[800px] w-full">
            <Globe isMobile={isMobile} />
          </div>
        </div>
      </section>

      {/* ── SERVICES BENTO ── */}
      <section className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue mb-3">Our Services</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.9]">
                What We Build —<br />
                <span className="text-phi-blue">AI-Powered Applications.</span>
              </h2>
            </div>
            <Link href="/services" className="hidden sm:flex items-center gap-1.5 text-sm text-phi-blue hover:text-white transition-colors mb-1">
              View all services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2-column grid — responsive heights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {bentoServices.map((s, i) => (
              <Link key={s.title} href={s.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 2) * 0.08 }}
                  className="group relative rounded-2xl border border-white/[0.07] bg-black hover:border-phi-blue/25 transition-all duration-400 overflow-hidden cursor-pointer h-[320px] sm:h-[420px] md:h-[460px]"
                >
                  {/* Animation — anchored to bottom, clipped */}
                  <div className="absolute left-0 right-0 bottom-0 top-[130px] sm:top-[160px] pointer-events-none overflow-hidden">
                    {/* Scale / origin: phone mockup anchored to bottom so bezel isn’t clipped */}
                    <div
                      className={cn(
                        "w-full h-full",
                        s.href === "/services/mobile-development"
                          ? "scale-[0.78] sm:scale-95 md:scale-100 origin-bottom"
                          : "scale-[0.75] sm:scale-100 origin-top"
                      )}
                    >
                      <s.Animation />
                    </div>
                    {/* Side masks */}
                    <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black to-transparent pointer-events-none" />
                    {/* Bottom mask — keep shallow so phone mockup bezel stays visible */}
                    <div className="absolute bottom-0 left-0 right-0 h-5 sm:h-3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                  </div>

                  {/* Text shield */}
                  <div className="absolute top-0 left-0 right-0 h-[145px] sm:h-[175px] bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none" />

                  {/* Blue glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(0,163,255,0.05),transparent_55%)] pointer-events-none" />

                  {/* Status dot */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/20 group-hover:bg-phi-blue/60 transition-colors duration-500 z-20" />

                  {/* Text content */}
                  <div className="absolute top-0 left-0 right-0 p-5 sm:p-6 z-10">
                    <h3 className="text-lg sm:text-2xl font-bold tracking-tight uppercase text-phi-blue mb-1.5 sm:mb-2 leading-snug">{s.title}</h3>
                    <p className="text-[12px] sm:text-[13px] text-white/40 leading-relaxed mb-2.5 sm:mb-3 font-light line-clamp-2 max-w-xs">{s.desc}</p>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {s.tags.map(t => (
                        <span key={t} className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10 text-white/30 group-hover:text-white/50 group-hover:border-white/20 transition-colors duration-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}

            {/* ── Featured: Custom AI Agents — full-width at end ── */}
            <Link href="/services/process-automation" className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl border border-white/[0.07] bg-black hover:border-phi-blue/25 transition-all duration-400 overflow-hidden cursor-pointer h-[340px] sm:h-[420px] md:h-[520px]"
              >
                {/* AI Agents canvas — right side on desktop, full bg on mobile */}
                <div className="absolute top-0 right-0 bottom-0 w-full md:w-[58%] pointer-events-none overflow-hidden">
                  <AIAgentsScene />
                  <div className="absolute inset-y-0 left-0 w-16 sm:w-24 md:w-40 bg-gradient-to-r from-black to-transparent pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </div>
                {/* Text shield */}
                <div className="absolute top-0 left-0 bottom-0 w-full md:w-[55%] bg-gradient-to-r from-black via-black/95 to-transparent pointer-events-none z-[1]" />
                {/* Bottom shield for mobile */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-[1] md:hidden" />
                {/* Blue glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,rgba(0,163,255,0.06),transparent_55%)] pointer-events-none" />
                {/* Status dot */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 w-2 h-2 rounded-full bg-white/20 group-hover:bg-phi-blue/60 transition-colors duration-500 z-20" />
                {/* Text */}
                <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-center p-6 sm:p-8 md:p-10 z-10 max-w-xs sm:max-w-sm md:max-w-lg">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight uppercase text-phi-blue mb-2 sm:mb-3 leading-snug">Custom AI Agents<br />For Your Business</h3>
                  <p className="text-[12px] sm:text-[13px] md:text-sm text-white/40 leading-relaxed mb-4 sm:mb-5 font-light">
                    From intelligent voice assistants to fully autonomous workflow orchestrators — we design, train, and deploy AI agents that work around the clock.
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {["Voice AI", "Workflow Bots", "CRM Agents", "Document AI", "24/7 Autonomous"].map(t => (
                      <span key={t} className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10 text-white/30 group-hover:text-white/50 group-hover:border-white/20 transition-colors duration-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 sm:mb-14"
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue mb-3">Who We Are</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.9]">
              Mission &<br />
              <span className="text-phi-blue">Vision.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative p-6 sm:p-8 rounded-2xl border border-white/[0.1] bg-white/[0.03] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-phi-blue rounded-l-2xl" />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-phi-blue mb-4">Our Mission</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight uppercase mb-4 leading-snug">
                Make AI Accessible<br />to Every Business.
              </h3>
              <p className="text-sm sm:text-base text-white/50 font-light leading-relaxed">
                We exist to close the gap between cutting-edge AI and real business outcomes. By combining deep engineering expertise with a security-first mindset, we build AI systems that are practical, scalable, and genuinely transformative — not just impressive on a slide deck.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative p-6 sm:p-8 rounded-2xl border border-white/[0.1] bg-white/[0.03] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-white/20 rounded-l-2xl" />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 mb-4">Our Vision</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight uppercase mb-4 leading-snug">
                A World Where Intelligence<br />Is Built Into Everything.
              </h3>
              <p className="text-sm sm:text-base text-white/50 font-light leading-relaxed">
                We envision a future where AI is not a luxury reserved for large enterprises — but a fundamental layer of every product, workflow, and decision. Phi Intelligence is building the infrastructure, tools, and partnerships to make that future a reality.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section className="relative py-16 sm:py-24 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <NeuralNetworkAnimation enableInteraction={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/55 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue mb-4">Our Process</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.9]">
              HOW WE<br />
              <span className="text-phi-blue">WORK.</span>
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Vertical track line */}
            <div className="absolute left-[22px] sm:left-[27px] md:left-[35px] top-4 bottom-4 w-px bg-gradient-to-b from-phi-blue/60 via-phi-blue/25 to-transparent" />

            <div className="space-y-4 sm:space-y-5">
              {processSteps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative pl-14 sm:pl-16 md:pl-20"
                >
                  {/* Circle node */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[44px] h-[44px] sm:w-[54px] sm:h-[54px] md:w-[70px] md:h-[70px] rounded-full border border-phi-blue/50 bg-black/80 flex items-center justify-center shadow-[0_0_24px_rgba(0,163,255,0.2)] flex-none">
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-phi-blue tracking-wider">{step.num}</span>
                    <div className="absolute inset-0 rounded-full border border-phi-blue/12 scale-[1.4]" />
                  </div>

                  {/* Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-black/50 backdrop-blur-sm hover:border-phi-blue/22 hover:bg-black/60 transition-all duration-500 group cursor-default">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-phi-blue/40 to-transparent" />
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-phi-blue/0 via-phi-blue/55 to-phi-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[4rem] sm:text-[5.5rem] md:text-[7rem] font-black leading-none select-none text-white/[0.04] group-hover:text-white/[0.07] transition-colors duration-500 pointer-events-none">{step.num}</span>

                    {/* Mobile: stack title + desc vertically. Desktop: side by side */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 md:gap-10 px-5 sm:px-7 md:px-10 py-5 sm:py-7 md:py-8">
                      <div className="flex-none sm:w-32 md:w-44">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white leading-tight">{step.title}</h3>
                      </div>
                      <div className="hidden md:block flex-none w-px h-12 bg-white/[0.10]" />
                      <p className="flex-1 text-sm text-white/50 leading-relaxed font-light">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY STACK ── */}
      <section id="technology" className="relative py-16 sm:py-24 border-t border-white/[0.06] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue">Our Stack</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.9]">
                Technology<br />
                <span className="text-phi-blue">That Ships.</span>
              </h2>
              <p className="text-base text-white/50 font-light leading-relaxed max-w-lg">
                We design and deliver complete AI-powered applications — selecting the right language, framework, and model for your specific problem. Not a fixed template. The right tool for your outcome.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {["Full-Stack Development", "AI-Native Apps", "Model-Agnostic", "Vendor-Independent"].map((tag) => (
                  <span key={tag} className="px-3.5 py-1.5 border border-white/10 rounded-full text-xs text-white/45 font-medium">{tag}</span>
                ))}
              </div>
            </motion.div>
            <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
              <TechLogoNetwork />
            </div>
          </div>

          {/* Languages & Frameworks */}
          <div className="mb-20">
            <div className="mb-8">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-2">What We Build With</p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase text-white/90">Languages & Frameworks</h3>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/8 overflow-hidden divide-y divide-white/5 bg-black/40 backdrop-blur-sm"
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
                  <div className="flex items-center gap-3 md:pt-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT_DOT[dotKey]}`} />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">{category}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <LangCard key={item.name} logo={item.logo} name={item.name} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* AI We Integrate (LLMs, Computer Vision, Speech) */}
          <div className="space-y-16">
            <div>
              <div className="mb-8">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-2">AI We Integrate</p>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase text-white/90 font-display">Large Language Models</h3>
                <p className="text-sm text-white/40 font-light mt-2 max-w-2xl">
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
                    className="p-6 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group bg-black/30 backdrop-blur-sm"
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

            {/* Computer Vision */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase text-white/90 font-display">Computer Vision & Image Models</h3>
                <p className="text-sm text-white/40 font-light mt-2 max-w-2xl">
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
                    className="p-6 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group bg-black/30 backdrop-blur-sm"
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

            {/* Speech & Audio */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase text-white/90 font-display">Speech & Audio Models</h3>
                <p className="text-sm text-white/40 font-light mt-2 max-w-2xl">
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
                    className="p-6 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group bg-black/30 backdrop-blur-sm"
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

            {/* Infrastructure */}
            <div>
              <div className="mb-8">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-2">We Deploy On</p>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase text-white/90 font-display">Infrastructure & Orchestration</h3>
                <p className="text-sm text-white/40 font-light mt-2 max-w-2xl">
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
                    className="border border-white/8 rounded-2xl p-6 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group bg-black/30 backdrop-blur-sm"
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

            {/* Commercial API Integrations */}
            <div>
              <div className="mb-8">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-2">When Appropriate</p>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase text-white/90 font-display">Commercial API Integrations</h3>
                <p className="text-sm text-white/40 font-light mt-2 max-w-2xl">
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
                    className="p-5 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 text-center group flex flex-col items-center gap-3 bg-black/30 backdrop-blur-sm"
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
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-32 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,163,255,0.05),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-7"
          >
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Ready to Integrate<br />
              <span className="text-phi-blue">AI Into Your Business?</span>
            </h2>
            <p className="text-sm sm:text-base text-white/40 font-light max-w-xl mx-auto leading-relaxed">
              Book a free consultation. We'll identify where AI fits your business and what it can realistically achieve — before you commit to anything.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 pt-2">
              <Link href="/contact">
                <button className="inline-flex items-center justify-center gap-2 bg-phi-blue text-white font-semibold text-sm px-8 py-4 rounded-full hover:bg-phi-blue/90 transition-all duration-200 hover:scale-[1.02] shadow-[0_0_40px_rgba(0,163,255,0.18)] w-full sm:w-auto">
                  Get In Touch <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/services">
                <button className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-medium text-sm px-8 py-4 rounded-full hover:bg-white/5 transition-all duration-200 w-full sm:w-auto">
                  Explore Our Services
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
