import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Map, FlaskConical, BarChart3, Shield, Lightbulb } from "lucide-react";
import AdvancedNetworkAnimation from "@/components/three/AdvancedNetworkAnimation";

const capabilities = [
  { icon: Search, title: "AI Readiness Assessment", desc: "A deep-dive audit of your existing infrastructure, data maturity, and team readiness to identify where AI will have the highest impact." },
  { icon: Map, title: "Roadmap & Strategy", desc: "Phased implementation plans with clear ROI milestones, technical specifications, and realistic timelines tailored to your business." },
  { icon: Lightbulb, title: "Use Case Identification", desc: "Data-backed analysis of which AI applications will deliver the most value for your specific industry and operations." },
  { icon: FlaskConical, title: "PoC Development", desc: "Rapid prototyping in 4–8 weeks to validate assumptions and prove ROI before you commit to a full-scale build." },
  { icon: Shield, title: "Governance & Compliance", desc: "AI governance frameworks covering data privacy, model bias, regulatory alignment, and SOC2-ready security controls." },
  { icon: BarChart3, title: "Cost-Benefit Analysis", desc: "Comprehensive analysis of compute costs vs. operational gain, optimising for sustainable long-term AI adoption." },
];

const whoItsFor = [
  "Businesses exploring AI adoption but unsure where to start",
  "Leadership teams that need ROI evidence before making infrastructure decisions",
  "Organisations recovering from failed or fragmented AI initiatives",
  "Companies ready to build an AI-first operational foundation",
];

export default function AIConsultingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <AdvancedNetworkAnimation />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 01</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                AI Consulting<br />
                <span className="text-phi-blue/60 italic">& Strategy.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-2xl">
                We help you understand where AI fits your business, build a realistic roadmap, and prove value with a working prototype — before you commit to anything.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm">
                    Book a Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-8 py-4 text-sm">
                    All Services
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">What's Included</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Core Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                  <cap.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white/90 mb-2 text-lg">{cap.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For + Engagement */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Who It's For */}
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Who This Is For</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
                  Ideal<br /><span className="text-phi-blue/60 italic">Clients.</span>
                </h2>
              </div>
              <div className="space-y-4">
                {whoItsFor.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2.5 group-hover:bg-white transition-colors flex-shrink-0" />
                    <p className="text-white/50 font-light leading-relaxed group-hover:text-white/70 transition-colors">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Typical Engagement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 sm:p-8 md:p-10 rounded-2xl border border-white/10 bg-white/[0.02] space-y-8"
            >
              <h3 className="text-2xl font-bold uppercase tracking-tight">Typical Engagement</h3>

              <div className="relative border-l border-white/10 pl-8 space-y-8">
                {[
                  { phase: "Phase 1", title: "Discovery & Audit", time: "1–2 weeks", desc: "Deep-dive across your infrastructure, data, and processes." },
                  { phase: "Phase 2", title: "PoC Development", time: "4–8 weeks", desc: "Working prototype to validate the highest-impact use case." },
                  { phase: "Outcome", title: "Roadmap Delivery", time: "12-month plan", desc: "Phased implementation blueprint with ROI projections." },
                ].map((step) => (
                  <div key={step.phase} className="relative">
                    <div className="absolute -left-[37px] top-1 w-2 h-2 rounded-full bg-white/20" />
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-1">{step.phase} — {step.time}</p>
                    <h4 className="text-lg font-bold mb-1">{step.title}</h4>
                    <p className="text-sm text-white/40 font-light">{step.desc}</p>
                  </div>
                ))}
              </div>

              <Link href="/contact" className="block pt-4">
                <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 w-full py-4 text-sm">
                  Start Your Assessment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Ready to Build Your<br />
            <span className="text-phi-blue/60 italic">AI Strategy?</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Our initial consultations are free. We'll assess your business and tell you honestly where AI makes sense — and where it doesn't.
          </p>
          <Link href="/contact">
            <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
              Book a Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
