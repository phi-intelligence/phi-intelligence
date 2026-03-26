import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Workflow, Bot, MessageSquare, Plug, Mail, Settings, Wrench } from "lucide-react";
import { AutomationFlowMini } from "@/components/ServiceAnimations";

const capabilities = [
  { icon: Bot, title: "AI Agent Deployment", desc: "Autonomous AI agents that navigate cross-system workflows independently — handling multi-step tasks across CRM, ERP, and legacy infrastructure." },
  { icon: Workflow, title: "Multi-Agent Orchestration", desc: "Multiple AI agents working together on connected tasks — for example, one agent extracts data from incoming emails, a second validates it against your CRM records, and a third generates a response or creates a follow-up task. Each agent handles its speciality; the orchestration layer coordinates the sequence." },
  { icon: Settings, title: "Self-Correcting Workflows", desc: "Automation pipelines that validate their own output — detecting extraction errors, retrying with adjusted parameters, and flagging items for human review when confidence drops below threshold. No silent failures." },
  { icon: Plug, title: "System Integration", desc: "Seamless connection of your existing tools via API layers — CRM, ERP, communication platforms, databases — into unified automated workflows." },
  { icon: MessageSquare, title: "Intelligent Assistants", desc: "NLU-driven virtual assistants that handle complex queries with deep understanding of your internal documentation and processes." },
  { icon: Mail, title: "Communication Automation", desc: "Automated inbox triage, dynamic email responses, WhatsApp Business integration, and intelligent escalation routing." },
  { icon: Wrench, title: "Predictive Monitoring", desc: "Continuous monitoring of operational health, applying predictive logic to anticipate issues before they impact performance." },
];

const workflow = [
  { icon: Settings, label: "Trigger", desc: "Events from your systems — form submissions, emails, CRM updates, scheduled tasks" },
  { icon: Bot, label: "Reasoning", desc: "AI agents analyse context, make decisions, and plan the optimal sequence of actions" },
  { icon: Workflow, label: "Execution", desc: "Automated actions across your tools — updates, notifications, data transforms, API calls" },
];

export default function ProcessAutomationPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 04</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Business<br />Process<br />
                <span className="text-phi-blue/60 italic">Automation.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                AI agents that handle multi-step workflows across your CRM, ERP, email, and communication tools — replacing manual data entry, document routing, and follow-up tasks with automated execution.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm">
                    Automate Your Workflows <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-8 py-4 text-sm">
                    All Services
                  </Button>
                </Link>
              </div>
            </motion.div>

            <div className="relative h-[400px] overflow-hidden">
              <AutomationFlowMini />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">What We Automate</h2>
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

      {/* How It Works */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-12 text-center">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Architecture</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">How It Works</h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {workflow.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center text-center gap-4 flex-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="w-16 h-16 rounded-xl border border-phi-blue/10 bg-phi-blue/5 flex items-center justify-center hover:bg-phi-blue hover:text-white transition-all duration-300 group"
                >
                  <step.icon className="w-7 h-7" />
                </motion.div>
                <h4 className="font-bold uppercase tracking-wide text-sm">{step.label}</h4>
                <p className="text-xs text-white/40 font-light leading-relaxed max-w-[200px]">{step.desc}</p>
                {i < workflow.length - 1 && (
                  <div className="hidden lg:block absolute">
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Connectors (desktop) */}
          <div className="hidden lg:flex justify-center items-center gap-0 -mt-[140px] mb-[80px] pointer-events-none">
            <div className="w-[200px]" />
            <div className="h-px w-[100px] bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
            <div className="w-[100px]" />
            <div className="h-px w-[100px] bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
            <div className="w-[200px]" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Stop Manual Workflows.<br />
            <span className="text-phi-blue/60 italic">Start Automating.</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Tell us which processes consume the most time. We'll design an automation architecture and show you the impact before you commit.
          </p>
          <Link href="/contact">
            <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
