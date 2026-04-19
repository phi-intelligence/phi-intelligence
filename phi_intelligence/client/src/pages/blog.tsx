import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion } from "framer-motion";
import AdvancedNetworkAnimation from "@/components/three/AdvancedNetworkAnimation";

interface NewsArticle {
  id: string; title: string; url: string; excerpt: string; author: string;
  publishedAt: Date | string; category: string; tags: string[]; imageUrl?: string;
  readTime: string; isFeatured: boolean; sourceName?: string;
}

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const { data: newsArticles = [], isLoading, error, refetch } = useQuery<NewsArticle[]>({
    queryKey: [`${apiUrl}/api/news`, selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === 'all' ? `${apiUrl}/api/news` : `${apiUrl}/api/news?category=${selectedCategory}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch articles: ${res.statusText}`);
      return res.json();
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await refetch(); await fetch(`${apiUrl}/api/news/fetch`, { method: 'POST' }); }
    finally { setIsRefreshing(false); }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white pt-32 pb-20">
      {/* Hero background */}
      <div className="absolute inset-0 top-0 h-[50vh] opacity-20 pointer-events-none overflow-hidden">
        <AdvancedNetworkAnimation />
      </div>
      <div className="container mx-auto max-w-7xl px-6 relative z-10">

        {/* Hero */}
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">News & Research</p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Insights<br />
              <span className="text-phi-blue">Network.</span>
            </h1>
            <p className="text-lg text-white/40 font-light leading-relaxed">
              The latest from the frontier of Artificial Intelligence and Machine Learning.
            </p>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 border-b border-white/5 pb-8 mb-12">
          {['all', 'AI', 'ML', 'DL', 'Research', 'Industry'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full border transition-all duration-300 text-xs font-bold tracking-widest uppercase ${
                selectedCategory === cat ? "bg-phi-blue text-white border-phi-blue" : "border-white/10 text-white/40 hover:text-white/80 hover:border-phi-blue/30"
              }`}
            >
              {cat}
            </button>
          ))}
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="ghost" className="ml-auto text-white/40 hover:text-white/80 uppercase text-xs tracking-widest">
            <RefreshCw className={`w-3 h-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="p-16 rounded-2xl border border-red-500/20 text-center space-y-4">
            <p className="text-red-400">Error loading articles: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline" className="pill-button border-white/10">
              Retry
            </Button>
          </div>
        ) : newsArticles.length === 0 ? (
          <div className="p-16 rounded-2xl border border-dashed border-white/10 text-center space-y-4">
            <p className="text-white/40 font-light text-lg">No articles found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {newsArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer space-y-5"
                onClick={() => window.open(article.url, '_blank')}
              >
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
                  <img
                    src={article.imageUrl || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000"}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                    alt={article.title}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-700" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-phi-blue text-white uppercase text-[10px] tracking-widest px-3 py-1 font-bold rounded-full">
                      {article.sourceName || 'Research'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold tracking-tight leading-snug line-clamp-2 group-hover:text-white/70 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-white/40 font-light line-clamp-2 text-sm leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] tracking-[0.15em] font-bold uppercase text-white/25">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime || '5 MIN'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
