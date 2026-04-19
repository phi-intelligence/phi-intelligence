import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, ScanLine, FileText, Sparkles, Video, ChevronRight } from "lucide-react";
import { VisionDetectionMini } from "@/components/ServiceAnimations";

const capabilities = [
  { icon: Layers, title: "Image Segmentation", desc: "Semantic, instance, and panoptic segmentation for product detection, medical imaging, quality control, and scene understanding. We deploy SAM 2, YOLO v11, and custom architectures." },
  { icon: ScanLine, title: "Object Detection & Recognition", desc: "Real-time object detection for manufacturing QC, retail inventory, security monitoring, and autonomous systems — with sub-100ms inference on optimised hardware." },
  { icon: FileText, title: "OCR & Document Digitisation", desc: "Convert printed and handwritten documents to searchable, structured formats — including complex layouts, tables, and multilingual text." },
  { icon: Sparkles, title: "AI Image Generation", desc: "Product photography enhancement, background generation, style transfer, and upscaling using FLUX.1 and Stable Diffusion XL — reducing photography costs significantly." },
  { icon: Video, title: "Video Analytics", desc: "Real-time video analysis for security, traffic, retail behaviour tracking, and sports analytics — deployed on edge hardware or cloud infrastructure." },
];

const useCases = [
  { sector: "Manufacturing", example: "Real-time defect detection on production lines using fine-tuned YOLO models — identifying surface defects, dimensional variance, and assembly errors at inference speeds suitable for live conveyor systems." },
  { sector: "Retail", example: "Shelf monitoring and inventory counting — detecting out-of-stock products and misplaced items automatically." },
  { sector: "Healthcare", example: "Medical image analysis — assisting radiologists with anomaly detection in X-rays and MRI scans." },
  { sector: "Legal & Finance", example: "Document digitisation — converting paper archives into fully searchable, structured digital records." },
  { sector: "Security", example: "CCTV analytics — detecting unusual behaviour patterns and alerting security teams in real time." },
  { sector: "E-Commerce", example: "Product image automation — generating studio-quality backgrounds and variations from a single photo." },
];

export default function ComputerVisionPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 08</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Computer<br />Vision &<br />
                <span className="text-phi-blue/60 italic">Image AI.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                Custom visual intelligence — from object detection on a production line to document digitisation in a legal archive to AI-generated product imagery for e-commerce.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm">
                    Discuss Your Project <ArrowRight className="w-4 h-4 ml-2" />
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
              className="relative h-[400px] overflow-hidden"
            >
              <VisionDetectionMini />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">What We Build</h2>
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

      {/* Use Cases */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Real Applications</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Use Cases</h2>
          </div>
          <div className="space-y-0 divide-y divide-white/5">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.sector}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="py-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-start"
              >
                <span className="text-xs font-bold tracking-widest uppercase text-white/30">{uc.sector}</span>
                <p className="sm:col-span-3 text-white/50 font-light text-sm leading-relaxed">{uc.example}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Our Approach</p>
            <p className="text-base text-white/50 font-light leading-relaxed">
              Computer vision projects are domain-specific. We don't deploy generic models and hope they work. Every engagement starts with your data, your edge cases, and your accuracy requirements — then we select or fine-tune the right model architecture.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Give Your Systems<br />
            <span className="text-phi-blue/60 italic">The Ability to See.</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Computer vision projects are highly specific. Let's discuss your use case and we'll tell you exactly what's possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
                Discuss Your Project <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/technology">
              <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-10 py-4 text-sm">
                Our Model Stack <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
