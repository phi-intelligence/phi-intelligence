import { Link } from "wouter";
import { Mail, Phone, MapPin, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ContactForm from "@/components/ui/contact-form";
import Robot3D from "@/components/three/robotvoice";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* ── Hero ── */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_65%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 space-y-6"
            >
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Contact Us</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Let's Build<br />
                <span className="text-phi-blue">Together.</span>
              </h1>
              <p className="text-lg text-white/50 font-light leading-relaxed max-w-2xl">
                Ready to integrate AI into your business? Our engineering team reviews every enquiry
                and responds within 24 hours with a tailored technical assessment.
              </p>
            </motion.div>

            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-3xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                <div className="w-full h-full relative z-10 scale-100 sm:scale-110 lg:scale-125">
                  <Robot3D />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-white/30">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form + Info ── */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 items-start">

            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="xl:col-span-7"
            >
              <div className="space-y-6 mb-10">
                <h2 className="text-3xl lg:text-5xl font-bold tracking-tighter uppercase">
                  Start a <span className="text-phi-blue">Conversation</span>
                </h2>
                <p className="text-white/40 font-light max-w-lg">
                  Tell us about your project and we'll respond with a technical assessment and recommended approach.
                </p>
              </div>
              <ContactForm />
            </motion.div>

            {/* Right: Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="xl:col-span-5 space-y-8 xl:sticky xl:top-32"
            >
              {/* Contact cards */}
              {[
                { icon: Mail, label: "Email", value: "info@phiintelligence.com", href: "mailto:info@phiintelligence.com" },
                { icon: Phone, label: "Phone", value: "07352745227", href: "tel:07352745227" },
                { icon: MapPin, label: "Location", value: "Nottingham, UK" },
                { icon: Clock, label: "Response Time", value: "Within 24 hours" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group flex items-start gap-5 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-phi-blue/20 hover:bg-phi-blue/[0.03] transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-phi-blue/10 border border-phi-blue/15 flex items-center justify-center shrink-0 group-hover:bg-phi-blue group-hover:border-phi-blue transition-all duration-500">
                    <item.icon className="w-5 h-5 text-phi-blue group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30 mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-lg font-semibold hover:text-phi-blue transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-lg font-semibold">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* CTA box */}
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4 mt-4">
                <h3 className="text-lg font-bold tracking-tight">Prefer a direct conversation?</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  Book a 30-minute discovery call with our lead engineering team to discuss your requirements.
                </p>
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-6 py-3 text-sm shadow-[0_0_40px_rgba(0,163,255,0.15)] mt-2">
                    Schedule a Call <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
