import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, ArrowRight, RefreshCw, Briefcase, UserCheck, Code, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Job } from "@shared/schema";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Careers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  const { data: jobs, isLoading, error, refetch } = useQuery<Job[]>({
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
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Hero Section */}
        <div className="mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-bold tracking-tighter"
          >
            JOIN THE<br />
            <span className="opacity-20 uppercase">Mission.</span>
          </motion.h1>
          <p className="text-xl md:text-2xl opacity-40 max-w-3xl mt-8 font-light leading-relaxed">
            We're building the industrial intelligence layer of the future. Join us in Nottingham or remotely to redefine what's possible with PhiAI.
          </p>
          <div className="flex gap-4 mt-12">
            <Button className="pill-button bg-white text-black px-10" onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}>
               Explore Roles
            </Button>
          </div>
        </div>

        {/* Positions Grid */}
        <section id="open-positions" className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
            <h2 className="text-5xl font-bold tracking-tight">OPEN POSITIONS</h2>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="ghost" className="opacity-40 hover:opacity-100 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              REFRESH
            </Button>
          </div>

          {isLoading ? (
             <div className="grid gap-6">
               {[1, 2].map(i => <div key={i} className="h-48 rounded-[2rem] bg-white/5 animate-pulse" />)}
             </div>
          ) : safeJobs.length > 0 ? (
            <div className="grid gap-6">
              {safeJobs.map((job) => (
                <div key={job.id} className="group p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                         <Badge variant="outline" className="rounded-full px-4 py-1 border-white/10 text-xs font-bold tracking-widest uppercase opacity-40">{job.type}</Badge>
                         <Badge variant="outline" className="rounded-full px-4 py-1 border-white/10 text-xs font-bold tracking-widest uppercase opacity-40">{job.location}</Badge>
                      </div>
                      <h3 className="text-4xl font-bold tracking-tight">{job.title}</h3>
                      <p className="text-xl opacity-50 font-light max-w-2xl">{job.description}</p>
                    </div>
                    <div className="flex items-center">
                      <Link href={`/careers/apply/${job.id}`}>
                        <Button className="pill-button bg-white text-black px-12 py-8 text-lg font-bold group-hover:scale-105 transition-transform">
                          Apply Role <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 rounded-[3rem] border border-dashed border-white/10 text-center space-y-6">
               <Briefcase className="w-12 h-12 mx-auto opacity-20" />
               <p className="text-2xl opacity-40 font-light">No active positions found.</p>
               <Link href="/company/contact">
                  <Button variant="outline" className="pill-button border-white/10">General Inquiry</Button>
               </Link>
            </div>
          )}
        </section>

        {/* Process */}
        <section className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Review", desc: "Our team analyzes your background and alignment with Phi mission." },
            { step: "02", title: "Sync", desc: "A technical deep dive followed by a cultural alignment conversation." },
            { step: "03", title: "Onboard", desc: "Finalize terms and start your journey at the frontier of AI." }
          ].map(p => (
            <div key={p.step} className="space-y-6">
              <span className="text-5xl font-bold opacity-10">{p.step}</span>
              <h4 className="text-2xl font-bold tracking-tight">{p.title}</h4>
              <p className="opacity-40 font-light leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}