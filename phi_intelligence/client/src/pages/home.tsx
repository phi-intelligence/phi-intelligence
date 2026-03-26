import { Link, useLocation } from "wouter";
import { ArrowRight, ChevronRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import Globe from "@/components/three/Globe";
import NeuralNetworkAnimation from "@/components/three/NeuralNetworkAnimation";
import { useState, useEffect } from "react";
import {
  SaaSDashboardMini, PhoneMockupMini, BrowserMockupMini,
  AutomationFlowMini, VoiceWaveformMini, MarketingAnalyticsMini,
  VisionDetectionMini, DocExtractionMini,
} from "@/components/ServiceAnimations";

const bentoServices = [
  // Row 1 — both 570px (driven by phone height)
  { title: "AI SaaS Platforms", desc: "Purpose-built AI software replacing legacy tools — HRMS, CRM, inventory, finance, and operations platforms tailored precisely to your workflows.", tags: ["HRMS", "CRM", "Inventory", "Finance"], href: "/services/saas", Animation: SaaSDashboardMini, cardH: 570, animH: 420 },
  { title: "Mobile Applications", desc: "iOS and Android apps on React Native and Flutter — with LLM chat, image recognition, voice input, and AI-driven personalisation integrated into the product.", tags: ["React Native", "Flutter", "iOS & Android"], href: "/services/mobile-development", Animation: PhoneMockupMini, cardH: 570, animH: 430 },
  // Row 2 — both 450px (browser drives it)
  { title: "Intelligent Web Platforms", desc: "LLM-powered interfaces, semantic search, real-time AI dashboards, and automated workflows built to scale.", tags: ["LLM Search", "Dashboards", "Real-Time"], href: "/services/web-development", Animation: BrowserMockupMini, cardH: 450, animH: 310 },
  { title: "AI Workflow Automation", desc: "Multi-step AI agents across CRM, ERP, and email — eliminating manual overhead and cutting operational costs by up to 80%.", tags: ["CRM", "ERP", "Email", "Scheduling"], href: "/services/process-automation", Animation: AutomationFlowMini, cardH: 450, animH: 305 },
  // Row 3 — both 510px (marketing drives it)
  { title: "Conversational Voice AI", desc: "Autonomous inbound and outbound voice agents with sub-200ms response — live-assist fallback and full telephony integration.", tags: ["Inbound", "Outbound", "Multilingual"], href: "/services/voice-automation", Animation: VoiceWaveformMini, cardH: 510, animH: 365 },
  { title: "AI-Driven Marketing", desc: "AI content generation, Answer Engine Optimisation, programmatic ad management, and audience segmentation — with performance tracked against real business KPIs.", tags: ["AEO", "Content AI", "Ad Ops", "Analytics"], href: "/services/digital-marketing", Animation: MarketingAnalyticsMini, cardH: 510, animH: 365 },
  // Row 4 — both 460px (DocExtraction content ~290px needs room)
  { title: "Visual Intelligence Systems", desc: "Real-time object detection, OCR, segmentation, and video analytics — fine-tuned YOLO and SAM models trained on your data.", tags: ["Detection", "OCR", "Video AI"], href: "/services/computer-vision", Animation: VisionDetectionMini, cardH: 460, animH: 315 },
  { title: "Intelligent Document AI", desc: "LLM-powered extraction from PDFs, DOCX, and XLSX — structured output, intelligent validation, and compliance-ready pipelines.", tags: ["PDF", "DOCX", "RAG", "Extraction"], href: "/services/document-processing", Animation: DocExtractionMini, cardH: 460, animH: 315 },
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
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 lg:pt-20">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 lg:space-y-8 z-10 text-center lg:text-left"
          >
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none uppercase">
                PHI<br />
                <span className="text-phi-blue block mt-2 text-3xl sm:text-5xl md:text-7xl lg:text-8xl">INTELLIGENCE</span>
              </h1>
              <p className="text-lg md:text-2xl opacity-60 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                We Build Intelligence Into Your Business.
              </p>
              <p className="text-sm md:text-base text-white/35 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                AI consulting, custom development, and open-source model integration —
                from first strategy to production at scale.
              </p>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link href="/services">
                <button className="inline-flex items-center gap-2 bg-phi-blue text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-phi-blue/90 transition-all duration-300">
                  Explore Services <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="inline-flex items-center gap-2 border border-white/20 text-white font-medium text-sm px-7 py-3.5 rounded-full hover:bg-white hover:text-black transition-all duration-300">
                  Free Consultation
                </button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="pt-4 w-full max-w-md mx-auto lg:mx-0"
            >
              <form onSubmit={handleChatSubmit} className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-phi-blue" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Phi AI anything..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full pl-10 pr-14 py-4 text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all duration-500 font-light tracking-wide text-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 text-white/50 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </motion.div>

          {/* Right: Globe */}
          <div className="relative h-[350px] sm:h-[500px] lg:h-[800px] w-full">
            <Globe isMobile={isMobile} />
          </div>
        </div>
      </section>

      {/* ── SERVICES BENTO ── */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="container mx-auto px-6">

          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue mb-3">Our Services</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.9]">
                What We Build —<br />
                <span className="text-phi-blue">AI-Powered Applications.</span>
              </h2>
            </div>
            <Link href="/services" className="hidden sm:flex items-center gap-1.5 text-sm text-phi-blue hover:text-white transition-colors mb-1">
              View all services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2-column grid — row heights matched per pair */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bentoServices.map((s, i) => (
              <Link key={s.title} href={s.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 2) * 0.08 }}
                  style={{ height: s.cardH }}
                  className="group relative rounded-2xl border border-white/[0.07] bg-black hover:border-phi-blue/25 transition-all duration-400 overflow-hidden cursor-pointer"
                >
                  {/* Animation — anchored to bottom, sized exactly for each animation */}
                  <div className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{ height: s.animH }}>
                    <s.Animation />
                  </div>

                  {/* Fixed-pixel text shield — always 175px from top regardless of card height */}
                  <div className="absolute top-0 left-0 right-0 h-[175px] bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none" />

                  {/* Subtle blue glow at bottom */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_110%,rgba(0,163,255,0.05),transparent_55%)] pointer-events-none" />

                  {/* Status dot — top right */}
                  <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-white/20 group-hover:bg-phi-blue/60 transition-colors duration-500 z-20" />

                  {/* Text content — top left, above everything */}
                  <div className="absolute top-0 left-0 right-0 p-6 z-10">
                    <h3 className="text-2xl font-bold tracking-tight uppercase text-phi-blue mb-2 leading-snug">{s.title}</h3>
                    <p className="text-[13px] text-white/40 leading-relaxed mb-3 font-light line-clamp-2 max-w-xs">{s.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.tags.map(t => (
                        <span key={t} className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10 text-white/30 group-hover:text-white/50 group-hover:border-white/20 transition-colors duration-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue mb-3">Who We Are</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.9]">
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
              className="relative p-8 rounded-2xl border border-white/[0.1] bg-white/[0.03] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-phi-blue rounded-l-2xl" />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-phi-blue mb-4">Our Mission</p>
              <h3 className="text-2xl font-bold tracking-tight uppercase mb-4 leading-snug">
                Make AI Accessible<br />to Every Business.
              </h3>
              <p className="text-base text-white/50 font-light leading-relaxed">
                We exist to close the gap between cutting-edge AI and real business outcomes. By combining deep engineering expertise with a security-first mindset, we build AI systems that are practical, scalable, and genuinely transformative — not just impressive on a slide deck.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative p-8 rounded-2xl border border-white/[0.1] bg-white/[0.03] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-white/20 rounded-l-2xl" />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 mb-4">Our Vision</p>
              <h3 className="text-2xl font-bold tracking-tight uppercase mb-4 leading-snug">
                A World Where Intelligence<br />Is Built Into Everything.
              </h3>
              <p className="text-base text-white/50 font-light leading-relaxed">
                We envision a future where AI is not a luxury reserved for large enterprises — but a fundamental layer of every product, workflow, and decision. Phi Intelligence is building the infrastructure, tools, and partnerships to make that future a reality.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── HOW WE WORK — Alternating Timeline ── */}
      <section className="relative py-24 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 opacity-35 pointer-events-none">
          <NeuralNetworkAnimation />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue mb-4">Our Process</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.9]">
              HOW WE<br />
              <span className="text-phi-blue">WORK.</span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Center vertical line — desktop only */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/25" />

            <div className="space-y-8 md:space-y-0">
              {processSteps.map((step, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div key={step.num} className="relative md:h-36 flex items-center">
                    {/* Center dot */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-phi-blue/40 bg-black items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-phi-blue/60" />
                    </div>

                    {/* Card */}
                    <motion.div
                      initial={{ opacity: 0, x: isMobile ? 0 : (isLeft ? -80 : 80) }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`w-full md:w-[45%] ${isLeft ? 'md:mr-auto' : 'md:ml-auto'}`}
                    >
                      <div className="p-5 rounded-2xl border border-white/[0.12] bg-white/[0.06] hover:border-phi-blue/30 hover:bg-white/[0.09] transition-all duration-300">
                        <div className="flex items-baseline gap-3 mb-1.5">
                          <span className="text-2xl font-bold text-phi-blue/35 tracking-tighter">{step.num}</span>
                          <h3 className="text-sm font-bold tracking-[0.12em] uppercase">{step.title}</h3>
                        </div>
                        <p className="text-sm text-white/40 leading-relaxed font-light">{step.desc}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className="py-32 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,163,255,0.05),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-7"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Ready to Integrate<br />
              <span className="text-phi-blue">AI Into Your Business?</span>
            </h2>
            <p className="text-base text-white/40 font-light max-w-xl mx-auto leading-relaxed">
              Book a free consultation. We'll identify where AI fits your business and what it can realistically achieve — before you commit to anything.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/contact">
                <button className="inline-flex items-center gap-2 bg-phi-blue text-white font-semibold text-sm px-8 py-4 rounded-full hover:bg-phi-blue/90 transition-all duration-200 hover:scale-[1.02] shadow-[0_0_40px_rgba(0,163,255,0.18)]">
                  Get In Touch <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/services">
                <button className="inline-flex items-center gap-2 border border-white/20 text-white font-medium text-sm px-8 py-4 rounded-full hover:bg-white/5 transition-all duration-200">
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
