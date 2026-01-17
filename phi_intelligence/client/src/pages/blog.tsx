import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ArrowRight, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion } from "framer-motion";
import NeuralNetworkAnimation from "@/components/three/NeuralNetworkAnimation";

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
      if (!res.ok) {
        throw new Error(`Failed to fetch articles: ${res.statusText}`);
      }
      return res.json();
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await refetch(); await fetch(`${apiUrl}/api/news/fetch`, { method: 'POST' }); }
    finally { setIsRefreshing(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-bold tracking-tighter"
            >
              INSIGHTS<br />
              <span className="opacity-20 uppercase">Network.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl opacity-40 max-w-lg font-light leading-relaxed">
              Real-time intelligence from the frontier of Artificial Intelligence and Machine Learning.
            </p>
          </div>
          <div className="h-[400px] lg:h-[500px] rounded-[3rem] bg-white/[0.02] border border-white/5 overflow-hidden relative">
             <div className="absolute inset-0 grayscale opacity-40">
                <NeuralNetworkAnimation />
             </div>
             <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 border-b border-white/5 pb-12 mb-16">
          {['all', 'AI', 'ML', 'DL', 'Research', 'Industry'].map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full border transition-all duration-300 text-xs font-bold tracking-widest uppercase ${
                selectedCategory === cat ? "bg-white text-black border-white" : "border-white/10 opacity-40 hover:opacity-100"
              }`}
            >
              {cat}
            </button>
          ))}
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="ghost" className="ml-auto opacity-40 hover:opacity-100 uppercase text-xs tracking-widest">
            <RefreshCw className={`w-3 h-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white/5 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="p-20 rounded-[3rem] border border-red-500/20 text-center space-y-6">
            <p className="text-red-400 text-xl">Error loading articles: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline" className="pill-button border-white/10">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {newsArticles.map((article) => (
              <div 
                key={article.id} 
                className="group cursor-pointer space-y-6"
                onClick={() => window.open(article.url, '_blank')}
              >
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02]">
                   <img 
                     src={article.imageUrl || "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000"} 
                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-110"
                     alt={article.title}
                   />
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-1000" />
                   <div className="absolute top-6 left-6">
                      <Badge className="bg-white text-black uppercase text-[10px] tracking-widest px-3 py-1 font-bold rounded-full">
                        {article.sourceName || 'Research'}
                      </Badge>
                   </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight leading-tight line-clamp-2 group-hover:text-white/70 transition-colors">
                    {article.title}
                  </h3>
                  <p className="opacity-40 font-light line-clamp-3 text-sm leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] tracking-[0.2em] font-bold uppercase opacity-30">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime || '5 MIN'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
