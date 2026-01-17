import { Brain, Cpu, Code, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import ParticleWavesAnimation from "@/components/three/ParticleWavesAnimation";

export default function Services() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-20">
      
      {/* Services Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] flex items-center border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParticleWavesAnimation />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter"
          >
            SERVICES
          </motion.h1>
          <p className="text-lg sm:text-xl md:text-2xl opacity-40 max-w-2xl mx-auto mt-6 font-light">
            Engineered intelligence for the industrial frontier.
          </p>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 lg:py-24 space-y-32 lg:space-y-48">
        <div className="container mx-auto px-6">
          
          {/* AI & ML */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-2 lg:mb-4">
                <Brain className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase">AI & MACHINE LEARNING</h2>
              <p className="text-lg md:text-xl opacity-60 leading-relaxed font-light">
                Production-ready AI that streamlines operations and scales with confidence.
              </p>
              <div className="flex flex-col gap-2 lg:gap-4 pt-4 text-left">
                {["Custom Voice Bots", "Conversational AI", "Agentic Operations"].map(s => (
                  <div key={s} className="flex items-center gap-3 py-3 lg:py-4 border-b border-white/5 opacity-80">
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <span className="text-sm lg:text-base">{s}</span>
                  </div>
                ))}
              </div>
              <div className="pt-6 lg:pt-8 flex justify-center lg:justify-start">
                <Link href="/services/ai-ml">
                  <Button className="pill-button bg-white text-black px-10">Explore AI/ML</Button>
                </Link>
              </div>
            </div>
            <div className="aspect-video bg-white/5 rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/10 p-1 order-1 lg:order-2">
              <img 
                src="/assets/ai.gif" 
                className="w-full h-full object-cover rounded-[1.8rem] lg:rounded-[2.8rem] grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000" 
                alt="AI Machine Learning"
              />
            </div>
          </div>

          {/* IoT & Industrial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="aspect-video bg-white/5 rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/10 p-1">
              <img 
                src="/assets/iothme.gif" 
                className="w-full h-full object-contain rounded-[1.8rem] lg:rounded-[2.8rem] grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000" 
                alt="IoT Industrial"
              />
            </div>
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-2 lg:mb-4">
                <Cpu className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase">Industrial IoT</h2>
              <p className="text-lg md:text-xl opacity-60 leading-relaxed font-light">
                Connect and automate environments with AI-driven IoT solutions.
              </p>
              <div className="flex flex-col gap-2 lg:gap-4 pt-4 text-left">
                {["Smart Facility Automation", "Real-Time Monitoring", "IoT Data Dashboards"].map(s => (
                  <div key={s} className="flex items-center gap-3 py-3 lg:py-4 border-b border-white/5 opacity-80">
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <span className="text-sm lg:text-base">{s}</span>
                  </div>
                ))}
              </div>
              <div className="pt-6 lg:pt-8 flex justify-center lg:justify-start">
                <Link href="/services/iot">
                  <Button className="pill-button bg-white text-black px-10">Explore IoT</Button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 lg:py-48 bg-white text-black text-center px-6">
        <h2 className="text-4xl sm:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 uppercase">Ready to Transform?</h2>
        <div className="flex justify-center">
          <Link href="/company/contact">
            <Button className="pill-button bg-black text-white px-12 py-8 text-xl lg:text-2xl font-bold">Get in touch</Button>
          </Link>
        </div>
      </section>

    </div>
  );
}