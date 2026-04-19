import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, FileSearch, Database, Headphones, GitBranch, Scale,
  Server, Package, ShieldAlert, ShoppingCart, Car, Mic, FileEdit,
  ShieldCheck, Network, Languages, UserCheck, ScanLine,
} from "lucide-react";
import ParticleWavesAnimation from "@/components/three/ParticleWavesAnimation";

import {
  DocProcessingAnim, RAGSystemsAnim, ContractAnalysisAnim, MeetingIntelAnim,
  RFPGeneratorAnim, CVScreeningAnim, RetailShelfAnim, PPEComplianceAnim,
  VehicleDamageAnim, ManufacturingQCAnim, CustomerSupportAnim,
  SpeechTranslationAnim, MultiAgentWorkflowAnim, OpenClawDeployAnim,
  SkillPacksAnim, SecurityAuditAnim, MultiAgentEnterpriseAnim,
} from "@/components/ProductAnimations";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Category = "All" | "LLM & NLP" | "Computer Vision" | "Voice AI" | "Agent Platform";

interface Product {
  id: number;
  name: string;
  category: Category;
  icon: React.ElementType;
  Animation: React.ComponentType;
  description: string;
  markets: string[];
  revenueModel: string;
  accent: string;
}

/* ─── Products (display order) ───────────────────────────────────────────── */
const products: Product[] = [
  {
    id: 9, name: "Multi-Agent AI Workflow Automation", category: "Agent Platform", icon: GitBranch, Animation: MultiAgentWorkflowAnim,
    description: "Businesses define SOPs and the system deploys specialised AI agents that collaborate — one gathers data, another validates, a third decides, a fourth escalates. End-to-end autonomous execution.",
    markets: ["UK", "India", "UAE", "US"], revenueModel: "Platform licence · Per-execution", accent: "emerald",
  },
  {
    id: 37, name: "Multi-Agent Enterprise Architecture", category: "Agent Platform", icon: Network, Animation: MultiAgentEnterpriseAnim,
    description: "Enterprise-scale systems with 5–20 specialised agents — strategy, ops, sales, marketing, finance, HR — sharing memory, handing off tasks in parallel, with full governance and audit trails.",
    markets: ["UK", "India", "UAE", "US"], revenueModel: "£50K–200K implementation + retainer", accent: "blue",
  },
  {
    id: 34, name: "OpenClaw Managed Deployment", category: "Agent Platform", icon: Server, Animation: OpenClawDeployAnim,
    description: "End-to-end OpenClaw AI agent setup — provisioning, Docker config, security hardening, OAuth, and integration with CRM, email, calendar, Slack, and WhatsApp. Ongoing maintenance included.",
    markets: ["UK", "India", "UAE"], revenueModel: "Setup fee + £50–500 / month", accent: "emerald",
  },
  {
    id: 1, name: "Smart Retail Shelf & Inventory Monitoring", category: "Computer Vision", icon: ShoppingCart, Animation: RetailShelfAnim,
    description: "Uses existing CCTV cameras to detect out-of-stock products, misplaced items, planogram violations, and foot traffic heatmaps. No new hardware required.",
    markets: ["UAE", "India", "UK", "US"], revenueModel: "$50–200 / camera / month", accent: "blue",
  },
  {
    id: 2, name: "Construction Site Safety & PPE Compliance", category: "Computer Vision", icon: ShieldAlert, Animation: PPEComplianceAnim,
    description: "Real-time video analysis detecting missing helmets, high-vis vests, harnesses. Flags violations, sends supervisor alerts, generates compliance reports with timestamps and screenshots.",
    markets: ["UAE", "India", "UK"], revenueModel: "$500–2,000 / site / month", accent: "rose",
  },
  {
    id: 6, name: "Vehicle Damage Assessment for Insurance", category: "Computer Vision", icon: Car, Animation: VehicleDamageAnim,
    description: "Users photograph vehicle damage — AI identifies damage type, affected parts, and severity, then generates instant repair cost estimates. Claims processed in minutes instead of days.",
    markets: ["UAE", "India", "UK"], revenueModel: "Per-assessment API · Enterprise licence", accent: "orange",
  },
  {
    id: 10, name: "Domain-Specific RAG Knowledge Systems", category: "LLM & NLP", icon: Database, Animation: RAGSystemsAnim,
    description: "Custom AI assistants connected to your internal documents. Employees query in natural language, receive sourced answers. Four verticals: Legal RAG, Medical RAG, Financial RAG, Engineering RAG.",
    markets: ["UK", "India", "UAE", "US"], revenueModel: "Implementation + Monthly SaaS", accent: "violet",
  },
  {
    id: 8, name: "Intelligent Document Processing Engine", category: "LLM & NLP", icon: FileSearch, Animation: DocProcessingAnim,
    description: "Ingests invoices, contracts, medical records, and shipping documents — extracting structured data automatically across multiple languages, handwriting, and layouts. Goes beyond OCR by understanding context.",
    markets: ["UK", "India", "UAE", "US"], revenueModel: "Per-document API · Enterprise SaaS", accent: "violet",
  },
  {
    id: 12, name: "Multilingual Customer Support AI Agent", category: "Voice AI", icon: Headphones, Animation: CustomerSupportAnim,
    description: "Voice and text agent handling support in English, Hindi, Arabic, and regional languages. Performs actions — refunds, booking changes, escalations — and hands off to humans seamlessly.",
    markets: ["India", "UAE", "UK"], revenueModel: "Per-conversation · Seat-based SaaS", accent: "cyan",
  },
  {
    id: 35, name: "OpenClaw Industry Skill Packs", category: "Agent Platform", icon: Package, Animation: SkillPacksAnim,
    description: "Pre-built, tested skill bundles for specific industries. Real Estate, Legal, Healthcare, Agency, and E-Commerce packs — each with custom workflows, tool integrations, and trained agent behaviours.",
    markets: ["UK", "India", "UAE"], revenueModel: "$200–1,000 per pack", accent: "orange",
  },
  {
    id: 36, name: "AI Agent Security Audit & Hardening", category: "Agent Platform", icon: ShieldCheck, Animation: SecurityAuditAnim,
    description: "Audits AI agent deployments for prompt injection, data exfiltration risks, malicious skills, over-privileged access, and misconfigured infrastructure. GDPR, PDPL, and HIPAA compliance focus.",
    markets: ["UK", "UAE"], revenueModel: "$1,000–5,000 per audit + retainer", accent: "rose",
  },
  {
    id: 13, name: "AI Meeting Intelligence & Action Tracker", category: "LLM & NLP", icon: Mic, Animation: MeetingIntelAnim,
    description: "Real-time transcription, speaker identification, and action item extraction from every meeting. Automatically syncs tasks to Jira, Asana, Monday.com. On-premises option for GDPR compliance.",
    markets: ["UK", "UAE", "US"], revenueModel: "Per-user SaaS", accent: "cyan",
  },
  {
    id: 11, name: "AI Contract Analysis & Risk Scoring", category: "LLM & NLP", icon: Scale, Animation: ContractAnalysisAnim,
    description: "Identifies clauses — indemnity, liability, IP, non-compete — flags unusual terms, compares against standard templates, and generates a risk score. Reduces legal review time by 80%.",
    markets: ["UK", "UAE"], revenueModel: "Per-contract · Enterprise licence", accent: "amber",
  },
  {
    id: 23, name: "AI Proposal & RFP Response Generator", category: "LLM & NLP", icon: FileEdit, Animation: RFPGeneratorAnim,
    description: "Analyses RFPs, matches against your capability database, and generates tailored drafts with case studies, team profiles, and pricing suggestions. Weeks of writing reduced to hours.",
    markets: ["UK", "UAE", "India"], revenueModel: "Per-proposal · Subscription", accent: "emerald",
  },
  {
    id: 3, name: "Manufacturing Visual Quality Inspection", category: "Computer Vision", icon: ScanLine, Animation: ManufacturingQCAnim,
    description: "Camera-based defect detection on production lines — surface anomalies, dimensional variance, colour inconsistencies — in real time. Works for PCBs, textiles, automotive, pharma packaging.",
    markets: ["India", "UK", "UAE", "US"], revenueModel: "Per-line licence + Implementation", accent: "slate",
  },
  {
    id: 32, name: "Real-Time Speech Translation System", category: "Voice AI", icon: Languages, Animation: SpeechTranslationAnim,
    description: "Bidirectional real-time speech translation for meetings, calls, and conferences. Supports 40+ languages including English, Hindi, and Arabic. Preserves speaker identity and tone.",
    markets: ["UAE", "India", "UK"], revenueModel: "Per-minute · Per-user SaaS", accent: "violet",
  },
  {
    id: 26, name: "Intelligent CV Screening & Candidate Matching", category: "LLM & NLP", icon: UserCheck, Animation: CVScreeningAnim,
    description: "Parses thousands of resumes, extracts skills and experience, ranks candidates using semantic matching — not keyword matching — with explainable scoring and configurable bias elimination.",
    markets: ["UK", "India", "UAE"], revenueModel: "Per-hire · Per-screening API", accent: "pink",
  },
];

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const accentBars: Record<string, string> = {
  violet: "from-violet-500/80 to-transparent",
  amber:  "from-amber-500/80 to-transparent",
  cyan:   "from-cyan-500/80 to-transparent",
  emerald:"from-emerald-500/80 to-transparent",
  pink:   "from-pink-500/80 to-transparent",
  blue:   "from-blue-500/80 to-transparent",
  rose:   "from-rose-500/80 to-transparent",
  orange: "from-orange-500/80 to-transparent",
  slate:  "from-slate-400/80 to-transparent",
};

