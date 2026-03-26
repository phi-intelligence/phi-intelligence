import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Phone, Globe, ShieldCheck, BarChart3, Headphones, Bot } from "lucide-react";
import { VoiceWaveformMini } from "@/components/ServiceAnimations";

const modes = [
  {
    icon: Headphones,
    title: "Assist Mode",
    desc: "AI listens to live calls and provides your human agents with real-time transcription, suggested responses, compliance checks, and automatic CRM updates.",
    features: ["Live Transcription", "Suggested Responses", "Compliance Monitoring", "CRM Auto-Sync"],
  },
  {
    icon: Bot,
    title: "Autonomous Agent",
    desc: "Fully autonomous voice agents that handle inbound and outbound calls end-to-end — multi-turn conversations with human-level quality and zero wait times.",
    features: ["Multi-Turn Conversations", "Dynamic Speech Pipeline", "Dialect Recognition", "Natural TTS"],
  },
];

const capabilities = [
  { icon: Phone, title: "Multi-Region Telephony", desc: "Direct PSTN connectivity via Telnyx and Plivo across US, UK, and India. SIP trunking, VoIP, and local number provisioning for low-latency, carrier-grade audio quality." },
  { icon: Mic, title: "Advanced Speech Stack", desc: "LiveKit + Deepgram pipeline delivering sub-200ms response times for natural, real-time conversation flow." },
  { icon: ShieldCheck, title: "Regulatory Compliance", desc: "Compliant voice operations: TCPA (US), GDPR/PECR (UK), TRAI (India). SOC2-ready architecture with automatic PII handling, encrypted call storage, and consent management built into the call flow." },
  { icon: Globe, title: "Multilingual Support", desc: "Deploy in 40+ languages with automatic dialect switching and cultural nuance adaptation." },
  { icon: BarChart3, title: "Call Analytics", desc: "Real-time dashboards tracking sentiment, resolution rates, call duration, and conversion metrics." },
];

export default function VoiceAutomationPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 05</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                AI Voice<br />
                <span className="text-phi-blue/60 italic">Automation.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                Powered by our dual-mode voice platform that handles calls autonomously or assists your live agents in real-time with sub-200ms response latency and natural conversation flow.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm">
                    Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
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
              <VoiceWaveformMini />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Two Modes */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Two Deployment Modes</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modes.map((mode, i) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 md:p-10 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group space-y-6"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                  <mode.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">{mode.title}</h3>
                  <p className="text-white/40 font-light leading-relaxed">{mode.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {mode.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="text-xs text-white/40 font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Capabilities */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Technical Stack</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Capabilities</h2>
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
                <p className="text-sm text-white/40 font-light leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Ready to Automate<br />
            <span className="text-phi-blue/60 italic">Your Voice Operations?</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Schedule a demo call. Experience the quality of our voice agents firsthand — on your own infrastructure.
          </p>
          <Link href="/contact">
            <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
              Request a Demo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
