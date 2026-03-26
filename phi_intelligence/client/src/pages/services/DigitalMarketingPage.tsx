import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  PenLine,
  Search,
  Target,
  Users,
  Video,
  BarChart3,
  Image,
  Globe,
  Layers,
  Send,
  Calendar,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { MarketingAnalyticsMini } from "@/components/ServiceAnimations";

const capabilities = [
  {
    icon: PenLine,
    title: "AI Content Generation",
    desc: "Generate high-quality marketing copy, blog articles, social media content, and product descriptions using fine-tuned language models.",
  },
  {
    icon: Search,
    title: "Answer Engine Optimisation",
    desc: "Optimise your content for AI-driven search — ensuring your brand appears in LLM responses, not just traditional search results.",
  },
  {
    icon: Target,
    title: "Programmatic Ad Optimisation",
    desc: "ML-powered bid management and audience targeting that optimises ad spend in real-time based on predicted conversion probability.",
  },
  {
    icon: Users,
    title: "Audience Segmentation",
    desc: "Machine learning to identify hidden audience segments and deploy hyper-personalised content that drives measurable engagement.",
  },
  {
    icon: Video,
    title: "AI Video & Media Production",
    desc: "AI-assisted video creation — automated thumbnail generation, caption overlays, format adaptation across platforms, and visual asset generation using FLUX.1 and SDXL.",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    desc: "Move beyond last-click attribution to neural models that map the full customer journey and predict lifetime value.",
  },
  {
    icon: Image,
    title: "Visual Search Optimisation",
    desc: "Automated image tagging, metadata injection, and visual search optimisation to capture high-intent discovery traffic.",
  },
];

const process = [
  {
    step: "01",
    title: "Discovery",
    desc: "We audit your current marketing stack and identify where AI will have the highest ROI impact.",
  },
  {
    step: "02",
    title: "Implementation",
    desc: "We build and deploy AI-powered content, ad optimisation, and analytics pipelines tailored to your business.",
  },
  {
    step: "03",
    title: "Optimisation",
    desc: "Ongoing performance tracking, model retraining, and campaign refinement to compound results over time.",
  },
];



