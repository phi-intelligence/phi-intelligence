import { useQuery } from "@tanstack/react-query";
import { ArrowRight, RefreshCw, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Job } from "@shared/schema";
import { useState } from "react";
import { motion } from "framer-motion";
import NeuralNetworkAnimation from "@/components/three/NeuralNetworkAnimation";

export default function Careers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const { data: jobs, isLoading, refetch } = useQuery<Job[]>({
    queryKey: [`${apiUrl}/api/jobs`],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/jobs`);
      return res.json();
    },
    placeholderData: [],
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const safeJobs = jobs || [];
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await refetch(); } finally { setIsRefreshing(false); }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white pb-20">
      {/* Hero */}
      <section className="relative mb-20 min-h-[80vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-35 pointer-events-none">
          <NeuralNetworkAnimation />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_65%)]" />
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Careers</p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
              Join Phi<br />
              <span className="text-phi-blue">Intelligence.</span>
            </h1>
            <p className="text-base sm:text-lg text-white/40 font-light leading-relaxed max-w-xl">
              We're building AI solutions that transform how businesses operate. Join us in Nottingham or remotely to shape the future of AI integration.
            </p>
            <div className="pt-2">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm shadow-[0_0_40px_rgba(0,163,255,0.2)]" onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Roles <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 relative z-10">

        {/* Positions */}
        <section id="open-positions" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">Open Positions</h2>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="ghost" className="text-white/40 hover:text-white/80 flex items-center gap-2 text-xs tracking-widest uppercase">
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-5">
              {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          ) : safeJobs.length > 0 ? (
            <div className="grid gap-5">
              {safeJobs.map((job) => (
                <div key={job.id} className="group p-6 md:p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full px-3 py-1 border-white/10 text-[10px] font-bold tracking-widest uppercase text-white/40">{job.type}</Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1 border-white/10 text-[10px] font-bold tracking-widest uppercase text-white/40">{job.location}</Badge>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{job.title}</h3>
                      <p className="text-base text-white/40 font-light max-w-2xl">{job.description}</p>
                    </div>
                    <div className="flex items-center">
                      <Link href={`/careers/apply/${job.id}`}>
                        <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm font-bold group-hover:scale-105 transition-transform">
                          Apply <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 rounded-2xl border border-dashed border-white/10 text-center space-y-4">
              <Briefcase className="w-10 h-10 mx-auto text-white/15" />
              <p className="text-lg text-white/40 font-light">No active positions found.</p>
              <Link href="/company/contact">
                <Button variant="outline" className="pill-button border-white/10 text-sm">General Inquiry</Button>
              </Link>
            </div>
          )}
        </section>

        {/* Process */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: "01", title: "Review", desc: "Our team analyses your background and alignment with the Phi Intelligence mission." },
            { step: "02", title: "Sync", desc: "A technical deep dive followed by a cultural alignment conversation." },
            { step: "03", title: "Onboard", desc: "Finalise terms and start your journey at the frontier of AI." },
          ].map(p => (
            <div key={p.step} className="space-y-4">
              <span className="text-4xl font-bold text-phi-blue/15">{p.step}</span>
              <h4 className="text-xl font-bold tracking-tight">{p.title}</h4>
              <p className="text-white/40 font-light leading-relaxed text-sm">{p.desc}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
