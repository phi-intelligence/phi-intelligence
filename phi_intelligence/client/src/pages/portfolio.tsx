import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import CubeGridAnimation from "@/components/three/CubeGridAnimation";

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
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/6 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(0,163,255,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Corporate Website
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Maritime · RoRo · West Africa
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Agilent Maritime Services
            </h2>
            <p className="text-sm text-white/40 font-light max-w-lg leading-relaxed">
              Marketing and corporate site for Agilent Maritime — roll-on/roll-off (RoRo) and maritime
              logistics at Tema Port, Ghana. Built with React 18, Vite, Three.js harbour scenes,
              Framer Motion, Wouter routing, and JSON-driven translations across 10+ locales.
              Deployed to AWS S3 + CloudFront.
            </p>
          </div>
          <a
            href="https://www.agilentmaritimeservices.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-phi-blue hover:text-white border border-phi-blue/25 hover:border-phi-blue hover:bg-phi-blue/10 rounded-full px-4 py-2 transition-all duration-200"
          >
            <ExternalLink className="w-3 h-3" />
            Live Site
          </a>
        </div>

        {/* Main content: player + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <SitePlayer pages={agilentPages} domain="agilentmaritimeservices.com" />

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">
            {/* Outcome */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 group-hover:border-white/15 transition-colors duration-300">
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2">
                Outcome
              </p>
              <p className="text-sm font-semibold text-white/65 leading-snug italic group-hover:text-white/80 transition-colors">
                "A production-ready site that matches brand scale and supports international visitors in their own language"
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                { value: "Production", label: "Live site" },
                { value: "10+", label: "Locales" },
                { value: "Vite · R3F", label: "Stack" },
                { value: "AWS S3", label: "Hosting" },
                { value: "CloudFront", label: "CDN" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 group-hover:border-white/15 transition-colors duration-300"
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
            <div>
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2.5">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "React 18",
                  "TypeScript",
                  "Vite",
                  "Three.js",
                  "React Three Fiber",
                  "Drei",
                  "Framer Motion",
                  "Wouter",
                  "TanStack Query",
                  "Tailwind CSS",
                  "Radix UI",
                  "Fuse.js",
                  "AWS S3",
                  "CloudFront",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 border border-white/8 rounded-full text-white/30 group-hover:text-white/55 group-hover:border-white/18 transition-all duration-200"
                  >
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
}: {
  pages: typeof smideesPages;
  domain: string;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);

  const page = pages[active];

  // Play/pause based on viewport visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) {
          v.play().catch(() => setPlaying(false));
          setPlaying(true);
        } else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // On tab change: reload and play only if already in view
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    if (inViewRef.current) {
      v.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  }, [active]);

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
    <div ref={containerRef} className="space-y-0">
      {/* Viewport */}
      <div className="relative rounded-t-2xl overflow-hidden bg-black border border-white/10 border-b-0 group/player">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111] border-b border-white/5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-3 bg-white/5 rounded-md px-3 py-0.5 text-[10px] text-white/20 font-mono truncate">
            {domain}
          </div>
          <ExternalLink className="w-3 h-3 text-white/20 shrink-0" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <video
              ref={videoRef}
              className="w-full aspect-video object-cover"
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={togglePlay}
            className="relative z-10 w-14 h-14 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-phi-blue/80 hover:border-phi-blue transition-all duration-200 pointer-events-auto"
          >
            {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
          </button>
        </div>

        {/* Arrows */}
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover/player:opacity-100 hover:bg-phi-blue/70 hover:border-phi-blue transition-all">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover/player:opacity-100 hover:bg-phi-blue/70 hover:border-phi-blue transition-all">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        {/* Page label */}
        <div className="absolute bottom-3 left-4 z-20">
          <span className="px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-phi-blue">
            {page.label}
          </span>
        </div>

        {/* Progress dots */}
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

      {/* Tab strip */}
      <div className="grid rounded-b-2xl overflow-hidden border border-white/10 border-t-0" style={{ gridTemplateColumns: `repeat(${pages.length}, 1fr)` }}>
        {pages.map((p, i) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`group/tab relative flex flex-col items-center gap-1.5 py-3.5 px-2 transition-all duration-250 border-r border-white/5 last:border-r-0 ${
                i === active ? "bg-phi-blue/10 text-phi-blue" : "bg-white/[0.02] text-white/30 hover:bg-white/[0.04] hover:text-white/60"
              }`}
            >
              {i === active && (
                <motion.div layoutId={`tab-${domain}`} className="absolute top-0 inset-x-0 h-[2px] bg-phi-blue" />
              )}
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[9px] font-bold tracking-widest uppercase leading-none">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-3 px-1"
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
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/6 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(0,163,255,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Corporate Website
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Maritime & Logistics · West Africa
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Smeedies Maritime
            </h2>
            <p className="text-sm text-white/40 font-light max-w-lg leading-relaxed">
              Premium marketing site with interactive 3D shipping globe (Three.js / R3F), entity
              steering via Yuka, and motion from GSAP and Framer Motion. AI visitor chat powered
              by Google Gemini and OpenAI with maritime-tuned prompts. Serverless APIs on AWS
              Lambda backed by DynamoDB.
            </p>
          </div>
        </div>

        {/* Main content: player + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <SitePlayer pages={smideesPages} domain="smideesmaritime.com" />

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Outcome */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 group-hover:border-white/15 transition-colors duration-300">
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2">Outcome</p>
              <p className="text-sm font-semibold text-white/65 leading-snug italic group-hover:text-white/80 transition-colors">
                "A cinematic web experience plus serverless APIs that match enterprise maritime expectations"
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                { value: "R3F + Yuka", label: "3D engine" },
                { value: "Gemini · GPT", label: "AI chat" },
                { value: "DynamoDB", label: "Data store" },
                { value: "AWS Lambda", label: "API layer" },
                { value: "Serverless", label: "Infra" },
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
                  "React", "TypeScript", "Vite", "Three.js", "React Three Fiber",
                  "Yuka", "GSAP", "Framer Motion", "Express", "AWS Lambda",
                  "DynamoDB", "OpenAI", "Gemini", "i18next", "Wouter",
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
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/6 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                Full-Stack Operations Platform
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                HVAC & Facilities
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              DPS Heating Services
            </h2>
            <p className="text-sm text-white/40 font-light max-w-lg leading-relaxed">
              PHI-DPS — FastAPI backend with 32 domain modules covering dispatch, CRM, quoting,
              compliance and invoicing. React operations portal with 17 hubs including live
              Leaflet dispatch, field console and client portal. Flutter engineer app
              (Riverpod) offline-first with Drift/SQLite, signatures and geolocation.
            </p>
          </div>
        </div>

        {/* Player + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <SitePlayer pages={dpsPages} domain="dpsheatingservices.co.uk" />

          <div className="flex flex-col gap-6">
            {/* Outcome */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 group-hover:border-white/15 transition-colors duration-300">
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2">Outcome</p>
              <p className="text-sm font-semibold text-white/65 leading-snug italic group-hover:text-white/80 transition-colors">
                "Coordinated office, field, and compliance workflows instead of disconnected tools"
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                { value: "17", label: "Web hubs" },
                { value: "32", label: "API modules" },
                { value: "Flutter", label: "Mobile" },
                { value: "React Leaflet", label: "Live dispatch" },
                { value: "FastAPI", label: "Backend" },
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
                  "React", "TypeScript", "React Leaflet", "Flutter",
                  "Riverpod", "Drift", "SQLite", "FastAPI",
                  "SQLAlchemy", "PostgreSQL", "reportlab", "boto3",
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
const otherProjects = [
  {
    category: "Enterprise Mobile App",
    industry: "Car wash & valeting",
    title: "4OR Car Wash — Multi-Branch Operations",
    logo: "/assets/portfolio/carwash-logo.jpg",
    description:
      "React Native mobile suite for 4OR Car Wash: separate navigator flows for Super Admin, Admin, Branch Manager, Supervisor, Field Agent, Worker, and Accountant. Covers jobs, staff, geolocation, before/after photos (image picker), inventory, leave and issues, reporting, and dashboards — roughly 110 screen modules wired through React Navigation with Redux Toolkit and React Native Paper. FastAPI async API with SQLAlchemy, PostgreSQL, and GeoAlchemy2 for location-aware features; Firebase Admin backs push notifications; JWT, Argon2/bcrypt, and react-native-biometrics for access control.",
    outcome: "One mobile system replacing fragmented branch paperwork and spreadsheets",
    metrics: [
      { label: "Roles", value: "7" },
      { label: "Screens", value: "110+" },
      { label: "Client", value: "RN 0.72" },
    ],
    stack: ["React Native", "TypeScript", "Redux Toolkit", "React Navigation", "React Native Paper", "FastAPI", "SQLAlchemy", "PostgreSQL", "GeoAlchemy2", "Firebase Admin", "JWT"],
  },
];

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
      <div className="absolute inset-0 bg-gradient-to-br from-phi-blue/6 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(0,163,255,0.07),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase px-3 py-1.5 rounded-full border border-white/12 text-white/50 bg-white/[0.03]">
                AI E-Commerce Platform
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-phi-blue/60 border border-phi-blue/20 px-3 py-1.5 rounded-full bg-phi-blue/[0.04]">
                Retail / Home Improvement
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              UniqFloors — 3D Store & AI Room Visualiser
            </h2>
            <p className="text-sm text-white/40 font-light max-w-lg leading-relaxed">
              Full-stack commerce with a Next.js 16 storefront and an interactive 3D floor planner
              powered by React Three Fiber and Rapier physics. Computer vision pipeline using
              SegFormer segments the floor from a customer photo so they can preview any tile
              before buying. FastAPI backend with Celery, Redis and Meilisearch.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <img src="/assets/portfolio/uniqfloors-logo.png" alt="UniqFloors" className="w-12 h-12 object-contain rounded-xl border border-white/10 bg-white/[0.03] p-1.5" />
          </div>
        </div>

        {/* Player + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <SitePlayer pages={uniqFloorsPages} domain="uniqfloors.com" />

          <div className="flex flex-col gap-6">
            {/* Outcome */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 group-hover:border-white/15 transition-colors duration-300">
              <p className="text-[9px] font-black tracking-[0.3em] uppercase text-white/25 mb-2">Outcome</p>
              <p className="text-sm font-semibold text-white/65 leading-snug italic group-hover:text-white/80 transition-colors">
                "Shoppers preview flooring in their own rooms before they buy"
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                { value: "SegFormer", label: "CV pipeline" },
                { value: "R3F + Rapier", label: "3D engine" },
                { value: "Stripe", label: "Checkout" },
                { value: "Meilisearch", label: "Search" },
                { value: "Celery + Redis", label: "Async jobs" },
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
                  "Next.js", "React", "TypeScript", "Three.js", "R3F",
                  "Rapier", "Zustand", "TanStack Query", "Tailwind",
                  "FastAPI", "Celery", "Redis", "Meilisearch",
                  "Stripe", "PostgreSQL", "Transformers",
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

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_65%)]" />
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <CubeGridAnimation />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/70">
              Portfolio
            </p>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase leading-[0.88]">
              Our<br />
              <span className="text-phi-blue">Work.</span>
            </h1>
            <p className="text-lg text-white/45 font-light leading-relaxed max-w-xl">
              Live production systems built for real businesses — maritime platforms, AI-powered
              e-commerce, field operations apps, and more. Every project below is deployed and
              serving real users.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured: Agilent Maritime */}
      <section className="border-t border-white/5 section-padding">
        <div className="container mx-auto px-6">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-6 h-[2px] bg-phi-blue" />
            <span className="text-[10px] font-black tracking-[0.35em] uppercase text-phi-blue/70">
              Featured Project
            </span>
          </motion.div>

          <AgilentShowcase />
        </div>
      </section>

      {/* Smidees Maritime */}
      <section className="border-t border-white/5 section-padding">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-6 h-[2px] bg-phi-blue" />
            <span className="text-[10px] font-black tracking-[0.35em] uppercase text-phi-blue/70">
              Featured Project
            </span>
          </motion.div>

          <SmideesShowcase />
        </div>
      </section>

      {/* DPS Heating */}
      <section className="border-t border-white/5 section-padding">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-6 h-[2px] bg-phi-blue" />
            <span className="text-[10px] font-black tracking-[0.35em] uppercase text-phi-blue/70">
              Featured Project
            </span>
          </motion.div>
          <DpsShowcase />
        </div>
      </section>

      {/* UniqFloors */}
      <section className="border-t border-white/5 section-padding">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-6 h-[2px] bg-phi-blue" />
            <span className="text-[10px] font-black tracking-[0.35em] uppercase text-phi-blue/70">
              Featured Project
            </span>
          </motion.div>
          <UniqFloorsShowcase />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {otherProjects.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Internal Platforms</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Our Products</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {/* Phi Voice Suite */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300"
            >
              <h3 className="text-xl font-bold uppercase tracking-tight mb-1">Phi Voice Suite</h3>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-phi-blue/50 mb-4">AI Call Centre Platform</p>
              <p className="text-sm text-white/40 font-light leading-relaxed mb-5">
                Dual-mode voice automation platform. Assist Mode provides live transcription and AI-suggested responses to human agents. Agent Mode handles calls autonomously with multi-turn conversation, intent recognition, and dynamic escalation. Telephony via Telnyx and Plivo across UK, US, and India.
              </p>
              <div className="flex flex-wrap gap-2">
                {["TCPA (US)", "GDPR/PECR (UK)", "TRAI (India)"].map((f) => (
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
