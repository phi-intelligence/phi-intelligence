import { Link, useLocation } from "wouter";
import { ArrowRight, Users, Zap, Factory, Shield, Cpu, FileText, BarChart, Presentation, Target, Eye, Fingerprint, MessageCircle, Database, Share2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Globe from "@/components/three/Globe";
import RobotArmAnimation from "@/components/three/RobotArmAnimation";
import Robot3D from "@/components/three/robotvoice";
import VoiceBubble from "@/components/voice/VoiceBubble";
import { FrameworkWrapper } from "@/components/voice/FrameworkWrapper";
import { useState } from "react";
import phiDocsImage from "@/assets/phi.jpeg";

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsSubmitting(true);
    setLocation(`/chat?message=${encodeURIComponent(inputValue.trim())}`);
    setInputValue('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 lg:pt-20">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 lg:space-y-8 z-10 text-center lg:text-left"
          >
            <div className="space-y-4">
              <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold tracking-tighter leading-none uppercase">
                PHI<br />
                <span className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl opacity-40 block mt-2">INTELLIGENCE</span>
              </h1>
              <p className="text-lg md:text-2xl opacity-60 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                Industrial-grade AI solutions engineered for the next generation of business efficiency.
              </p>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link href="/services">
                <Button className="pill-button bg-white text-black hover:bg-opacity-90">
                  Our Services
                </Button>
              </Link>
              <Link href="/company/contact">
                <Button variant="outline" className="pill-button border-white/20 hover:bg-white hover:text-black">
                  Contact Us
                </Button>
              </Link>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="pt-8 w-full max-w-lg mx-auto lg:mx-0"
            >
              <form onSubmit={handleChatSubmit} className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Phi AI anything..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full px-8 py-5 pr-16 text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all duration-500 font-light tracking-wide"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
          
          <div className="relative h-[350px] sm:h-[500px] lg:h-[800px] w-full">
            <Globe />
          </div>
        </div>
      </section>

      {/* 2. Manifesto Section */}
      <section className="py-32 lg:py-48 overflow-hidden border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 space-y-12">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="space-y-4"
               >
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
                     <Fingerprint className="w-3 h-3" /> The Core Manifesto
                  </div>
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                    Strategy Meets<br />
                    <span className="opacity-20 italic">Precision.</span>
                  </h2>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="max-w-2xl"
               >
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-snug tracking-tight text-white/80">
                    We bridge the gap between human ingenuity and machine reliability. Our mission is to transform operational chaos into high-throughput intelligence.
                  </p>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.4 }}
                 className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5"
               >
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Our Purpose</h4>
                    <p className="opacity-50 font-light leading-relaxed">Streamlining global industries through agentic software architectures.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Our Future</h4>
                    <p className="opacity-50 font-light leading-relaxed">Defining the next frontier of human-AI collaboration.</p>
                  </div>
               </motion.div>
            </div>

            <div className="lg:col-span-5 relative group">
               <div className="absolute -inset-1 bg-gradient-to-tr from-white/20 to-transparent rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
               <div className="relative aspect-[4/5] rounded-[3rem] border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                  <div className="w-full h-full relative z-10 scale-125">
                    <Robot3D />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Phi Voice Section */}
      <section className="py-32 lg:py-48 border-b border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
              <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[450px] sm:h-[450px]">
                <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-8 rounded-full border border-dashed border-white/5 animate-[spin_30s_linear_infinite_reverse]" />
                <div className="absolute -inset-4 rounded-full border border-white/5 animate-pulse" />
                <div className="relative z-10">
                  <FrameworkWrapper>
                    <div className="scale-90 sm:scale-110">
                      <VoiceBubble />
                    </div>
                  </FrameworkWrapper>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-12">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="space-y-4"
               >
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
                     <MessageCircle className="w-3 h-3" /> Voice Intelligence Interface
                  </div>
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                    Conversational.<br />
                    <span className="opacity-20 italic">Agentic.</span>
                  </h2>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="max-w-2xl"
               >
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-snug tracking-tight text-white/80">
                    Your intelligent voice agent that handles calls, takes bookings, and provides support 24/7. Experience seamless communication.
                  </p>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.4 }}
                 className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5"
               >
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Lead Capture</h4>
                    <p className="opacity-50 font-light leading-relaxed">Secure and qualify potential inquiries around the clock without manual overhead.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Multilingual Support</h4>
                    <p className="opacity-50 font-light leading-relaxed">Engage a global audience with fluent agentic speech in multiple dialects.</p>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Phi Docs Section */}
      <section className="py-32 lg:py-48 bg-black overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 space-y-12">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="space-y-4"
               >
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
                     <FileText className="w-3 h-3" /> Document Synthesis Engine
                  </div>
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                    Knowledge<br />
                    <span className="opacity-20 italic">Extracted.</span>
                  </h2>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="max-w-2xl"
               >
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-snug tracking-tight text-white/80">
                    Intelligent processing for Word, Excel, and PowerPoint. We transform static data into dynamic organizational assets.
                  </p>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.4 }}
                 className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5"
               >
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Autonomous Summaries</h4>
                    <p className="opacity-50 font-light leading-relaxed">Instantly distill thousands of pages into actionable high-level reports.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Cross-Platform Logic</h4>
                    <p className="opacity-50 font-light leading-relaxed">Unified AI analysis across the entire Microsoft Office ecosystem.</p>
                  </div>
               </motion.div>
            </div>

            <div className="lg:col-span-5 relative group">
               <div className="absolute -inset-1 bg-gradient-to-tr from-white/10 to-transparent rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-1000" />
               <div className="relative aspect-square rounded-[3rem] border border-white/10 overflow-hidden bg-white/[0.01] flex items-center justify-center p-8 sm:p-12">
                  <img 
                    src={phiDocsImage}
                    className="w-full h-full object-contain grayscale opacity-50 transition-all duration-1000 hover:grayscale-0 hover:opacity-100"
                    alt="Document Synthesis Engine"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-1000 pointer-events-none" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Digital Marketing Section - NEW */}
      <section className="py-32 lg:py-48 overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Visual: Grayscale Network Image - Fixed Visibility */}
            <div className="lg:col-span-5 relative group">
               <div className="absolute -inset-1 bg-gradient-to-tr from-white/10 to-transparent rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-1000" />
               <div className="relative aspect-square rounded-[3rem] border border-white/10 overflow-hidden bg-white/[0.01] flex items-center justify-center p-8">
                  <img 
                    src="https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=1000" 
                    className="w-full h-full object-contain grayscale opacity-50 transition-all duration-1000 hover:grayscale-0 hover:opacity-100"
                    alt="Digital Marketing Intelligence"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-1000 pointer-events-none" />
               </div>
            </div>

            {/* Content: Manifesto Style */}
            <div className="lg:col-span-7 space-y-12">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="space-y-4"
               >
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
                     <Share2 className="w-3 h-3" /> Growth & Presence Engine
                  </div>
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                    Visibility.<br />
                    <span className="opacity-20 italic">Amplified.</span>
                  </h2>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="max-w-2xl"
               >
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-snug tracking-tight text-white/80">
                    Effortlessly manage your content ecosystem. We optimize your digital reach and ensure your brand runs flawlessly across all frontiers.
                  </p>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.4 }}
                 className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5"
               >
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Smart Scheduling</h4>
                    <p className="opacity-50 font-light leading-relaxed">Automated deployment across LinkedIn, Facebook, and Twitter for maximum impact.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Reach Optimization</h4>
                    <p className="opacity-50 font-light leading-relaxed">AI-driven timing and content analytics to save time and optimize engagement.</p>
                  </div>
               </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Industrial Intelligence Section - Text Left, Animation Right */}
      <section className="py-32 lg:py-48 border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Content: Text on the LEFT */}
            <div className="lg:col-span-7 space-y-12 order-2 lg:order-1">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="space-y-4"
               >
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-[0.3em] uppercase opacity-40">
                     <Database className="w-3 h-3" /> Operational Excellence
                  </div>
                  <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                    Autonomous<br />
                    <span className="opacity-20 italic">Logistics.</span>
                  </h2>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="max-w-2xl"
               >
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-snug tracking-tight text-white/80">
                    We automate warehouses and production lines with AI that prevents downtime and optimizes fulfillment in real-time.
                  </p>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.4 }}
                 className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5"
               >
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Warehouse Automation</h4>
                    <p className="opacity-50 font-light leading-relaxed">Full-stack autonomous stock tracking and fulfillment routing.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-30">Precision Control</h4>
                    <p className="opacity-50 font-light leading-relaxed">Real-time production line monitoring with predictive maintenance.</p>
                  </div>
               </motion.div>
            </div>

            {/* Visual: Animation on the RIGHT */}
            <div className="lg:col-span-5 relative h-[400px] lg:h-[600px] w-full overflow-hidden rounded-[3rem] border border-white/10 bg-black group order-1 lg:order-2">
               <RobotArmAnimation scale={2.8} />
               <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:opacity-0 transition-opacity duration-700" />
            </div>

          </div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="py-48 lg:py-64 text-center text-white border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <h3 className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter uppercase">START YOUR JOURNEY</h3>
          <p className="text-2xl md:text-3xl opacity-60 font-light leading-relaxed max-w-3xl mx-auto">
            Experience the future of industrial intelligence today. Our team is ready to scale your vision.
          </p>
          <div className="pt-8">
             <Link href="/company/contact">
               <Button className="pill-button bg-white text-black px-16 py-10 text-2xl font-bold hover:scale-105 transition-all duration-500 shadow-2xl">
                 Book Consultation
               </Button>
             </Link>
          </div>
        </div>
      </section>

    </div>
  );
}