import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Users, BarChart3, Package, DollarSign, ShoppingBag
} from "lucide-react";
import { SaaSDashboardMini } from "@/components/ServiceAnimations";

const capabilities = [
  {
    icon: BarChart3,
    title: "CRM & Sales Platforms",
    desc: "Not another off-the-shelf CRM. We build sales platforms that understand your pipeline — AI lead scoring, deal prioritisation, automated follow-ups, and revenue forecasting tuned to how your team actually sells.",
  },
  {
    icon: Package,
    title: "Inventory & Supply Chain",
    desc: "Static spreadsheets and reactive reordering are costing you margin. We build platforms with live demand forecasting, automated procurement triggers, and supplier intelligence — so your stock stays ahead of the business.",
  },
  {
    icon: DollarSign,
    title: "Finance & Accounting",
    desc: "We replace manual finance workflows with platforms that extract, categorise, reconcile, and flag anomalies automatically — giving your finance team accurate numbers without the grunt work.",
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce Platforms",
    desc: "Beyond a storefront. We build commerce platforms with AI-driven product recommendations, dynamic pricing logic, personalised buyer journeys, and integrated operations — engineered to convert and retain.",
  },
  {
    icon: Users,
    title: "Employee Management",
    desc: "HR systems that do more than store records. We build platforms with AI-assisted recruitment, automated onboarding, performance tracking, and workforce analytics — designed to reduce overhead and improve retention.",
  },
];

const differentiators = [
  {
    title: "Your Data, Your Models",
    desc: "No shared infrastructure. Your AI models train on your data alone — giving you a genuine competitive advantage, not a generic tool.",
  },
  {
    title: "Built to Scale",
    desc: "Cloud-native architecture from day one. Your platform scales with your business — from 10 users to 10,000 without re-engineering.",
  },
  {
    title: "AI That Learns",
    desc: "Every interaction makes your system smarter. Recommendation engines, prediction models, and workflows improve continuously.",
  },
  {
    title: "Security by Default",
    desc: "SOC2-ready infrastructure, end-to-end encryption, role-based access, and audit logging built into every layer.",
  },
];

const process = [
  { n: "01", title: "Discovery", desc: "We map your business process, your data sources, and where AI can deliver the highest-value outcome for your users." },
  { n: "02", title: "Architecture", desc: "We design the AI layer first — which models, which data pipelines, which integrations — then build the application around it." },
  { n: "03", title: "PoC", desc: "A working prototype in 4–8 weeks demonstrates real AI capability before you commit to full-scale development." },
  { n: "04", title: "Build & Deploy", desc: "Full production build with security, monitoring, auto-scaling, and CI/CD pipelines — shipped to your infrastructure." },
];

export default function SaaSPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 01</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                SaaS<br />
                <span className="text-phi-blue/60 italic">Applications.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                Custom AI-powered business software built for your operations — from employee management and CRM to inventory tracking and financial reporting. Your tools, your data, your competitive advantage.
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
              <SaaSDashboardMini />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">What We Build</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              SaaS Platforms<br />
              <span className="text-phi-blue/60 italic">Powered by AI.</span>
            </h2>
            <p className="text-base text-white/40 font-light mt-4 max-w-2xl leading-relaxed">
              Platform types we design and build for clients — each with AI capabilities driving automation, search, and decision-making as core product features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-5 p-6 md:p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300 mt-0.5">
                  <cap.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white/90 mb-1.5">{cap.title}</h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Custom SaaS */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">The Advantage</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Why Custom SaaS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {differentiators.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-6 md:p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <h3 className="font-bold text-white/90 mb-2 text-lg">{d.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">How We Work</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">From Idea to Production</h2>
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

      {/* Cross-sell Callout */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="rounded-2xl border border-white/8 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8 hover:border-white/15 transition-colors">
            <div className="flex-grow space-y-2">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">Need Mobile or Web Access?</p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase">We Build Those Too.</h3>
              <p className="text-white/40 font-light text-sm leading-relaxed max-w-xl">
                Extend your SaaS platform with native mobile apps and responsive web portals — same AI backbone, seamless integration.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-wrap gap-3">
              <Link href="/services/mobile-development">
                <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm font-bold">
                  Mobile Apps <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/services/web-development">
                <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-8 py-4 text-sm font-bold">
                  Web Apps <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Ready to Build<br />
            <span className="text-phi-blue/60 italic">Your Platform?</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Your business, your software. We'll scope it, propose a PoC, and ship a working prototype in 4–8 weeks before full commitment.
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