const accentIcons: Record<string, string> = {
  violet: "text-violet-400", amber: "text-amber-400", cyan: "text-cyan-400",
  emerald: "text-emerald-400", pink: "text-pink-400", blue: "text-blue-400",
  rose: "text-rose-400", orange: "text-orange-400", slate: "text-slate-400",
};

const accentBg: Record<string, string> = {
  violet: "from-violet-950/60 to-black",
  amber: "from-amber-950/60 to-black",
  cyan: "from-cyan-950/60 to-black",
  emerald: "from-emerald-950/60 to-black",
  pink: "from-pink-950/60 to-black",
  blue: "from-blue-950/60 to-black",
  rose: "from-rose-950/60 to-black",
  orange: "from-orange-950/60 to-black",
  slate: "from-slate-900/60 to-black",
};

const catBadge: Record<Category, string> = {
  "All":             "",
  "LLM & NLP":       "bg-violet-500/10 text-violet-400 border-violet-500/25",
  "Computer Vision": "bg-blue-500/10 text-blue-400 border-blue-500/25",
  "Voice AI":        "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  "Agent Platform":  "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
};

const catFilters: { label: Category; color: string }[] = [
  { label: "All",             color: "border-white/20 text-white/60 hover:border-white/50 hover:text-white" },
  { label: "LLM & NLP",       color: "border-violet-500/30 text-violet-400 hover:bg-violet-500/10" },
  { label: "Computer Vision", color: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" },
  { label: "Voice AI",        color: "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" },
  { label: "Agent Platform",  color: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" },
];

const stats = [
  { value: "17", label: "AI Products" },
  { value: "4",  label: "Categories" },
  { value: "4",  label: "Global Markets" },
  { value: "247K+", label: "OpenClaw Stars" },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const [active, setActive] = useState<Category>("All");
  const filtered = active === "All" ? products : products.filter(p => p.category === active);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* ── Hero (matches services hub: particle waves + vertical fade) ───── */}
      <section className="relative min-h-[58vh] sm:min-h-[60vh] flex items-center pt-32 pb-16 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <ParticleWavesAnimation />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60"
            >AI Product Suite</motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]"
            >
              Products<br />
              <span className="text-phi-blue/90">We Build.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-2xl"
            >
              17 deployable AI products across computer vision, language intelligence, voice automation, and autonomous agents — built for real business outcomes across UK, India, UAE, and US.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link href="/contact">
                <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-9 py-4 text-sm font-bold shadow-[0_0_50px_rgba(0,163,255,0.25)]">
                  Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/40 hover:text-white px-9 py-4 text-sm font-bold">
                  Our Services
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 py-8 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-phi-blue">{s.value}</p>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/25 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid section ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-2 mb-14"
          >
            {catFilters.map(({ label, color }) => {
              const count = label === "All" ? products.length : products.filter(p => p.category === label).length;
              const isActive = active === label;
              return (
                <button
                  key={label}
                  onClick={() => setActive(label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border transition-all duration-200 ${
                    isActive
                      ? label === "All"
                        ? "bg-white text-black border-white"
                        : `bg-phi-blue text-white border-phi-blue`
                      : color
                  }`}
                >
                  {label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? "bg-white/20" : "bg-white/5"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((product, i) => {
              const Icon = product.icon;
              const { Animation } = product;
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: (i % 3) * 0.06, duration: 0.4 }}
                  className="group relative rounded-2xl border border-white/8 overflow-hidden hover:border-phi-blue/30 transition-all duration-300 flex flex-col bg-[#050507]"
                >
                  {/* ── Animation area ── */}
                  <div className={`relative h-44 overflow-hidden bg-gradient-to-b ${accentBg[product.accent]}`}>
                    {/* top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentBars[product.accent]}`} />
                    {/* animation */}
                    <div className="absolute inset-0 p-2">
                      <Animation />
                    </div>
                    {/* bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#050507] to-transparent" />
                  </div>

                  {/* ── Card body ── */}
                  <div className="flex flex-col flex-1 p-5 sm:p-6 space-y-4">
                    {/* icon + category badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center bg-white/5`}>
                        <Icon className={`w-4 h-4 ${accentIcons[product.accent]}`} />
                      </div>
                      <span className={`text-[9px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border ${catBadge[product.category]}`}>
                        {product.category}
                      </span>
                    </div>

                    {/* name */}
                    <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide leading-snug text-phi-blue group-hover:text-white transition-colors">
                      {product.name}
                    </h3>

                    {/* description */}
                    <p className="text-sm text-white/35 font-light leading-relaxed flex-1">
                      {product.description}
                    </p>

                    {/* markets */}
                    <div className="flex flex-wrap gap-1.5">
                      {product.markets.map(m => (
                        <span key={m} className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border border-white/8 rounded-full text-white/25">
                          {m}
                        </span>
                      ))}
                    </div>

                    {/* footer */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                      <p className="text-[10px] text-white/20 font-light italic">{product.revenueModel}</p>
                      <Link href="/contact">
                        <span className="flex-shrink-0 text-[10px] font-bold tracking-widest uppercase text-phi-blue/50 hover:text-phi-blue flex items-center gap-1 transition-colors cursor-pointer">
                          Enquire <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-28 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-bold tracking-tighter uppercase"
          >
            Ready to Build?<br />
            <span className="text-phi-blue">Let's Talk.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-lg text-white/35 font-light leading-relaxed"
          >
            Book a free consultation. We'll assess your use case, data, and infrastructure — then recommend the right AI approach for your business.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold shadow-[0_0_50px_rgba(0,163,255,0.2)]">
                Book a Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:text-white px-10 py-4 text-sm font-bold">
                View Our Services
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
