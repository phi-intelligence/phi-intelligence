import { Link } from "wouter";
import { Mic, Layout, ArrowRight, Layers, MessageSquare, Zap, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const products = [
  {
    title: "WORKSTREAM",
    id: "workstream",
    description: "Agentic workforce management for industrial-scale efficiency. Automate scheduling, tracking, and task delegation.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000",
    features: ["Task Automation", "Team Analytics", "Real-time Tracking"],
    href: "/products/workstream",
    icon: Layout
  },
  {
    title: "VOICEBOT BUILDER",
    id: "voicebot-builder",
    description: "Build custom AI voice agents in minutes. No-code interface for complex conversational flows and logic.",
    image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1000",
    features: ["Drag-and-Drop Logic", "Multilingual Support", "CRM Integration"],
    href: "/products/voicebot-builder",
    icon: Mic
  }
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Header */}
        <div className="mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-bold tracking-tighter"
          >
            OUR<br />
            <span className="opacity-20 uppercase">Products.</span>
          </motion.h1>
          <p className="text-xl md:text-2xl opacity-40 max-w-2xl mt-8 font-light">
            Scalable AI platforms built to empower your organizational growth.
          </p>
        </div>

        {/* Products List */}
        <div className="space-y-48">
          {products.map((product, idx) => (
            <div key={product.id} className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className={idx % 2 !== 0 ? "lg:order-2" : ""}>
                <div className="space-y-8">
                  <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10">
                    <product.icon className="w-8 h-8 opacity-40" />
                  </div>
                  <h2 className="text-5xl font-bold tracking-tight">{product.title}</h2>
                  <p className="text-xl opacity-60 leading-relaxed font-light">
                    {product.description}
                  </p>
                  <div className="flex flex-col gap-4">
                    {product.features.map(f => (
                      <div key={f} className="flex items-center gap-4 py-4 border-b border-white/5 opacity-80 group transition-all duration-300 hover:pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-white group-hover:scale-150 transition-transform" />
                        <span className="text-lg font-light tracking-wide">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8">
                    <Link href={product.href}>
                      <Button className="pill-button bg-white text-black px-12">
                        Get Started <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className={`relative group ${idx % 2 !== 0 ? "lg:order-1" : ""}`}>
                <div className="absolute -inset-4 bg-white/5 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative aspect-square rounded-[3rem] border border-white/10 bg-white/[0.02] p-2 overflow-hidden shadow-2xl">
                  <img 
                    src={product.image} 
                    className="w-full h-full object-cover rounded-[2.5rem] grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-110"
                    alt={product.title}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:opacity-0 transition-opacity duration-1000" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Solutions CTA */}
        <section className="mt-48 p-20 rounded-[3rem] bg-white text-black text-center space-y-8">
           <h2 className="text-4xl md:text-6xl font-bold tracking-tight">NEED SOMETHING CUSTOM?</h2>
           <p className="text-xl opacity-60 font-light max-w-2xl mx-auto leading-relaxed">
             Our engineering team specializes in building bespoke AI solutions tailored to unique enterprise requirements.
           </p>
           <div className="pt-8">
             <Link href="/company/contact">
               <Button className="pill-button bg-black text-white px-16 py-8 text-xl font-bold">Inquire Now</Button>
             </Link>
           </div>
        </section>
      </div>
    </div>
  );
}