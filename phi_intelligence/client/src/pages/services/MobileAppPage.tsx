import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Smartphone, Mic, Camera, Brain,
  Wifi, BarChart3, MessageSquare
} from "lucide-react";
import { PhoneMockupMini } from "@/components/ServiceAnimations";


const features = [
  {
    icon: Mic,
    title: "Voice & Speech Integration",
    desc: "Speech-to-text via Deepgram or Whisper for voice commands, dictation, and hands-free input. Text-to-speech for accessibility and voice-guided workflows. Cloud-based for accuracy, with on-device fallback where latency matters.",
  },
  {
    icon: Camera,
    title: "Camera & Image Intelligence",
    desc: "Document scanning, barcode reading, text recognition (OCR), and object detection using Google ML Kit and TensorFlow Lite. Runs on-device for speed and privacy — no cloud round-trip needed for common visual tasks.",
  },
  {
    icon: Brain,
    title: "On-Device AI",
    desc: "Lightweight models running directly on the phone via TensorFlow Lite, ExecuTorch, or Core ML — for tasks like text classification, image recognition, and document scanning that need to work without network access. Heavier tasks route to cloud APIs.",
  },
  {
    icon: BarChart3,
    title: "Personalisation & Recommendations",
    desc: "Content, product, and UX recommendations driven by user behaviour data. We integrate recommendation APIs and build custom scoring models that improve with usage — surfacing relevant content without requiring users to configure anything.",
  },
  {
    icon: Wifi,
    title: "Offline-Capable AI",
    desc: "Apps that work without connectivity using on-device models (TFLite, Core ML) and local data caching. Sync when the connection returns. Essential for field operations, healthcare, and logistics where network access isn't guaranteed.",
  },
  {
    icon: MessageSquare,
    title: "LLM-Powered Interfaces",
    desc: "In-app AI chat, smart search, and natural language commands connected to OpenAI, Claude, or Gemini APIs — with conversation history, context awareness, and streaming responses. Integrated into your app's data and workflows.",
  },
];

const platforms = [
  {
    name: "React Native",
    desc: "Cross-platform iOS and Android from a single TypeScript codebase. New Architecture (TurboModules, Fabric, Hermes) for near-native performance. AI integration via TensorFlow Lite, react-native-executorch, and cloud LLM APIs.",
    tags: ["iOS", "Android", "Cross-Platform", "JavaScript/TypeScript"],
  },
  {
    name: "Flutter",
    desc: "Google's framework for cross-platform apps with consistent UI and smooth animations. Flutter 3.41+ with AI Toolkit v1.0, tflite_flutter for on-device inference, and Google ML Kit for vision and language tasks.",
    tags: ["iOS", "Android", "Web", "Desktop", "Dart"],
  },
  {
    name: "Native iOS",
    desc: "Swift applications leveraging Apple's Core ML, Vision, and Create ML frameworks for on-device AI at peak performance.",
    tags: ["Swift", "Core ML", "ARKit", "Vision Framework"],
  },
  {
    name: "Native Android",
    desc: "Kotlin applications using ML Kit and TensorFlow Lite for real-time AI on Android — from budget devices to flagship hardware.",
    tags: ["Kotlin", "ML Kit", "TensorFlow Lite", "CameraX"],
  },
];

const useCases = [
  { sector: "Healthcare", example: "Patient symptom checker with voice intake, AI triage, and appointment booking integrated in one mobile flow." },
  { sector: "Retail & E-Commerce", example: "Visual search app — point camera at a product, get instant matches, pricing, and AI-powered style recommendations." },
  { sector: "Field Operations", example: "On-site inspection app with offline AI — capture images, detect defects, auto-generate reports, sync when back online." },
  { sector: "Financial Services", example: "AI banking app with voice transactions, spending insight generation, fraud alerts, and document scanning for onboarding." },
  { sector: "Logistics", example: "Driver app with AI route optimisation, real-time anomaly detection, and voice-guided delivery confirmation." },
  { sector: "HR & Recruitment", example: "Mobile hiring platform — AI CV screening, interview scheduling, candidate ranking, and onboarding task management." },
];

export default function MobileAppPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 02</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Mobile<br />
                <span className="text-phi-blue/60 italic">Applications.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                Cross-platform mobile apps with AI capabilities integrated where they deliver real value — LLM-powered chat, image recognition, voice input, and smart personalisation built on React Native and Flutter.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm">
                    Discuss Your App <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-8 py-4 text-sm">
                    All Services
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative h-[420px] overflow-hidden"
            >
              <PhoneMockupMini />
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              Intelligence Built<br />
              <span className="text-phi-blue/60 italic">Into the App.</span>
            </h2>
            <p className="text-base text-white/40 font-light mt-4 max-w-2xl leading-relaxed">
              AI capabilities we integrate into mobile apps — selected based on what your product actually needs, not a checklist of buzzwords.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white/90 mb-1.5 text-sm">{f.title}</h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Technology</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Platforms We Build On</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {platforms.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">{p.name}</h3>
                </div>
                <p className="text-white/40 font-light text-sm leading-relaxed">{p.desc}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border border-white/8 rounded-full text-white/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Use Cases</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">What We Build For</h2>
            <p className="text-base text-white/40 font-light mt-4 max-w-2xl leading-relaxed">
              Examples of mobile AI applications we design and build for clients.
            </p>
          </div>
          <div className="space-y-0">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.sector}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group border-b border-white/5 last:border-none py-7 flex flex-col sm:flex-row sm:items-start gap-4 hover:pl-3 transition-all duration-300"
              >
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/25 sm:w-44 flex-shrink-0 pt-0.5">{uc.sector}</span>
                <p className="text-base text-white/50 font-light leading-relaxed">{uc.example}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Web CTA Callout */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-white/8 p-5 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 hover:border-white/15 transition-colors">
            <div className="flex-grow space-y-2">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">Also Need a Web Platform?</p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase">We Build the Web App Too.</h3>
              <p className="text-white/40 font-light text-sm leading-relaxed max-w-xl">
                Full-stack AI web applications — admin portals, dashboards, and platforms that connect to the same AI backend as your mobile app.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/services/web-development">
                <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm font-bold">
                  See Web Services <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Have an App<br />
            <span className="text-phi-blue/60 italic">Idea in Mind?</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Share your concept. We'll define the AI architecture, propose a PoC, and get a working demo in front of you in 4–8 weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
                Discuss Your App <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/services/ai-consulting">
              <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-10 py-4 text-sm">
                Start with Strategy
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
