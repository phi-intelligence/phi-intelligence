import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
const RobotArmAnimation = lazy(() => import("@/components/three/RobotArmAnimation"));
import {
  ArrowRight,
  Ship,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ExternalLink,
  Globe,
  Monitor,
  Mail,
  Briefcase,
  Warehouse,
  Settings,
  Home,
  Users,
  Wrench,
  Building2,
  House,
  FolderOpen,
  MapPin,
  Phone,
  HeartPulse,
  UserRound,
  BriefcaseBusiness,
  BedDouble,
  BookOpen,
  Radio,
  Video,
  Bell,
  Mic,
  FileEdit,
  LayoutDashboard,
  CalendarDays,
  Car,
  Wallet,
  Banknote,
  BarChart2,
  UserCog,
  ShieldAlert,
  FileCheck,
  ClipboardList,
  Smartphone,
  FileText,
  Quote,
} from "lucide-react";

/* ─── Agilent page definitions ──────────────────────────────────────────── */
const agilentPages = [
  {
    id: "home",
    label: "Home",
    description: "Hero, three.js harbour scene, service highlights and CTA",
    video: "/assets/portfolio/agilent/home.mp4",
    icon: Monitor,
  },
  {
    id: "services",
    label: "Services",
    description: "RoRo, stevedoring, port management and logistics overview",
    video: "/assets/portfolio/agilent/services.mp4",
    icon: Briefcase,
  },
  {
    id: "ghana",
    label: "Ghana Hub",
    description: "Tema Port operations, West Africa coverage and team",
    video: "/assets/portfolio/agilent/ghana.mp4",
    icon: Globe,
  },
  {
    id: "portfolio-page",
    label: "Portfolio",
    description: "Project gallery of completed maritime logistics contracts",
    video: "/assets/portfolio/agilent/portfolio-page.mp4",
    icon: Ship,
  },
  {
    id: "contact",
    label: "Contact",
    description: "Multi-locale contact form, office map and inquiry routing",
    video: "/assets/portfolio/agilent/contact.mp4",
    icon: Mail,
  },
];

