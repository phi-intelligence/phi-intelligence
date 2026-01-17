import { Link } from "wouter";
import { TrendingUp, BarChart3, ArrowRight, Database, PieChart, Target, Zap, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function DataSciencePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold tracking-[0.2em] uppercase opacity-40">
              Information Synthesis
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-bold tracking-tighter leading-none"
            >
              DATA<br />
              <span className="opacity-20 uppercase">Science.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl opacity-40 max-w-lg font-light leading-relaxed">
              Unlock the hidden potential of your organizational data with predictive models and deep-learning analytics.
            </p>
            <div className="pt-4">
               <Link href="/company/contact">
                 <Button className="pill-button bg-white text-black px-10">Request Data Audit</Button>
               </Link>
            </div>
          </div>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.02]">
             <img 
               src="/assets/dash-ezgif.com-crop.gif" 
               className="w-full h-full object-cover grayscale opacity-40 transition-opacity group-hover:opacity-100" 
               alt="Data Science" 
             />
             <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-48">
           <div className="p-12 rounded-[3rem] border border-white/5 bg-white/[0.02] space-y-6">
              <PieChart className="w-10 h-10 opacity-30" />
              <h3 className="text-3xl font-bold tracking-tight">BI WITH AI</h3>
              <p className="opacity-40 font-light leading-relaxed text-lg">
                Automated pattern recognition and predictive reporting dashboards that evolve with your market trends.
              </p>
              <img src="/assets/original-76a5db36a0639511b2d78de8036ef45a.gif" className="w-full h-48 object-cover rounded-2xl grayscale opacity-30 mt-6" />
           </div>

           <div className="p-12 rounded-[3rem] border border-white/5 bg-white/[0.02] space-y-6">
              <BarChart3 className="w-10 h-10 opacity-30" />
              <h3 className="text-3xl font-bold tracking-tight">CUSTOM ANALYTICS</h3>
              <p className="opacity-40 font-light leading-relaxed text-lg">
                Bespoke visualization tools and decision-support systems tailored to your specific industrial KPIs.
              </p>
              <img src="/assets/das.gif" className="w-full h-48 object-cover rounded-2xl grayscale opacity-30 mt-6" />
           </div>
        </div>

        {/* Capabilities */}
        <section className="py-24 border-t border-white/5">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center opacity-30">
              {["Forecasting", "Segmentation", "Optimization", "NLP Analysis"].map(s => (
                <div key={s} className="space-y-4">
                   <div className="text-4xl font-bold tracking-tighter uppercase">{s}</div>
                   <div className="h-0.5 w-12 bg-white mx-auto" />
                </div>
              ))}
           </div>
        </section>

      </div>
    </div>
  );
}