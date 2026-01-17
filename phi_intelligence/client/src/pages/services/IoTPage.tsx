import { Link } from "wouter";
import { Home, Bell, ArrowRight, CheckCircle, Wifi, Brain, Cpu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function IoTPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-28 lg:pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Hero Section - Standardized Layout with Strict Text Constraints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          <div className="space-y-8 z-10 max-w-xl">
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold tracking-[0.2em] uppercase opacity-40">
              Environment Control
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter leading-none"
            >
              INDUSTRIAL<br />
              <span className="opacity-20 uppercase">IoT.</span>
            </motion.h1>
            <p className="text-xl opacity-40 font-light leading-relaxed">
              Connect and automate your physical infrastructure with AI-driven ecosystems.
            </p>
            <div className="pt-4">
               <Link href="/company/contact">
                 <Button className="pill-button bg-white text-black px-10">Request Site Survey</Button>
               </Link>
            </div>
          </div>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02]">
             <img 
               src="/assets/iot-1.gif" 
               className="w-full h-full object-cover grayscale opacity-30" 
               alt="Industrial IoT" 
             />
             <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>

        {/* Feature Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="relative aspect-video rounded-[2rem] lg:rounded-[4rem] overflow-hidden border border-white/5 bg-white/[0.02] h-[250px] sm:h-[400px] lg:h-auto order-1 lg:order-1">
               <img 
                 src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=1000" 
                 className="w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                 alt="Facility Control"
               />
               <div className="absolute inset-0 bg-black/40" />
            </div>
            <div className="space-y-6 lg:space-y-10 text-center lg:text-left order-2 lg:order-2">
              <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-2 lg:mb-4">
                <Shield className="w-6 h-6 lg:w-8 lg:h-8 opacity-40" />
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight uppercase">FACILITY CONTROL</h2>
              <p className="text-lg lg:text-xl opacity-60 leading-relaxed font-light">
                Enterprise IoT solutions with intelligent monitoring.
              </p>
              <div className="grid gap-3 text-left">
                 {["Centralised Monitoring", "Energy Optimization", "Automated Security"].map(f => (
                   <div key={f} className="flex items-center gap-3 py-4 border-b border-white/5 opacity-80 font-light text-base">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      {f}
                   </div>
                 ))}
              </div>
            </div>
        </div>

      </div>
    </div>
  );
}