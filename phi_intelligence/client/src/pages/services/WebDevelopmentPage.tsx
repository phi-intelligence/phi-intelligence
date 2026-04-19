import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Globe, Search, BarChart3, MessageSquare,
  ShieldCheck, Zap, Users, RefreshCw, Code2, Database, Layers
} from "lucide-react";
import { BrowserMockupMini } from "@/components/ServiceAnimations";


const features = [
  {
    icon: MessageSquare,
    title: "LLM-Powered Interfaces",
    desc: "Chat interfaces, AI assistants, and copilot sidebars built directly into your web platform — connected to your data, not generic public models.",
  },
  {
    icon: Search,
    title: "Intelligent Search & RAG",
    desc: "Semantic search across your content, documents, and databases. Users ask in plain English — your platform delivers exact answers, not keyword matches.",
  },
  {
    icon: BarChart3,
    title: "AI Dashboards & Analytics",
    desc: "Interactive dashboards with AI-generated insights, anomaly detection, and natural-language report generation replacing static chart views.",
  },
  {
    icon: RefreshCw,
    title: "Automated Workflows",
    desc: "Web-based AI agents that process forms, route data, trigger actions, and complete multi-step tasks without human intervention.",
  },
  {
    icon: Users,
    title: "AI CRM & Sales Platforms",
    desc: "Custom CRM web apps with AI lead scoring, deal prioritisation, automated follow-ups, and customer sentiment analysis built in.",
  },
  {
    icon: Globe,
    title: "AI Content Platforms",
    desc: "Content management, recommendation, and publishing platforms powered by AI generation, SEO analysis, and audience behaviour modelling.",
  },
  {
    icon: Database,
    title: "Data & Admin Portals",
    desc: "Internal tools and admin portals with AI-enhanced data entry, validation, classification, and reporting across your operations.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & RegTech Apps",
    desc: "Regulated-industry web applications with document processing, audit trails, PII handling, and AI-powered compliance checking baked in.",
  },
];

const stack = [
  { label: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { label: "Backend", items: ["Node.js", "Python", "FastAPI", "PostgreSQL"] },
  { label: "AI Layer", items: ["OpenAI API", "Anthropic Claude", "Vercel AI SDK", "LangChain", "Hugging Face"] },
  { label: "Infrastructure", items: ["AWS / Azure", "Docker", "CI/CD", "Monitoring"] },
];

const process = [
  { n: "01", title: "Discovery", desc: "We audit your data sources, user workflows, and integration points — then identify exactly which AI features will have the highest impact on your users." },
  { n: "02", title: "AI Architecture", desc: "We choose models, vector stores, APIs, and pipelines before touching the frontend — so the AI works properly, not as an afterthought." },
  { n: "03", title: "Working PoC", desc: "A live, clickable prototype with real AI responses in 4–8 weeks. You see it working before committing to a full build." },
  { n: "04", title: "Ship & Scale", desc: "Production deployment with auth, monitoring, CI/CD, and auto-scaling. We stay involved post-launch to iterate on model performance." },
];

export default function WebDevelopmentPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 03</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                AI Web<br />
                <span className="text-phi-blue/60 italic">Applications.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                We build web applications where AI is the product — LLM chat, semantic search, intelligent dashboards, and automated workflows designed around your business logic, not generic templates.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm">
                    Start Your Project <ArrowRight className="w-4 h-4 ml-2" />
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
              <BrowserMockupMini />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">What We Build</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              Web Apps With<br />
              <span className="text-phi-blue/60 italic">AI At The Core.</span>
            </h2>
            <p className="text-base text-white/40 font-light mt-4 max-w-2xl leading-relaxed">
              We don't add AI to existing apps — we build applications from scratch where the AI capability is the product. Every feature below ships as a working, production-grade tool built for your specific data and workflows.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-5 p-4 sm:p-6 md:p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300 mt-0.5">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white/90 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Technology</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Our Stack</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {stack.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-white/8 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-white/30" />
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">{layer.label}</p>
                </div>
                <div className="space-y-2">
                  {layer.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />
                      <span className="text-sm text-white/50 font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">How We Work</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">From Brief to Live App</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {process.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black p-8 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="text-4xl font-bold text-white/5 mb-4 group-hover:text-white/10 transition-colors">{step.n}</div>
                <h3 className="font-bold text-white/80 mb-2 uppercase tracking-wide text-sm">{step.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile CTA Callout */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-white/8 p-5 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 hover:border-white/15 transition-colors">
            <div className="flex-grow space-y-2">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">Also Building Mobile?</p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase">We Build Mobile Apps Too.</h3>
              <p className="text-white/40 font-light text-sm leading-relaxed max-w-xl">
                React Native and Flutter applications with the same AI-first approach — voice recognition, on-device inference, and seamless backend integration.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/services/mobile-development">
                <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm font-bold">
                  See Mobile Services <ArrowRight className="w-4 h-4 ml-2" />
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
            Have a Web App<br />
            <span className="text-phi-blue/60 italic">In Mind?</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Tell us what you're solving. We'll scope the AI layer, propose a working PoC, and ship it in 4–8 weeks — before you commit to full-scale build.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
                Start Your Project <ArrowRight className="w-4 h-4 ml-2" />
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