export default function DigitalMarketingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[85vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">
                Service 07
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                AI-Powered
                <br />
                Digital
                <br />
                <span className="text-phi-blue/60 italic">Marketing.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                Content generation, AEO, programmatic ads, and predictive
                analytics — AI-driven marketing that delivers measurable,
                compounding growth.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm">
                    Start Your Growth Audit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button
                    variant="outline"
                    className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-8 py-4 text-sm"
                  >
                    All Services
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right — Marketing Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative h-[420px] overflow-hidden"
            >
              <MarketingAnalyticsMini />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Capabilities ─── */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              What We Deliver
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-6 md:p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                  <cap.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white/90 mb-2 text-lg">{cap.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  {cap.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Automated Social Posting ─── */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">
                Automated Social Posting
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
                Create Once.<br />
                <span className="text-phi-blue">Post Everywhere.</span>
              </h2>
              <p className="text-lg text-white/40 font-light leading-relaxed max-w-lg">
                We build AI-powered social posting systems that automatically generate, schedule, and publish product-focused content across every major platform — so your brand stays visible without the manual effort.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "AI generates platform-optimised posts from your product catalogue",
                  "Auto-schedules for peak engagement windows on each channel",
                  "Adaptive tone and format per platform (Twitter/X, LinkedIn, Instagram, Facebook)",
                  "Analytics loop continuously refines what content performs",
                  "Full approval workflow — publish automatically or with human review",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-phi-blue/60 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/50 font-light">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Flow diagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              {/* Flow steps */}
              {[
                { icon: Sparkles, step: "01", title: "AI Content Generation", desc: "Product data, brand voice, and trend signals feed an LLM that writes captions, hashtags, and creatives." },
                { icon: Calendar,  step: "02", title: "Smart Scheduling", desc: "Posts are queued for the highest-engagement windows across every platform, per audience timezone." },
                { icon: Send,      step: "03", title: "Multi-Platform Publishing", desc: "Simultaneous one-click (or fully automated) publishing to X, LinkedIn, Instagram, Facebook, and more." },
                { icon: RefreshCw, step: "04", title: "Analytics Feedback Loop", desc: "Engagement data flows back — the system learns which content works and improves every cycle." },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex gap-4 p-5 rounded-2xl border border-white/8 hover:border-phi-blue/25 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/25 mb-1">Step {s.step}</p>
                    <h3 className="font-bold text-white/85 mb-1 text-sm">{s.title}</h3>
                    <p className="text-xs text-white/35 font-light leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── AEO vs SEO ─── */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">
              The Shift
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              AEO vs SEO
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traditional SEO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-10 rounded-2xl border border-white/8 space-y-5 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-[4rem]" />
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white/40" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/25 mb-2">
                  Traditional
                </p>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-3">
                  Search Engine Optimisation
                </h3>
              </div>
              <p className="text-sm text-white/40 font-light leading-relaxed">
                Traditional SEO targets keyword rankings on Google and Bing.
                You optimise page titles, meta descriptions, backlinks, and
                technical performance to earn organic positions on a results
                page — then compete for clicks.
              </p>
              <div className="space-y-2 pt-2">
                {[
                  "Targets link-based search results pages",
                  "Relies on keyword density and backlink profiles",
                  "Success measured by ranking position and click-through rate",
                  "Traffic depends on users clicking through to your site",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/15 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-white/35 font-light">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Answer Engine Optimisation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative p-8 md:p-10 rounded-2xl border border-white/15 bg-white/[0.03] space-y-5 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.03] rounded-bl-[4rem]" />
              {/* Subtle glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/[0.04] rounded-full blur-3xl" />
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">
                  Next Evolution
                </p>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-3">
                  Answer Engine Optimisation
                </h3>
              </div>
              <p className="text-sm text-white/50 font-light leading-relaxed">
                AEO optimises your content to be directly cited by AI systems
                — ChatGPT, Perplexity, Google AI Overviews, and Copilot. Instead
                of ranking on a list, your brand becomes the answer. This is
                the defining shift in digital visibility.
              </p>
              <div className="space-y-2 pt-2">
                {[
                  "Targets AI-generated answers and citations",
                  "Relies on structured data, authority signals, and factual clarity",
                  "Success measured by citation frequency across LLM platforms",
                  "Your brand is surfaced without requiring a click-through",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-white/50 font-light">{item}</span>
                  </div>
                ))}
              </div>

              {/* Tag */}
              <div className="inline-block mt-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04]">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/50">
                  The future of search
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">
              Our Approach
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              How We Drive <span className="text-phi-blue/60 italic">Growth.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-300 group"
              >
                {/* Step Number */}
                <div className="text-6xl font-bold tracking-tighter text-white/[0.04] absolute top-4 right-6 select-none">
                  {p.step}
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-lg font-bold group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                    {p.step}
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/90">
                    {p.title}
                  </h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                {/* Connector arrow (not on last) */}
                {i < process.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <ArrowRight className="w-5 h-5 text-white/10" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Cross-Sell ─── */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">
              Related Services
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              Extend Your <span className="text-phi-blue/60 italic">Stack.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Web Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href="/services/web-development">
                <div className="p-8 md:p-10 rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-300 cursor-pointer space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/90">
                    Web Applications
                  </h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">
                    High-performance web platforms and progressive web apps that
                    convert the traffic your AI marketing generates — built for
                    speed, accessibility, and conversion optimisation.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-white/30 group-hover:text-white/60 transition-colors duration-300 pt-1">
                    <span className="font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* SaaS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <Link href="/services/saas">
                <div className="p-8 md:p-10 rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-300 cursor-pointer space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white/90">
                    SaaS Development
                  </h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">
                    Turn your marketing intelligence into a recurring-revenue
                    product. We build scalable SaaS platforms with AI-powered
                    analytics, multi-tenant architecture, and usage-based billing.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-white/30 group-hover:text-white/60 transition-colors duration-300 pt-1">
                    <span className="font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-6 max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              Ready to Scale Your
              <br />
              <span className="text-phi-blue/60 italic">Marketing With AI?</span>
            </h2>
            <p className="text-lg text-white/40 font-light">
              Book a free growth audit. We'll identify the highest-impact AI
              opportunities in your marketing stack — and show you projected
              returns before you commit.
            </p>
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
                Book a Free Growth Audit <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
