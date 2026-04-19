import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Cloud, Smartphone, Globe, Cpu, Mic, Layers, TrendingUp, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Cloud,
    number: "01",
    label: "SaaS Applications",
    desc: "Custom AI-powered business software — employee management, CRM, inventory tracking, financial reporting, and project management tools built for your operations.",
    href: "/services/saas",
    tags: ["HRMS", "CRM", "Inventory", "Finance"],
  },
  {
    icon: Smartphone,
    number: "02",
    label: "Mobile Applications",
    desc: "iOS and Android apps powered by AI — voice recognition, computer vision, on-device inference, and predictive intelligence as core features.",
    href: "/services/mobile-development",
    tags: ["React Native", "Flutter", "On-Device AI", "iOS & Android"],
  },
  {
    icon: Globe,
    number: "03",
    label: "Web Applications",
    desc: "Full-stack web platforms powered by AI — LLM-powered interfaces, intelligent search, automated workflows, and real-time dashboards.",
    href: "/services/web-development",
    tags: ["React / Next.js", "LLM Integration", "RAG Search", "Dashboards"],
  },
  {
    icon: Cpu,
    number: "04",
    label: "Business Automation",
    desc: "AI agents that handle multi-step workflows across CRM, ERP, email, and communication tools — reducing manual work by up to 80%.",
    href: "/services/process-automation",
    tags: ["AI Agents", "Workflow", "Integration", "Monitoring"],
  },
  {
    icon: Mic,
    number: "05",
    label: "Voice Agents",
    desc: "Deploy AI voice agents for inbound and outbound calls. Assist live agents in real-time or fully automate conversations with human-level quality.",
    href: "/services/voice-automation",
    tags: ["Voice Agents", "Live Assist", "Telephony", "Multilingual"],
  },
  {
    icon: Layers,
    number: "06",
    label: "Document Processing",
    desc: "Extract, classify, and search documents using LLMs and RAG pipelines. Multi-format support for PDFs, scans, handwritten text, and complex tables.",
    href: "/services/document-processing",
    tags: ["LLM Extraction", "RAG Search", "Multi-Format", "Compliance"],
  },
  {
    icon: TrendingUp,
    number: "07",
    label: "AI-Powered Digital Marketing",
    desc: "Content generation, Answer Engine Optimisation, programmatic ad management, and predictive analytics to drive measurable growth.",
    href: "/services/digital-marketing",
    tags: ["AEO", "Content Generation", "Ad Optimisation", "Analytics"],
  },
  {
    icon: Eye,
    number: "08",
    label: "Computer Vision",
    desc: "Object detection, image segmentation, OCR, AI image generation, and real-time video analytics for manufacturing, retail, healthcare, and security.",
    href: "/services/computer-vision",
    tags: ["Detection", "Segmentation", "OCR", "Video Analytics"],
  },
];

export default function ServicesIndex() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-16 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[min(50vw,28rem)] h-[min(50vw,28rem)] rounded-full bg-phi-blue/[0.06] blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-6"
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Our Services</p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
              What We<br />
              <span className="text-phi-blue/60 italic">Build.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-2xl">
              End-to-end AI capabilities — from strategy and consulting to custom development, voice automation, and production deployment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-0">
            {services.map((service, i) => (
              <motion.div
                key={service.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group border-b border-white/5 last:border-none"
              >
                <Link href={service.href}>
                  <div className="py-10 md:py-14 cursor-pointer transition-all duration-300 hover:pl-4 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-6 md:gap-12">
                    {/* Number + Icon */}
                    <div className="flex items-center gap-6 lg:w-36 flex-shrink-0">
                      <span className="text-3xl md:text-4xl font-bold text-white/8 group-hover:text-white/20 transition-colors">
                        {service.number}
                      </span>
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                        <service.icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow space-y-3">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight group-hover:text-white transition-colors">
                        {service.label}
                      </h2>
                      <p className="text-base text-white/40 font-light leading-relaxed max-w-2xl group-hover:text-white/60 transition-colors">
                        {service.desc}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="lg:w-64 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border border-white/5 rounded-full text-white/25 group-hover:text-white/50 group-hover:border-white/15 transition-all">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:flex flex-shrink-0">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Not Sure Where<br />
            <span className="text-phi-blue/60 italic">To Start?</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Book a free consultation. We'll assess your business and recommend the right AI approach — no commitment required.
          </p>
          <Link href="/contact">
            <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
              Book a Free Consultation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
