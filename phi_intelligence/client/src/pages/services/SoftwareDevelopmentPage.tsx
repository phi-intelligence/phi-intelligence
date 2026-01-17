import { Link } from "wouter";
import { Code, Brain, Cpu, ArrowRight, CheckCircle, Smartphone, Globe, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SoftwareDevelopmentPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-28 lg:pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Hero Section - Standardized Layout with Strict Text Constraints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          <div className="space-y-8 z-10 max-w-xl">
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold tracking-[0.2em] uppercase opacity-40">
              Evolutionary Code
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter leading-none"
            >
              ADAPTIVE<br />
              <span className="opacity-20 uppercase">Software.</span>
            </motion.h1>
            <p className="text-xl opacity-40 font-light leading-relaxed">
              We build self-evolving software ecosystems that optimize performance in real-time.
            </p>
            <div className="pt-4">
               <Link href="/company/contact">
                 <Button className="pill-button bg-white text-black px-10">Initialize Project</Button>
               </Link>
            </div>
          </div>
          
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02]">
             <img 
               src="/assets/cursor.gif" 
               className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-50 transition-opacity duration-1000" 
               alt="Adaptive Software" 
             />
             <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-32">
           <div className="p-8 lg:p-16 rounded-[2.5rem] lg:rounded-[4rem] border border-white/5 bg-white/[0.02] space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <Globe className="w-8 h-8 lg:w-10 lg:h-10 opacity-30" />
                <h3 className="text-3xl lg:text-4xl font-bold tracking-tight uppercase">AI-Enhanced Web</h3>
                <p className="opacity-40 font-light leading-relaxed text-lg">
                  Intelligent web applications featuring LLM-driven search and predictive behavior.
                </p>
              </div>
              <div className="aspect-video rounded-[2rem] overflow-hidden mt-8 border border-white/5">
                <img src="/assets/web.gif" className="w-full h-full object-cover grayscale opacity-20" />
              </div>
           </div>

           <div className="p-8 lg:p-16 rounded-[2.5rem] lg:rounded-[4rem] border border-white/5 bg-white/[0.02] space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <Smartphone className="w-8 h-8 lg:w-10 lg:h-10 opacity-30" />
                <h3 className="text-3xl lg:text-4xl font-bold tracking-tight uppercase">Intelligent Mobile</h3>
                <p className="opacity-40 font-light leading-relaxed text-lg">
                  Native apps enhanced with machine learning for voice and image analysis.
                </p>
              </div>
              <div className="aspect-video rounded-[2rem] overflow-hidden mt-8 border border-white/5">
                <img src="/assets/mobile.gif" className="w-full h-full object-cover grayscale opacity-20" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}