import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, HeartPulse, Landmark, Scale, ShoppingBag, Factory, Truck } from "lucide-react";
import Globe from "@/components/three/Globe";

/* ── Industry icons ──────────────────────────────────────────────────── */
import healthcareIcon    from "../../../additional_logos_icons/healthcare_icon.png";
import financialIcon     from "../../../additional_logos_icons/financial_services_icon.png";
import legalIcon         from "../../../additional_logos_icons/legal_icon.png";
import ecommerceIcon     from "../../../additional_logos_icons/ecommerce_retail_icon.png";
import manufacturingIcon from "../../../additional_logos_icons/manufacturing_icon.png";

const industries = [
  {
    icon: HeartPulse,
    logo: healthcareIcon,
    name: "Healthcare",
    accent: "rose",
    applications: [
      "Patient scheduling via voice AI",
      "Medical document processing",
      "Clinical decision support",
      "HIPAA-compliant data analysis",
    ],
    services: [
      { label: "SaaS Applications", href: "/services/saas" },
      { label: "Voice Agents", href: "/services/voice-automation" },
      { label: "Document Processing", href: "/services/document-processing" },
    ],
  },
  {
    icon: Landmark,
    logo: financialIcon,
    name: "Financial Services",
    accent: "amber",
    applications: [
      "KYC automation",
      "Fraud detection",
      "Regulatory reporting",
      "Client onboarding",
    ],
    services: [
      { label: "SaaS Applications", href: "/services/saas" },
      { label: "Document Processing", href: "/services/document-processing" },
      { label: "Business Automation", href: "/services/process-automation" },
    ],
  },
  {
    icon: Scale,
    logo: legalIcon,
    name: "Legal",
    accent: "slate",
    applications: [
      "Contract analysis",
      "Case research RAG",
      "Document review",
      "Compliance monitoring",
    ],
    services: [
      { label: "Document Processing", href: "/services/document-processing" },
      { label: "SaaS Applications", href: "/services/saas" },
      { label: "Business Automation", href: "/services/process-automation" },
    ],
  },
  {
    icon: ShoppingBag,
    logo: ecommerceIcon,
    name: "E-Commerce & Retail",
    accent: "violet",
    applications: [
      "Product recommendation",
      "AI product photography",
      "Inventory forecasting",
      "Conversational support",
    ],
    services: [
      { label: "Web Applications", href: "/services/web-development" },
      { label: "Computer Vision", href: "/services/computer-vision" },
      { label: "Digital Marketing", href: "/services/digital-marketing" },
    ],
  },
  {
    icon: Factory,
    logo: manufacturingIcon,
    name: "Manufacturing",
    accent: "orange",
    applications: [
      "Real-time quality control CV",
      "Predictive maintenance",
      "Supply chain optimisation",
      "Production scheduling AI",
    ],
    services: [
      { label: "Computer Vision", href: "/services/computer-vision" },
      { label: "Business Automation", href: "/services/process-automation" },
      { label: "SaaS Applications", href: "/services/saas" },
    ],
  },
  {
    icon: Truck,
    name: "Logistics",
    accent: "cyan",
    applications: [
      "Route optimisation",
      "Demand forecasting",
      "Warehouse automation",
      "Shipment tracking",
    ],
    services: [
      { label: "Business Automation", href: "/services/process-automation" },
      { label: "SaaS Applications", href: "/services/saas" },
      { label: "Mobile Applications", href: "/services/mobile-development" },
    ],
  },
];

const accentGradients: Record<string, string> = {
  rose: "from-rose-500/60 to-transparent",
  amber: "from-amber-500/60 to-transparent",
  slate: "from-slate-400/60 to-transparent",
  violet: "from-violet-500/60 to-transparent",
  emerald: "from-emerald-500/60 to-transparent",
  orange: "from-orange-500/60 to-transparent",
  blue: "from-blue-500/60 to-transparent",
  cyan: "from-cyan-500/60 to-transparent",
  pink: "from-pink-500/60 to-transparent",
};

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-[500px]">
            <Globe />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Sectors</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Industries<br />
                <span className="text-phi-blue">We Serve.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                AI solutions designed for the specific challenges of your industry — not generic tools adapted after the fact.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Where We Operate</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((industry, i) => {
              const Icon = industry.icon;
              return (
                <motion.div
                  key={industry.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-2xl border border-white/8 overflow-hidden hover:border-phi-blue/30 transition-all duration-300"
                >
                  {/* Top accent gradient bar */}
                  <div className={`h-1 bg-gradient-to-r ${accentGradients[industry.accent]}`} />

                  {/* Background icon watermark */}
                  {industry.logo && (
                    <img
                      src={industry.logo}
                      alt=""
                      aria-hidden="true"
                      className="absolute -bottom-4 -right-4 w-32 sm:w-40 md:w-56 h-32 sm:h-40 md:h-56 object-contain grayscale opacity-[0.05] group-hover:opacity-[0.13] group-hover:grayscale-0 transition-all duration-500 pointer-events-none select-none"
                    />
                  )}

                  {/* Card content */}
                  <div className="relative z-10 p-4 sm:p-6 md:p-8 space-y-5">
                    {/* Icon + Name row */}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                        industry.logo
                          ? "bg-phi-blue/5 border-phi-blue/10 group-hover:bg-phi-blue/20 group-hover:border-phi-blue/30"
                          : "bg-phi-blue/5 border-phi-blue/10 group-hover:bg-phi-blue group-hover:text-white"
                      }`}>
                        {industry.logo ? (
                          <img
                            src={industry.logo}
                            alt={industry.name}
                            className="w-6 h-6 object-contain grayscale opacity-55 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                          />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight">{industry.name}</h3>
                    </div>

                    {/* Applications list */}
                    <div className="space-y-2.5">
                      {industry.applications.map((app) => (
                        <div key={app} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-phi-blue/30 mt-1.5 flex-shrink-0" />
                          <span className="text-sm text-white/45 font-light leading-relaxed">{app}</span>
                        </div>
                      ))}
                    </div>

                    {/* Service links as pills */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {industry.services.map((service) => (
                        <Link key={service.label} href={service.href}>
                          <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border border-white/8 rounded-full text-white/30 hover:text-phi-blue hover:border-phi-blue/30 transition-all cursor-pointer">
                            {service.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Not Sure Where to Start?<br />
            <span className="text-phi-blue">We'll Help.</span>
          </h2>
          <p className="text-lg text-white/40 font-light leading-relaxed">
            Book a free consultation. We'll assess your industry, data, and processes — then recommend the right AI approach.
          </p>
          <div className="flex justify-center">
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold shadow-[0_0_40px_rgba(0,163,255,0.2)]">
                Book a Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
