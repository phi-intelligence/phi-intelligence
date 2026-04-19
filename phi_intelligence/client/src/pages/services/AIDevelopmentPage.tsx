import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Globe, Users, FolderKanban, BarChart3, Package, DollarSign, Play } from "lucide-react";
import IDEAnimation from "@/components/three/IDEAnimation";

const capabilities = [
  { icon: Smartphone, title: "AI-Powered Mobile Apps", desc: "React Native and Flutter applications with embedded AI — voice recognition, computer vision, predictive features, and on-device model inference." },
  { icon: Globe, title: "Web Applications", desc: "Full-stack web platforms powered by AI — intelligent search, recommendation engines, LLM-powered interfaces, and automated workflows." },
  { icon: Users, title: "AI Employee Management", desc: "Custom HRMS platforms with AI-powered recruitment, CV screening, candidate matching, onboarding automation, and employee sentiment analysis." },
  { icon: FolderKanban, title: "AI Project Management", desc: "Intelligent project tools with AI prioritisation, resource allocation, deadline prediction, and automated reporting tailored to your team." },
  { icon: BarChart3, title: "AI CRM Solutions", desc: "Custom CRM systems with AI-powered lead scoring, customer insights, automated follow-ups, and deal prioritisation built around your sales process." },
  { icon: Package, title: "Inventory & Operations", desc: "Demand forecasting, automated reordering, supply chain optimisation, and anomaly detection to keep your operations ahead." },
  { icon: DollarSign, title: "Finance & Accounting", desc: "Automated invoice processing, expense categorisation, financial forecasting, fraud detection, and compliance reporting." },
  { icon: Play, title: "Media & Content Platforms", desc: "AI-enhanced media management, content recommendation engines, automated transcription, and intelligent search for publishers and broadcasters." },
];

const approach = [
  { title: "AI-First Architecture", desc: "We design around model capabilities from day one. AI is the core, not an afterthought." },
  { title: "Security by Design", desc: "Every application is built with security-first principles — from auth to data handling to model access." },
  { title: "Production-Ready", desc: "We don't stop at prototypes. We ship to production with monitoring, logging, and auto-scaling built in." },
];

export default function AIDevelopmentPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 05</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Custom AI<br />Application<br />
                <span className="text-phi-blue/60 italic">Development.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                End-to-end development of web and mobile applications with AI built in from day one — not bolted on after. From CRM platforms to HR systems to media tools.
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

            <div className="relative h-[400px] overflow-hidden rounded-2xl border border-white/10">
              <IDEAnimation />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">What We Build</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Application Types</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-5 p-6 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                  <cap.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white/90 mb-1">{cap.title}</h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Build */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Our Approach</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">How We Build</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {approach.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3"
              >
                <div className="text-3xl font-bold text-white/10">0{i + 1}</div>
                <h3 className="font-bold text-white/90">{item.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Build Your AI<br />
            <span className="text-phi-blue/60 italic">Application.</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Tell us what you need. We'll scope the project, propose a PoC, and ship a working prototype before you commit to the full build.
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
