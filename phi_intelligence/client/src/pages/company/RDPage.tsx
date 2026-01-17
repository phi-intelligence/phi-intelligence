import { Link } from "wouter";
import { FlaskConical, Brain, Lightbulb, ArrowRight, MessageSquare, Eye, Bot, Smartphone, Shield, GraduationCap, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function RDPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold tracking-[0.2em] uppercase opacity-40">
              Future Frontier
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-bold tracking-tighter leading-none"
            >
              R&D<br />
              <span className="opacity-20 uppercase">Lab.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl opacity-40 max-w-lg font-light leading-relaxed">
              Pushing the boundaries of artificial intelligence through breakthrough research and experimental engineering.
            </p>
            <div className="pt-4">
               <Link href="/company/contact">
                 <Button className="pill-button bg-white text-black px-10">Collaborate with Us</Button>
               </Link>
            </div>
          </div>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02]">
             <img 
               src="/assets/robot-ai.gif" 
               className="w-full h-full object-contain grayscale opacity-20 transition-opacity hover:opacity-40" 
               alt="AI Research" 
             />
             <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>

        {/* Research Focus Areas */}
        <section className="space-y-16">
          <h2 className="text-5xl font-bold tracking-tight border-b border-white/5 pb-8">RESEARCH AREAS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Natural Language", icon: MessageSquare, desc: "Bridges the human-AI communication gap with advanced NLP architectures." },
              { title: "Computer Vision", icon: Eye, desc: "Visual intelligence systems for high-precision industrial recognition." },
              { title: "Autonomous Systems", icon: Bot, desc: "Next-gen robotics focused on independent decision making." },
              { title: "Edge Intelligence", icon: Smartphone, desc: "High-performance AI optimized for resource-constrained hardware." },
              { title: "AI Ethics & Safety", icon: Shield, desc: "Research into responsible, unbiased, and transparent AI protocols." },
              { title: "Neural Dynamics", icon: Brain, desc: "Experimental study of complex neural network behaviors." }
            ].map(area => (
              <div key={area.title} className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group">
                <area.icon className="w-10 h-10 mb-8 opacity-20 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{area.title}</h3>
                <p className="opacity-40 font-light leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Partnerships */}
        <section className="mt-48 pt-24 border-t border-white/5">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              <div className="space-y-6">
                 <GraduationCap className="w-12 h-12 opacity-10" />
                 <h4 className="text-2xl font-bold tracking-tight">Academic Ties</h4>
                 <p className="opacity-40 font-light leading-relaxed text-lg">Partnering with leading universities to bridge the gap between theory and industrial application.</p>
              </div>
              <div className="space-y-6">
                 <Building2 className="w-12 h-12 opacity-10" />
                 <h4 className="text-2xl font-bold tracking-tight">Industry Labs</h4>
                 <p className="opacity-40 font-light leading-relaxed text-lg">Collaborating with global enterprises to solve real-world operational challenges at scale.</p>
              </div>
              <div className="space-y-6">
                 <Globe className="w-12 h-12 opacity-10" />
                 <h4 className="text-2xl font-bold tracking-tight">Global Network</h4>
                 <p className="opacity-40 font-light leading-relaxed text-lg">A distributed research network accelerating breakthroughs across international borders.</p>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}