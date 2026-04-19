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
import AIAgentsScene from "@/components/AIAgentsScene";
import { cn } from "@/lib/utils";

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
