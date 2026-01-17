import { Link } from "wouter";
import { Mic, Phone, Clock, Users, ArrowRight, CheckCircle, Zap, Shield, Smartphone, Globe, Building2, ShoppingBag, Utensils, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AudioBarsAnimation from "@/components/three/AudioBarsAnimation";

export default function CustomVoiceBotsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-28 lg:pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 lg:mb-32">
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-[10px] lg:text-xs font-bold tracking-[0.2em] uppercase opacity-40">
              Vocal Intelligence
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none"
            >
              VOICE<br />
              <span className="opacity-20 uppercase">Agents.</span>
            </motion.h1>
            <p className="text-lg lg:text-2xl opacity-40 max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
              Proprietary vocal synthesis architectures designed for high-precision business automation.
            </p>
            <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
               <Link href="/company/contact">
                 <Button className="pill-button bg-white text-black px-10">Deploy Agent</Button>
               </Link>
            </div>
          </div>
          
          <div className="relative aspect-square rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02] h-[300px] sm:h-[450px] lg:h-auto flex items-center justify-center">
             <div className="w-full h-full opacity-60">
                <AudioBarsAnimation barCount={12} animationSpeed={1.5} />
             </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="space-y-16 mb-48">
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight border-b border-white/5 pb-8 uppercase">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: "24/7 Response", icon: Clock, desc: "Autonomous call handling with zero downtime." },
              { title: "NLP Engine", icon: Mic, desc: "Proprietary natural language processing for fluid conversation." },
              { title: "Brand Voice", icon: Users, desc: "Custom vocal profiles tailored to your corporate identity." },
              { title: "Multi-Channel", icon: Phone, desc: "Unified synthesis across phone, web, and social API." },
              { title: "Low Latency", icon: Zap, desc: "Near-instant response generation for human-like interaction." },
              { title: "Encrypted", icon: Shield, desc: "End-to-end encryption for all vocal data streams." }
            ].map((f) => (
              <div key={f.title} className="p-8 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group">
                <f.icon className="w-8 h-8 mb-6 opacity-20 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xl lg:text-2xl font-bold mb-4 uppercase tracking-tight">{f.title}</h3>
                <p className="opacity-40 font-light leading-relaxed text-sm lg:text-base">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Industries Grid */}
        <section className="space-y-16">
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight border-b border-white/5 pb-8 uppercase">Verticals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
             {[
               { name: "Healthcare", icon: Building2 },
               { name: "Retail", icon: ShoppingBag },
               { name: "Hospitality", icon: Utensils },
               { name: "Logistics", icon: Car }
             ].map(i => (
               <div key={i.name} className="p-10 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col items-center text-center group hover:border-white/20 transition-all">
                  <i.icon className="w-10 h-10 mb-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  <h4 className="text-lg font-bold tracking-widest uppercase">{i.name}</h4>
               </div>
             ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mt-48 p-12 lg:p-24 rounded-[3rem] lg:rounded-[5rem] bg-white text-black text-center space-y-8">
           <h2 className="text-4xl lg:text-8xl font-bold tracking-tighter uppercase leading-none">Vocal.<br />Autonomous.</h2>
           <div className="pt-8 flex justify-center">
              <Link href="/company/contact">
                <Button className="pill-button bg-black text-white px-10 py-6 lg:px-16 lg:py-10 text-lg lg:text-2xl font-bold">Initialize Deployment</Button>
              </Link>
           </div>
        </section>

      </div>
    </div>
  );
}