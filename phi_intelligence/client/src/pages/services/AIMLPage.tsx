import { Link } from "wouter";
import { Mic, MessageSquare, Users, Brain, ArrowRight, CheckCircle, Cpu, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ANNAnimation from "@/components/three/ANNAnimation";
import VoiceBubble from "@/components/voice/VoiceBubble";
import { FrameworkWrapper } from "@/components/voice/FrameworkWrapper";

export default function AIMLPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-28 lg:pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Hero Section - Standardized Layout with Strict Text Constraints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          <div className="space-y-8 z-10 max-w-xl">
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold tracking-[0.2em] uppercase opacity-40">
              Core Intelligence
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter leading-none"
            >
              AI/ML<br />
              <span className="opacity-20 uppercase">Solutions.</span>
            </motion.h1>
            <p className="text-xl opacity-40 font-light leading-relaxed">
              Custom-engineered neural architectures designed for high-throughput enterprise environments.
            </p>
            <div className="pt-4">
               <Link href="/company/contact">
                 <Button className="pill-button bg-white text-black px-10">Sync with Engineering</Button>
               </Link>
            </div>
          </div>
          
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02]">
             <div className="absolute inset-0 z-0 opacity-90 flex items-center justify-center scale-125">
                <ANNAnimation />
             </div>
             <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Detailed Services */}
        <div className="space-y-24 lg:space-y-32">
          
          {/* Voice Agents - Interactive Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[450px] sm:h-[450px]">
                <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-8 rounded-full border border-dashed border-white/5 animate-[spin_30s_linear_infinite_reverse]" />
                <div className="absolute -inset-4 rounded-full border border-white/5 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center justify-center mb-8">
                  <FrameworkWrapper>
                    <div className="scale-90 sm:scale-110 flex items-center justify-center">
                      <VoiceBubble />
                    </div>
                  </FrameworkWrapper>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6 lg:space-y-8 text-center lg:text-left">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight uppercase">VOICE AGENTS</h2>
              <p className="text-lg lg:text-xl opacity-60 leading-relaxed font-light">
                Autonomous voice synthesis for 24/7 client interactions and seamless call management.
              </p>
              <div className="grid gap-2 text-left">
                 {["Low Latency Response", "Natural Language Synthesis", "CRM Integration"].map(f => (
                   <div key={f} className="flex items-center gap-3 py-3 lg:py-4 border-b border-white/5 opacity-80 font-light text-sm lg:text-base">
                      <div className="w-1 h-1 rounded-full bg-white" />
                      {f}
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Agentic Operations - Relevant Operations Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 space-y-6 lg:space-y-8 text-center lg:text-left">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight uppercase">AGENTIC OPS</h2>
              <p className="text-lg lg:text-xl opacity-60 leading-relaxed font-light">
                Intelligent software agents that handle complex decision-making and operational workflows.
              </p>
              <div className="grid gap-2 text-left">
                 {["Self-Optimizing Workflows", "Autonomous Scheduling", "Real-time Risk Assessment"].map(f => (
                   <div key={f} className="flex items-center gap-3 py-3 lg:py-4 border-b border-white/5 opacity-80 font-light text-sm lg:text-base">
                      <div className="w-1 h-1 rounded-full bg-white" />
                      {f}
                   </div>
                 ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative aspect-square rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/5 bg-white/[0.02]">
               <img 
                 src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" 
                 className="w-full h-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
                 alt="Real-time Operational Intelligence"
               />
               <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