/* ─── Agilent showcase (full-width featured section) ────────────────────── */
function AgilentShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-phi-blue/25 transition-all duration-500 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/5 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Header & Client Review Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Corporate Web Portal
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Maritime &amp; Logistics · Multi-Language
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Agilent Maritime Services
            </h2>
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl">
              Corporate portal for Agilent Maritime Services, delivering roll-on/roll-off (RoRo) and general
              logistics solutions at West Africa's leading ports. Features an interactive harbor tracking panel
              powered by Three.js, responsive layouts, client portal hooks, and multi-region JSON localization.
              Hosted on a high-availability AWS S3 + CloudFront static ecosystem.
            </p>
            {/* Tech stack */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "React", "TypeScript", "Vite", "Three.js", "React Three Fiber",
                  "Framer Motion", "Wouter", "Tailwind CSS", "AWS S3", "CloudFront",
                ].map((tech) => (
                  <span key={tech} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Client review quote */}
            <div className="relative p-6 rounded-xl border border-white/8 bg-white/[0.02] group-hover:border-phi-blue/15 transition-all duration-300">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-phi-blue/10 pointer-events-none" />
              <p className="text-sm font-semibold text-white/70 italic leading-relaxed mb-4">
                "A game-changer for shipping operations. The Three.js maritime visualizer and real-time berth planner have made port coordination exceptionally efficient."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-phi-blue/40" />
                <span className="text-[9px] font-black tracking-widest uppercase text-white/30">Client Feedback</span>
              </div>
            </div>

            {/* Link & metrics */}
            <div className="flex items-center justify-between gap-4">
              <div className="grid grid-cols-2 gap-2 flex-1">
                {[
                  { value: "Production", label: "Status" },
                  { value: "10+ Locales", label: "Localization" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.01] px-4 py-2">
                    <p className="text-sm font-bold text-white/80 leading-none">{m.value}</p>
                    <p className="text-[8px] font-bold tracking-widest uppercase text-white/20 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
              <a
                href="https://www.agilentmaritimeservices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-phi-blue hover:text-white border border-phi-blue/25 hover:border-phi-blue hover:bg-phi-blue/10 rounded-full px-4 py-3.5 transition-all duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live Site
              </a>
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="pt-6 border-t border-white/5">
          <SitePlayer pages={agilentPages} domain="agilentmaritimeservices.com" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Smidees page definitions ──────────────────────────────────────────── */
const smideesPages = [
  {
    id: "home",
    label: "Home",
    description: "Cinematic hero with interactive 3D globe, shipping routes and brand narrative",
    video: "/assets/portfolio/smidees/home.mp4",
    icon: Monitor,
  },
  {
    id: "services",
    label: "Services",
    description: "Full maritime service catalogue — freight, chartering, bunkering and agency",
    video: "/assets/portfolio/smidees/services.mp4",
    icon: Briefcase,
  },
  {
    id: "operations",
    label: "Operations",
    description: "Live vessel tracking, port call management and operational dashboards",
    video: "/assets/portfolio/smidees/operations.mp4",
    icon: Settings,
  },
  {
    id: "warehouse",
    label: "Warehouse",
    description: "Cargo handling, warehouse inventory and logistics coordination hub",
    video: "/assets/portfolio/smidees/warehouse.mp4",
    icon: Warehouse,
  },
  {
    id: "contact",
    label: "Contact",
    description: "AI chat (Gemini · GPT), office locations and multi-region inquiry routing",
    video: "/assets/portfolio/smidees/contact.mp4",
    icon: Mail,
  },
];

/* ─── Generic video player (reused for both showcases) ──────────────────── */
function SitePlayer({
  pages,
  domain,
  playbackRate = 1,
}: {
  pages: typeof smideesPages;
  domain: string;
  playbackRate?: number;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const page = pages[active];

  // Play/pause based on viewport visibility — store observer in ref so it survives pages changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Disconnect any previous observer before creating a new one
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) {
          v.playbackRate = playbackRate;
          v.play().catch(() => setPlaying(false));
          setPlaying(true);
        } else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.4 }
    );
    observerRef.current = observer;
    observer.observe(container);
    return () => {
      observer.disconnect();
      observerRef.current = null;
      const v = videoRef.current;
      if (v) { v.pause(); v.src = ''; }
    };
  }, [pages]);

  // On tab change: reload and play only if already in view
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    if (inViewRef.current) {
      v.playbackRate = playbackRate;
      v.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  }, [active, playbackRate]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const handleEnded = () => {
    setPlaying(true);
    setActive((a) => (a + 1) % pages.length);
  };

  const prev = useCallback(() => setActive((a) => (a - 1 + pages.length) % pages.length), [pages.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % pages.length), [pages.length]);

  return (
    <div ref={containerRef} className="relative mx-auto w-full group/laptop">
      {/* Laptop Screen */}
      <div className="relative rounded-t-2xl border-[10px] border-neutral-900 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Webcam */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-neutral-800 z-30" />
        
        {/* Screen glare reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.01] to-white/[0.04] pointer-events-none z-20" />

        {/* Browser viewport container */}
        <div className="relative bg-black flex flex-col">
          {/* Browser chrome address bar */}
          <div className="flex items-center gap-1.5 px-4 py-2 bg-[#121212] border-b border-white/5 z-20">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <div className="flex-1 mx-3 bg-white/5 rounded-md px-3 py-0.5 text-[9px] text-white/20 font-mono truncate text-center">
              {domain}
            </div>
            <ExternalLink className="w-3 h-3 text-white/20 shrink-0" />
          </div>

          {/* Video display */}
          <div className="relative aspect-video bg-neutral-950 overflow-hidden group/player">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  playsInline
                  muted
                  autoPlay
                  onEnded={handleEnded}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                >
                  <source src={page.video} type={page.video.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                </video>
              </motion.div>
            </AnimatePresence>

            {/* Play/pause overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
              <div className="absolute inset-0 bg-black/30" />
              <button
                onClick={togglePlay}
                className="relative z-30 w-14 h-14 rounded-full bg-black/80 border border-white/20 flex items-center justify-center hover:bg-phi-blue/80 hover:border-phi-blue transition-all duration-200 pointer-events-auto"
              >
                {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
            </div>

            {/* Navigation Arrows */}
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover/player:opacity-100 hover:bg-phi-blue/70 hover:border-phi-blue transition-all">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover/player:opacity-100 hover:bg-phi-blue/70 hover:border-phi-blue transition-all">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>

            {/* Active view label */}
            <div className="absolute bottom-3 left-4 z-20">
              <span className="px-2.5 py-1 rounded-full bg-black/75 border border-white/10 text-[9px] font-bold tracking-widest uppercase text-phi-blue">
                {page.label}
              </span>
            </div>

            {/* Progress indicators */}
            <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-1.5 bg-phi-blue" : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          {/* Subpages Tab Strip (inside screen bottom) */}
          <div className="flex overflow-x-auto border-t border-white/5 bg-[#0d0d0d] scrollbar-none">
            {pages.map((p, i) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  style={{ minWidth: `${Math.max(60, Math.floor(100 / Math.min(pages.length, 6)))}px` }}
                  className={`group/tab relative flex flex-col items-center gap-1 py-2 px-1 flex-1 transition-all duration-200 border-r border-white/5 last:border-r-0 shrink-0 ${
                    i === active ? "bg-phi-blue/10 text-phi-blue" : "bg-transparent text-white/30 hover:bg-white/[0.02] hover:text-white/50"
                  }`}
                >
                  {i === active && (
                    <motion.div layoutId={`tab-${domain}`} className="absolute top-0 inset-x-0 h-[2px] bg-phi-blue" />
                  )}
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[8px] font-black tracking-widest uppercase truncate max-w-full scale-90">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Laptop physical chassis base */}
      <div className="relative z-10 -mt-[1px]">
        {/* Screen/Base connection hinge */}
        <div className="w-1/4 h-2 bg-neutral-950 mx-auto rounded-b border-b border-x border-white/5" />
        {/* Metallic base body */}
        <div className="relative h-[12px] bg-neutral-800 rounded-b-xl border-t border-white/20 shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-neutral-700/60" />
          {/* Trackpad notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-2 bg-neutral-900 rounded-b border-t border-white/10" />
        </div>
      </div>

      {/* Active page description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-4 px-1"
        >
          <p className="text-xs text-white/35 font-light leading-relaxed">
            <span className="text-white/60 font-semibold">{page.label}: </span>
            {page.description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Smidees showcase ───────────────────────────────────────────────────── */
function SmideesShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-phi-blue/25 transition-all duration-500 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/5 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Header & Client Review Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Corporate Operations Web Portal
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Maritime &amp; Cargo Logistics
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Smeedies Maritime — Logistics Platform
            </h2>
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl">
              High-end digital platform for Smeedies Maritime. Leverages a interactive 3D shipping globe (React Three Fiber)
              and steering agents (Yuka) to track cargo vessels globally in real-time. Features translation pipelines across multiple
              locales, serverless backend handlers running on AWS Lambda with DynamoDB, and integrated AI assistant chat (Gemini / GPT).
            </p>
            {/* Tech stack */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "React", "TypeScript", "Vite", "Three.js", "React Three Fiber",
                  "Yuka", "AWS Lambda", "DynamoDB", "Google Gemini", "OpenAI",
                ].map((tech) => (
                  <span key={tech} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Client review quote */}
            <div className="relative p-6 rounded-xl border border-white/8 bg-white/[0.02] group-hover:border-phi-blue/15 transition-all duration-300">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-phi-blue/10 pointer-events-none" />
              <p className="text-sm font-semibold text-white/70 italic leading-relaxed mb-4">
                "The cargo and container logistics tracking operates flawlessly. It has unified our warehouse, dispatch, and global vessel tracking."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-phi-blue/40" />
                <span className="text-[9px] font-black tracking-widest uppercase text-white/30">Client Feedback</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "Serverless", label: "Architecture" },
                { value: "R3F + Yuka", label: "3D Globe Engine" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.01] px-4 py-2">
                  <p className="text-sm font-bold text-white/80 leading-none">{m.value}</p>
                  <p className="text-[8px] font-bold tracking-widest uppercase text-white/20 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="pt-6 border-t border-white/5">
          <SitePlayer pages={smideesPages} domain="smideesmaritime.com" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Other projects (no videos) ────────────────────────────────────────── */
/* ─── DPS page definitions ───────────────────────────────────────────────── */
const dpsPages = [
  {
    id: "home",
    label: "Home",
    description: "Platform landing — live job ticker, dispatch stats and quick-access role portal",
    video: "/assets/portfolio/dps/home.mp4",
    icon: Home,
  },
  {
    id: "aboutus",
    label: "About",
    description: "Company profile, accreditations, gas-safe registrations and team directory",
    video: "/assets/portfolio/dps/aboutus.mp4",
    icon: Users,
  },
  {
    id: "services",
    label: "Services",
    description: "Full service catalogue — boiler installs, servicing, breakdown, compliance",
    video: "/assets/portfolio/dps/services.mp4",
    icon: Wrench,
  },
  {
    id: "commercial",
    label: "Commercial",
    description: "Commercial contracts hub — SLA management, PPM scheduling and reporting",
    video: "/assets/portfolio/dps/commercial.mp4",
    icon: Building2,
  },
  {
    id: "domestic",
    label: "Domestic",
    description: "Residential customer portal — job booking, engineer tracking and invoicing",
    video: "/assets/portfolio/dps/domestic.mp4",
    icon: House,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Completed project gallery — before/after, scope and outcome summaries",
    video: "/assets/portfolio/dps/portfolio.mp4",
    icon: FolderOpen,
  },
  {
    id: "serviceareas",
    label: "Areas",
    description: "Interactive coverage map — borough-level service zones across the region",
    video: "/assets/portfolio/dps/serviceareas.mp4",
    icon: MapPin,
  },
  {
    id: "contact",
    label: "Contact",
    description: "Multi-channel contact form, emergency callout line and office locations",
    video: "/assets/portfolio/dps/contact.mp4",
    icon: Mail,
  },
];

/* ─── DPS showcase ───────────────────────────────────────────────────────── */
function DpsShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-phi-blue/25 transition-all duration-500 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/5 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Header & Client Review Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Customer &amp; Services Portal
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Domestic &amp; Commercial HVAC Ops
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              DPS Heating Services — Client Portal
            </h2>
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl">
              Public platform and online booking ecosystem for DPS Heating Services. Integrates a customer-facing portal
              enabling quick boiler service booking, domestic repair scheduling, commercial contract monitoring, and invoice payments.
              Built on React, Tailwind, and a FastAPI backend with reportlab dynamic PDF compilation.
            </p>
            {/* Tech stack */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "React", "TypeScript", "FastAPI", "PostgreSQL", "Tailwind CSS",
                  "reportlab", "boto3", "AWS S3", "CloudFront",
                ].map((tech) => (
                  <span key={tech} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Client review quote */}
            <div className="relative p-6 rounded-xl border border-white/8 bg-white/[0.02] group-hover:border-phi-blue/15 transition-all duration-300">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-phi-blue/10 pointer-events-none" />
              <p className="text-sm font-semibold text-white/70 italic leading-relaxed mb-4">
                "Our booking conversions doubled after launching the new responsive site. The customer booking journey is smooth and the scheduling flow is flawless."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-phi-blue/40" />
                <span className="text-[9px] font-black tracking-widest uppercase text-white/30">Client Feedback</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "Double Booking", label: "Conversion Rate" },
                { value: "PDF Receipts", label: "Automated Billing" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.01] px-4 py-2">
                  <p className="text-sm font-bold text-white/80 leading-none">{m.value}</p>
                  <p className="text-[8px] font-bold tracking-widest uppercase text-white/20 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="pt-6 border-t border-white/5">
          <SitePlayer pages={dpsPages} domain="dpsheatingservices.co.uk" />
        </div>
      </div>
    </motion.div>
  );
}

function DpsCombinedShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-phi-blue/25 transition-all duration-500 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/5 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Header & Client Review Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Operations Command Centre &amp; Field App
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Enterprise dispatch &amp; Offline-First field app
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              DPS — Operations Command &amp; Field Suite
            </h2>
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl">
              Back-office administrative command centre paired with an offline-first mobile app for field engineers.
              The React operations portal coordinates dispatch, CRM pipelines, live Leaflet mapping, compliance reports, and invoicing.
              The offline-first Flutter application (Riverpod + SQLite/Drift) enables on-site engineers to execute safety forms,
              diagnostics logs, and customer signatures with automatic synchronization.
            </p>
            {/* Tech stack */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "React", "TypeScript", "Flutter", "Riverpod", "Drift/SQLite",
                  "FastAPI", "PostgreSQL", "Leaflet Maps", "Recharts", "Firebase",
                ].map((tech) => (
                  <span key={tech} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Client review quote */}
            <div className="relative p-6 rounded-xl border border-white/8 bg-white/[0.02] group-hover:border-phi-blue/15 transition-all duration-300">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-phi-blue/10 pointer-events-none" />
              <p className="text-sm font-semibold text-white/70 italic leading-relaxed mb-4">
                "Integrating our live dispatch board with the offline-first engineer app completely synchronized our field and back-office operations. Health and safety compliance check sheets are now fully automated."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-phi-blue/40" />
                <span className="text-[9px] font-black tracking-widest uppercase text-white/30">Client Feedback</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "17 Hubs", label: "Web Admin Portal" },
                { value: "Offline-First", label: "Flutter Mobile App" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.01] px-4 py-2">
                  <p className="text-sm font-bold text-white/80 leading-none">{m.value}</p>
                  <p className="text-[8px] font-bold tracking-widest uppercase text-white/20 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Players side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-6 border-t border-white/5">
          <div className="lg:col-span-8 space-y-2">
            <div className="text-[10px] font-black tracking-widest uppercase text-white/25">Operations Command Web Portal</div>
            <SitePlayer pages={dpsEngineerPages} domain="ops.dpsheatingservices.co.uk" />
          </div>
          <div className="lg:col-span-4 space-y-2 flex flex-col items-center">
            <div className="text-[10px] font-black tracking-widest uppercase text-white/25">Engineer Field Mobile App</div>
            <div className="w-[280px]">
              <MobilePlayer pages={dpsEngineerMobilePages} playerId="dps_eng" playbackRate={0.85} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── 4OR page definitions ───────────────────────────────────────────────── */
const fourOrPages = [
  {
    id: "admin-dashboard",
    label: "Admin",
    description: "Central control hub — live branch KPIs, staff overview, job ticker and revenue at a glance",
    video: "/assets/portfolio/4or/admin-dashboard.mp4",
    icon: LayoutDashboard,
  },
  {
    id: "agent-section",
    label: "Agents",
    description: "Field agent console — live GPS tracking, job assignments, checklist completions and status updates",
    video: "/assets/portfolio/4or/agent-section.mp4",
    icon: MapPin,
  },
  {
    id: "job-section",
    label: "Jobs",
    description: "End-to-end job lifecycle — creation, assignment, before/after photos, sign-off and audit trail",
    video: "/assets/portfolio/4or/job-section.mp4",
    icon: Briefcase,
  },
  {
    id: "finance-management",
    label: "Finance",
    description: "Revenue and expense tracking — invoicing, payment records and branch P&L summaries",
    video: "/assets/portfolio/4or/finance-management.mp4",
    icon: Banknote,
  },
  {
    id: "report-section",
    label: "Reports",
    description: "Analytics and reporting — revenue trends, agent performance, branch comparisons and exports",
    video: "/assets/portfolio/4or/report-section.mp4",
    icon: BarChart2,
  },
];

/* ─── 4OR showcase ───────────────────────────────────────────────────────── */
function FourOrShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-phi-blue/25 transition-all duration-500 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/5 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                React Native Mobile Suite
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Multi-Branch Operations · 7 User Roles
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              4OR Car Wash — Operations Suite
            </h2>
          </div>
        </div>

        {/* Two-column layout: Phone player on left, sidebar details on right */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 items-start pt-6 border-t border-white/5">
          {/* Phone player */}
          <div className="flex justify-center lg:justify-start">
            <MobilePlayer pages={fourOrPages} playerId="4or" playbackRate={0.85} />
          </div>

          {/* Sidebar content */}
          <div className="flex flex-col gap-6">
            {/* Description */}
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl">
              An enterprise React Native mobile ecosystem coordinating complete branch operations and field work.
              With 7 specialized navigator layouts (Super Admin, Admins, Branch Managers, Supervisors, Field Agents,
              Workers, and Accountants) and over 110 screen modules. Incorporates GPS coordinates, before/after site evidence,
              real-time branch inventories, payroll records, and secure biometric authentication, backed by FastAPI.
            </p>

            {/* Client review quote */}
            <div className="relative p-6 rounded-xl border border-white/8 bg-white/[0.02] group-hover:border-phi-blue/15 transition-all duration-300">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-phi-blue/10 pointer-events-none" />
              <p className="text-sm font-semibold text-white/70 italic leading-relaxed mb-4">
                "A massive leap forward in operational visibility. We now track jobs, payroll, and branch inventory in real-time across all locations."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-phi-blue/40" />
                <span className="text-[9px] font-black tracking-widest uppercase text-white/30">Client Feedback</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
              {[
                { value: "110+ Screens", label: "Mobile Modules" },
                { value: "7 User Tiers", label: "Access Control" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 group-hover:border-white/15 transition-colors duration-300">
                  <p className="text-base font-bold tracking-tight text-white/80 leading-tight">{m.value}</p>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-white/25 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Tech stack */}
            <div>
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2.5">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "React Native", "Expo", "TypeScript", "FastAPI", "GeoAlchemy2",
                  "PostgreSQL", "Firebase Cloud Messages", "Docker",
                ].map((tech) => (
                  <span key={tech} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Other projects (no videos) ────────────────────────────────────────── */
const otherProjects: Array<{
  category: string;
  industry: string;
  title: string;
  logo: string;
  description: string;
  outcome: string;
  metrics: { label: string; value: string }[];
  stack: string[];
}> = [];

/* ─── UniqFloors page definitions ───────────────────────────────────────── */
const uniqFloorsPages = [
  {
    id: "home",
    label: "Home",
    description: "Storefront hero — featured collections, AI search bar and promotional banners",
    video: "/assets/portfolio/uniqfloors/home.mp4",
    icon: Monitor,
  },
  {
    id: "services",
    label: "Services",
    description: "Installation, fitting and aftercare services with booking flow",
    video: "/assets/portfolio/uniqfloors/services.mp4",
    icon: Briefcase,
  },
  {
    id: "rooms",
    label: "Rooms",
    description: "Room-type catalogue — filter flooring by space (kitchen, bedroom, hallway)",
    video: "/assets/portfolio/uniqfloors/rooms.mp4",
    icon: House,
  },
  {
    id: "room-planner",
    label: "3D Planner",
    description: "Interactive Three.js + R3F + Rapier floor planner — drag, drop and resize tiles",
    video: "/assets/portfolio/uniqfloors/room-planner.mp4",
    icon: Globe,
  },
  {
    id: "try-in-room",
    label: "Try In Room",
    description: "AI vision — SegFormer CV pipeline segments floor from a customer photo in seconds",
    video: "/assets/portfolio/uniqfloors/try-in-room.mp4",
    icon: Monitor,
  },
  {
    id: "offers",
    label: "Offers",
    description: "Dynamic promotions page with AI-generated copy and personalised discount logic",
    video: "/assets/portfolio/uniqfloors/offers.mp4",
    icon: Briefcase,
  },
];

/* ─── UniqFloors showcase ────────────────────────────────────────────────── */
function UniqFloorsShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-phi-blue/25 transition-all duration-500 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/5 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Header & Client Review Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                AI-Driven E-Commerce
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Interactive 3D Planner &amp; SegFormer
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              UniqFloors — 3D Room Planner
            </h2>
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl">
              Next-generation retail platform for UniqFloors. Incorporates an interactive 3D floor layout planner
              (React Three Fiber + Rapier physics) alongside a computer vision pipeline using SegFormer. Customers upload
              room photos and instantly segment flooring zones to preview and customize tiles before buying.
            </p>
            {/* Tech stack */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Next.js", "React", "TypeScript", "Three.js", "R3F",
                  "FastAPI", "Celery", "Redis", "Meilisearch", "Stripe",
                ].map((tech) => (
                  <span key={tech} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Client review quote */}
            <div className="relative p-6 rounded-xl border border-white/8 bg-white/[0.02] group-hover:border-phi-blue/15 transition-all duration-300">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-phi-blue/10 pointer-events-none" />
              <p className="text-sm font-semibold text-white/70 italic leading-relaxed mb-4">
                "The interactive room planner is a massive differentiator. Customers can visualize flooring combinations instantly, leading to much higher conversion rates."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-phi-blue/40" />
                <span className="text-[9px] font-black tracking-widest uppercase text-white/30">Client Feedback</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "SegFormer CV", label: "Auto Segmentation" },
                { value: "R3F + Rapier", label: "Physics 3D Mock" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.01] px-4 py-2">
                  <p className="text-sm font-bold text-white/80 leading-none">{m.value}</p>
                  <p className="text-[8px] font-bold tracking-widest uppercase text-white/20 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="pt-6 border-t border-white/5">
          <SitePlayer pages={uniqFloorsPages} domain="uniqfloors.com" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Other project card ─────────────────────────────────────────────────── */
function ProjectCard({ project, index }: { project: typeof otherProjects[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative rounded-2xl border border-white/8 overflow-hidden hover:border-phi-blue/30 transition-all duration-400"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/[0.05] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 p-8 flex flex-col gap-6">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
            {project.category}
          </span>
          <span className="text-[9px] font-bold tracking-widest uppercase text-white/25">
            {project.industry}
          </span>
        </div>

        {/* Logo */}
        <div className="flex justify-center py-2">
          {project.logo ? (
            <img
              src={project.logo}
              alt={project.title}
              className="w-28 h-28 object-contain rounded-xl"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <Ship className="w-14 h-14 text-phi-blue/50" />
            </div>
          )}
        </div>

        {/* Title & description */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight leading-tight group-hover:text-white transition-colors">
            {project.title}
          </h2>
          <p className="text-sm text-white/45 font-light leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Outcome */}
        <div className="border-l-2 border-white/20 pl-4 group-hover:border-white/40 transition-colors duration-300">
          <p className="text-sm font-semibold text-white/65 group-hover:text-white/85 transition-colors leading-snug italic">
            "{project.outcome}"
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {project.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 group-hover:border-white/15 transition-colors duration-300"
            >
              <p className="text-base font-bold tracking-tight text-white/80 leading-tight">
                {m.value}
              </p>
              <p className="text-[9px] font-bold tracking-widest uppercase text-white/25 mt-0.5">
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Phi Voice Showcase ─────────────────────────────────────────────────── */
const phiVoicePages = [
  { id: "hotel",      label: "Hotel Reception",   description: "Handles room availability, rates, and bookings — extracts reservation data in real time.", video: "/assets/portfolio/phi-voice/demo1.webm", icon: BedDouble },
  { id: "sales",      label: "Sales Rep",          description: "Outbound lead generation and cold calling with live CRM lead extraction.",                 video: "/assets/portfolio/phi-voice/demo2.webm", icon: BriefcaseBusiness },
  { id: "support",    label: "Customer Support",   description: "Technical troubleshooting and account issue resolution with live support ticket creation.", video: "/assets/portfolio/phi-voice/demo3.webm", icon: Phone },
  { id: "healthcare", label: "Healthcare Agent",   description: "Appointment scheduling and patient intake with real-time EMR data extraction.",            video: "/assets/portfolio/phi-voice/demo4.webm", icon: HeartPulse },
  { id: "personal",   label: "Personal Assistant", description: "Your e-concierge for dining, travel, and organisation with calendar action extraction.",   video: "/assets/portfolio/phi-voice/demo5.webm", icon: UserRound },
];

function PhiVoiceShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-phi-blue/25 transition-all duration-500 group"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/6 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(0,163,255,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Internal Platform
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Voice AI · Multi-Industry
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Phi Voice Suite</h2>
            <p className="text-sm text-white/40 font-light max-w-lg leading-relaxed">
              Autonomous AI voice agents for any industry. Live transcription, multi-turn intent recognition,
              dynamic escalation, and real-time structured data extraction. Telephony via Telnyx and Plivo
              across UK, US, and India. Five specialised agents — hotel, sales, support, healthcare, and personal assistant.
            </p>
          </div>
        </div>

        {/* Main content: player + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <SitePlayer pages={phiVoicePages} domain="phi-voice.phi-intelligence.com" />

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">
            {/* Outcome */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 group-hover:border-white/15 transition-colors duration-300">
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2">Platform</p>
              <p className="text-sm font-semibold text-white/65 leading-snug italic group-hover:text-white/80 transition-colors">
                "Production-ready voice agents deployed across 5 industries with sub-200ms response latency"
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                { value: "5 Agents",    label: "Specialisations" },
                { value: "<200ms",      label: "Response time" },
                { value: "3 Regions",   label: "UK · US · India" },
                { value: "Telnyx",      label: "Telephony" },
                { value: "LiveKit",     label: "Voice infra" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 group-hover:border-white/15 transition-colors duration-300">
                  <p className="text-base font-bold tracking-tight text-white/80 leading-tight">{m.value}</p>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-white/25 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Tech stack */}
            <div>
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2.5">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {["React", "TypeScript", "LiveKit", "Telnyx", "Plivo", "OpenAI", "Whisper", "Node.js", "PostgreSQL", "Tailwind CSS"].map((tech) => (
                  <span key={tech} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div>
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2.5">Compliance</p>
              <div className="flex flex-wrap gap-1.5">
                {["TCPA (US)", "GDPR/PECR (UK)", "TRAI (India)"].map((f) => (
                  <span key={f} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-phi-blue/15 rounded-full text-phi-blue/40 group-hover:border-phi-blue/30 group-hover:text-phi-blue/60 transition-all duration-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── CNT page definitions ──────────────────────────────────────────────── */
const cntPages = [
  {
    id: "landing",
    label: "Landing",
    description: "Platform landing page — ministry branding, mission statement and app store entry CTA",
    video: "/assets/portfolio/cnt/landing.mp4",
    icon: Monitor,
  },
  {
    id: "home",
    label: "Home",
    description: "Personalised home feed — featured content, live stream banner, quick-access shortcuts and personalised recommendations",
    video: "/assets/portfolio/cnt/home.mp4",
    icon: Home,
  },
  {
    id: "voice_agent",
    label: "AI Voice",
    description: "AI voice agent — real-time conversation powered by OpenAI GPT-4o and Deepgram STT/TTS with live transcript overlay",
    video: "/assets/portfolio/cnt/voice_agent.mp4",
    icon: Mic,
  },
  {
    id: "live_streams",
    label: "Live",
    description: "Live streaming hub — active stream cards with viewer count, real-time chat and broadcast controls",
    video: "/assets/portfolio/cnt/live_streams.mp4",
    icon: Radio,
  },
  {
    id: "movies",
    label: "Movies",
    description: "On-demand video library — sermon films, documentaries and animated Bible stories with detail pages",
    video: "/assets/portfolio/cnt/movies.mp4",
    icon: Video,
  },
  {
    id: "bible_reader",
    label: "Bible",
    description: "Integrated Bible reader — chapter navigation, highlighting, note-taking and daily verse",
    video: "/assets/portfolio/cnt/bible_reader.mp4",
    icon: BookOpen,
  },
  {
    id: "community",
    label: "Community",
    description: "Community hub — groups, discussions, member profiles and activity feed",
    video: "/assets/portfolio/cnt/community.mp4",
    icon: Users,
  },
  {
    id: "events",
    label: "Events",
    description: "Church events calendar — upcoming events, RSVPs, reminders and event detail pages",
    video: "/assets/portfolio/cnt/events.mp4",
    icon: CalendarDays,
  },
  {
    id: "admin_dashboard",
    label: "Admin",
    description: "Admin dashboard — content management, user analytics, moderation queue and platform settings",
    video: "/assets/portfolio/cnt/admin_dashboard.mp4",
    icon: LayoutDashboard,
  },
];

/* ─── CNT Mobile page definitions ───────────────────────────────────────── */
const cntMobilePages = [
  {
    id: "home",
    label: "Home",
    description: "Personalised home feed — Tabernacle Voice Assistant card, Audio Podcasts carousel, Bible Reader & Daily Quote shortcuts, Movies, Animated Bible Stories and Recently Played list",
    video: "/assets/portfolio/cnt-mobile/home.mp4",
    icon: Home,
  },
  {
    id: "media_player",
    label: "Player",
    description: "In-app media player — full-screen video player (Pilgrim's Progress), movie detail page with description, and audio 'Now Playing' screen with seek, shuffle, repeat and download",
    video: "/assets/portfolio/cnt-mobile/media_player.mp4",
    icon: Play,
  },
  {
    id: "bible_reader",
    label: "Bible",
    description: "Full Bible reader — multi-column scripture text across 409 pages (Matthew, Luke and more), chapter navigation and Daily Bible Verse modal (Romans 8:28, Hebrews 11:1)",
    video: "/assets/portfolio/cnt-mobile/bible_reader.mp4",
    icon: BookOpen,
  },
  {
    id: "community",
    label: "Community",
    description: "Social community feed — scripture quote posts, image posts, live church service photos from Kofi Webb, with like/comment/share/bookmark interactions",
    video: "/assets/portfolio/cnt-mobile/community.mp4",
    icon: Users,
  },
  {
    id: "create_hub",
    label: "Create",
    description: "Content creation hub — type picker (Video, Audio, Meeting, Live Stream, Quote, Events, admin-only Bulk Upload & Bible Docs), Create Audio sub-screen and Meeting Options modal",
    video: "/assets/portfolio/cnt-mobile/create_hub.mp4",
    icon: FileEdit,
  },
];

/* ─── DPS Engineer page definitions ─────────────────────────────────────── */
const dpsEngineerPages = [
  {
    id: "crm",
    label: "CRM",
    description: "CRM dashboard — client accounts pipeline, leads, sales quote manager and interactive customer profiles",
    video: "/assets/portfolio/dps-engineer/crm.mp4",
    icon: Users,
  },
  {
    id: "field_ops",
    label: "Field Ops",
    description: "Field operations dashboard — live resource scheduling, drag-and-drop job planner, maps tracking and task dispatch",
    video: "/assets/portfolio/dps-engineer/field ops.mp4",
    icon: MapPin,
  },
  {
    id: "jobs_surveys",
    label: "Jobs",
    description: "Jobs & surveys board — active site surveys list, field notes, work order assignment and custom checklists",
    video: "/assets/portfolio/dps-engineer/job and survey.mp4",
    icon: Briefcase,
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Compliance & reports command — interactive report generation, certificate verification, audit logs and SLA status",
    video: "/assets/portfolio/dps-engineer/compliance and reports.mp4",
    icon: FileCheck,
  },
  {
    id: "contracts",
    label: "Contracts",
    description: "Contracts & sites console — client site profile, maintenance schedules, SLA contracts and active site logs",
    video: "/assets/portfolio/dps-engineer/contract and sites.mp4",
    icon: ClipboardList,
  },
  {
    id: "rams",
    label: "RAMS",
    description: "Risk Assessment & H&S console — compliance logs, risk forms manager, dynamic site check sheets and alert monitors",
    video: "/assets/portfolio/dps-engineer/RAM and H&S.mp4",
    icon: ShieldAlert,
  },
];

const dpsEngineerMobilePages = [
  {
    id: "today",
    label: "Today",
    description: "Today's schedule — job assignments list, offline-first sync alerts, and quick actions tab",
    video: "/assets/portfolio/dps-engineer/engineer app.mp4",
    icon: Smartphone,
  },
];

/* ─── CNT showcase ───────────────────────────────────────────────────────── */
function CntCombinedShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 overflow-hidden hover:border-phi-blue/25 transition-all duration-500 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/5 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-8 md:p-10">
        {/* Header & Client Review Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Full-Stack Media Ecosystem
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Web Portal &amp; iOS/Android Apps
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Christ New Tabernacle — Community Platform
            </h2>
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl">
              A comprehensive Christian media ecosystem built with Flutter for both Web and native Mobile (iOS &amp; Android).
              Integrates live streaming (LiveKit), video on demand, audio podcasts, bible readers, community social feeds,
              events management, and a custom GPT-4o voice assistant. Powered by a high-throughput FastAPI backend.
            </p>
            {/* Tech stack */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Flutter Web", "Flutter Mobile", "FastAPI", "PostgreSQL",
                  "Redis", "LiveKit", "AWS S3", "CloudFront", "OpenAI",
                ].map((tech) => (
                  <span key={tech} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Client review quote */}
            <div className="relative p-6 rounded-xl border border-white/8 bg-white/[0.02] group-hover:border-phi-blue/15 transition-all duration-300">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-phi-blue/10 pointer-events-none" />
              <p className="text-sm font-semibold text-white/70 italic leading-relaxed mb-4">
                "PHI-Intelligence transformed our congregation's reach. Having a voice-enabled mobile companion and a high-performance web stream keeps our community closer than ever."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-[1px] bg-phi-blue/40" />
                <span className="text-[9px] font-black tracking-widest uppercase text-white/30">Client Feedback</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "LiveKit Stream", label: "Zero-Latency Video" },
                { value: "GPT-4o Voice", label: "Interactive Assistant" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.01] px-4 py-2">
                  <p className="text-sm font-bold text-white/80 leading-none">{m.value}</p>
                  <p className="text-[8px] font-bold tracking-widest uppercase text-white/20 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Players side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-6 border-t border-white/5">
          <div className="lg:col-span-8 space-y-2">
            <div className="text-[10px] font-black tracking-widest uppercase text-white/25">Web platform</div>
            <SitePlayer pages={cntPages} domain="christnewtabernacle.com" playbackRate={0.75} />
          </div>
          <div className="lg:col-span-4 space-y-2 flex flex-col items-center">
            <div className="text-[10px] font-black tracking-widest uppercase text-white/25">Mobile App</div>
            <div className="w-[280px]">
              <MobilePlayer pages={cntMobilePages} playerId="cnt" playbackRate={0.85} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Mobile phone player ────────────────────────────────────────────────── */
interface MobilePage {
  id: string;
  label: string;
  description: string;
  video: string;
  icon: React.ComponentType<any>;
}

function MobilePlayer({
  pages,
  playerId,
  playbackRate = 1,
}: {
  pages: MobilePage[];
  playerId: string;
  playbackRate?: number;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const page = pages[active];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (observerRef.current) observerRef.current.disconnect();
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) {
          v.playbackRate = playbackRate;
          v.play().catch(() => setPlaying(false));
          setPlaying(true);
        } else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.4 }
    );
    observerRef.current = observer;
    observer.observe(container);
    return () => {
      observer.disconnect();
      observerRef.current = null;
      const v = videoRef.current;
      if (v) { v.pause(); v.src = ''; }
    };
  }, [pages, playbackRate]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    if (inViewRef.current) {
      v.playbackRate = playbackRate;
      v.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  }, [active, playbackRate]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const handleEnded = () => {
    setPlaying(true);
    setActive((a) => (a + 1) % pages.length);
  };

  const prev = useCallback(() => setActive((a) => (a - 1 + pages.length) % pages.length), [pages.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % pages.length), [pages.length]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-5">
      {/* Phone mockup container */}
      <div className="relative group/player" style={{ width: '260px' }}>
        {/* Left Side Buttons (Volume controls) */}
        <div className="absolute left-[-5px] top-[96px] w-[5px] h-9 bg-neutral-700 rounded-l-sm z-0" />
        <div className="absolute left-[-5px] top-[148px] w-[5px] h-8 bg-neutral-700 rounded-l-sm z-0" />
        <div className="absolute left-[-5px] top-[192px] w-[5px] h-8 bg-neutral-700 rounded-l-sm z-0" />
        {/* Right Side Button (Power button) */}
        <div className="absolute right-[-5px] top-[128px] w-[5px] h-14 bg-neutral-700 rounded-r-sm z-0" />

        {/* Outer phone shell */}
        <div className="relative z-10 rounded-[2.8rem] border-[8px] border-neutral-800 bg-black overflow-hidden shadow-[0_0_50px_rgba(0,163,255,0.10),0_25px_60px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)]">
          {/* Speaker ear piece slot */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-1 bg-neutral-950 rounded-full z-30" />
          
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-[18px] bg-black rounded-full z-30 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-800/80 mr-2 flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-blue-500/30" />
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-950" />
          </div>

          {/* Glass glare effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.01] to-white/[0.05] pointer-events-none z-20" />

          {/* Video wrapper */}
          <div className="relative" style={{ aspectRatio: '9/19.5' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                  onEnded={handleEnded}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                >
                  <source src={page.video} type="video/mp4" />
                </video>
              </motion.div>
            </AnimatePresence>

            {/* Play/pause overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 z-10">
              <div className="absolute inset-0 bg-black/20" />
              <button
                onClick={togglePlay}
                className="relative z-10 w-12 h-12 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-phi-blue/80 hover:border-phi-blue transition-all duration-200"
              >
                {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
              </button>
            </div>

            {/* Arrows */}
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover/player:opacity-100 hover:bg-phi-blue/70 transition-all">
              <ChevronLeft className="w-3.5 h-3.5 text-white" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover/player:opacity-100 hover:bg-phi-blue/70 transition-all">
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>

            {/* Progress dots */}
            <div className="absolute bottom-8 left-0 right-0 z-20 flex gap-1.5 justify-center">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? 'w-4 h-1.5 bg-phi-blue' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>

            {/* Home gesture bar — inside the phone screen at the very bottom */}
            <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center">
              <div className="w-24 h-[5px] rounded-full bg-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 bg-white/[0.03] rounded-xl border border-white/8 p-1">
        {pages.map((p, i) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                i === active ? 'bg-phi-blue/15 text-phi-blue' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
              }`}
            >
              {i === active && (
                <motion.div layoutId={`mobile-tab-${playerId}`} className="absolute inset-0 rounded-lg bg-phi-blue/10 border border-phi-blue/20" />
              )}
              <Icon className="relative z-10 w-3.5 h-3.5 shrink-0" />
              <span className="relative z-10 text-[8px] font-bold tracking-widest uppercase leading-none">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-white/35 font-light leading-relaxed text-center max-w-[280px]"
        >
          <span className="text-white/60 font-semibold">{page.label}: </span>
          {page.description}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_65%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 space-y-6"
            >
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/70">
                Portfolio
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Our<br />
                <span className="text-phi-blue">Work.</span>
              </h1>
              <p className="text-lg text-white/45 font-light leading-relaxed max-w-xl">
                Live production systems built for real businesses — maritime platforms, AI-powered
                e-commerce, field operations apps, and more. Every project below is deployed and
                serving real users.
              </p>
            </motion.div>

            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative aspect-[4/5] rounded-3xl border border-white/10 overflow-hidden bg-white/5">
                <div className="w-full h-full relative">
                  <Suspense fallback={null}>
                    <RobotArmAnimation enableInteraction={false} scale={1.0} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcases */}
      <section className="border-t border-white/5 section-padding">
        <div className="container mx-auto px-6">
          <div className="space-y-24">
            <CntCombinedShowcase />
            <DpsCombinedShowcase />
            <FourOrShowcase />
            <AgilentShowcase />
            <SmideesShowcase />
            <DpsShowcase />
            <UniqFloorsShowcase />
          </div>
        </div>
      </section>


      {/* More Projects */}
      <section className="border-t border-white/5 section-padding">
        <div className="container mx-auto px-6">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-6 h-[2px] bg-white/20" />
            <span className="text-[10px] font-black tracking-[0.35em] uppercase text-white/30">
              More Projects
            </span>
          </motion.div>

          {otherProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {otherProjects.map((project, i) => (
                <ProjectCard key={project.title} project={project} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/20 italic">More case studies coming soon.</p>
          )}
        </div>
      </section>

      {/* Our Products */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Internal Platforms</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase font-display">Our Products</h2>
          </div>
          <div className="space-y-6">
            {/* Phi Voice Suite — full-width with video demos */}
            <PhiVoiceShowcase />

            {/* Phi Docs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300"
            >
              <h3 className="text-xl font-bold uppercase tracking-tight mb-1">Phi Docs</h3>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-phi-blue/50 mb-4">Intelligent Document Processing Platform</p>
              <p className="text-sm text-white/40 font-light leading-relaxed mb-5">
                Our proprietary document processing engine. Skills-based extraction pipeline with LLM routing across models, self-correction, visual validation (LibreOffice-to-PDF-to-pixel analysis), and RAG search on Qdrant with hybrid dense/sparse retrieval.
              </p>
              <div className="flex flex-wrap gap-2">
                {["PDF", "DOCX", "XLSX", "Images", "Scanned", "Handwritten"].map((f) => (
                  <span key={f} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30">{f}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Ready to Build<br />
            <span className="text-phi-blue">Something Real?</span>
          </h2>
          <p className="text-lg text-white/40 font-light leading-relaxed">
            Book a free consultation. We'll assess your use case, recommend the right approach,
            and build a working prototype in 4–8 weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold shadow-[0_0_40px_rgba(0,163,255,0.2)]">
                Start a Project <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-10 py-4 text-sm"
              >
                View Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
