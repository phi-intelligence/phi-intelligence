import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ArrowRight, User, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";
import { useState, useMemo } from "react";
import ANNAnimation from "@/components/three/ANNAnimation";

// News article type (matching the backend schema)
interface NewsArticle {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  content?: string;
  author: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  imageUrl?: string;
  readTime: string;
  isFeatured: boolean;
  sourceName?: string;
}

export default function Blog() {
  // State for filtering
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'AI' | 'ML' | 'DL' | 'Research' | 'Academic' | 'Industry'>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'research' | 'academic' | 'tech_news' | 'industry'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Utility function to check if image URL is valid
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Function to get placeholder content for missing images
  const getImagePlaceholder = (article: NewsArticle, isFeatured: boolean = false) => {
    const size = isFeatured ? 'lg' : 'sm';
    const iconSize = isFeatured ? 'h-12 w-12' : 'h-8 w-8';
    const textSize = isFeatured ? 'text-sm' : 'text-xs';
    const padding = isFeatured ? 'p-6' : 'p-4';
    
    return (
      <div className={`aspect-video bg-gradient-to-br from-phi-gray to-phi-black flex items-center justify-center ${padding} relative`}>
        {/* Small indicator that this is a placeholder */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="border-phi-white text-phi-white text-xs px-2 py-1 opacity-60">
            No Image
          </Badge>
        </div>
        
        <div className="text-center">
          <div className={`mb-${size === 'lg' ? '4' : '3'}`}>
            <Badge variant="secondary" className={`bg-phi-light text-phi-black ${size === 'lg' ? 'text-lg px-4 py-2' : 'text-sm px-3 py-1'} mb-${size === 'lg' ? '3' : '2'}`}>
              {safeText(article.sourceName) || 'AI Research'}
            </Badge>
          </div>
          {article.category && (
            <Badge variant="outline" className={`border-phi-white text-phi-white ${size === 'lg' ? 'text-lg px-4 py-2' : 'text-sm px-3 py-1'} mb-${size === 'lg' ? '3' : '2'}`}>
              {safeText(article.category)}
            </Badge>
          )}
          <div className={`mt-${size === 'lg' ? '4' : '3'}`}>
            <User className={`${iconSize} text-phi-white opacity-40 mx-auto mb-${size === 'lg' ? '2' : '1'}`} />
            <p className={`${textSize} text-phi-white opacity-60 font-medium`}>
              {isFeatured ? 'Featured Research' : 'Research Article'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Use full API URL instead of relative path (consistent with chatbot)
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  // Fetch news articles
  const { data: newsArticles = [], isLoading, refetch } = useQuery<NewsArticle[]>({
    queryKey: [`${apiUrl}/api/news`, selectedCategory, selectedSource],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedSource !== 'all') params.append('source', selectedSource);
      
      const response = await fetch(`${apiUrl}/api/news?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    }
  });

  // Fetch featured news articles
  const { data: featuredNews = [] } = useQuery<NewsArticle[]>({
    queryKey: [`${apiUrl}/api/news/featured`],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/news/featured`);
      if (!response.ok) throw new Error('Failed to fetch featured news');
      return response.json();
    }
  });

  // Fallback to original blog posts if no news available
  const { data: originalPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    enabled: newsArticles.length === 0 && !isLoading
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Date not available';
    
    const articleDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - articleDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If article is from today, show "Today"
    if (diffDays === 0) {
      return 'Today';
    }
    // If article is from yesterday, show "Yesterday"
    else if (diffDays === 1) {
      return 'Yesterday';
    }
    // If article is within a week, show "X days ago"
    else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    // If article is within a month, show "X weeks ago"
    else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    // Otherwise show the full date
    else {
      return articleDate.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Utility function to safely render text content
  const safeText = (text: any): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    if (typeof text === 'number') return text.toString();
    if (Array.isArray(text)) return text.join(', ');
    if (typeof text === 'object') {
      // Handle RSS parser objects that might have _ or $ properties
      if (text._) return text._;
      if (text.$) return JSON.stringify(text.$);
      return JSON.stringify(text);
    }
    return String(text);
  };

  // Utility function to safely render excerpt
  const safeExcerpt = (excerpt: any): string => {
    const text = safeText(excerpt);
    // Limit excerpt length and clean up any HTML
    return text.replace(/<[^>]*>/g, '').substring(0, 150) + (text.length > 150 ? '...' : '');
  };

  // Utility function to safely render tags
  const safeTags = (tags: any): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) {
      return tags.map(tag => safeText(tag)).filter(tag => tag.length > 0);
    }
    return [safeText(tags)].filter(tag => tag.length > 0);
  };

  // Helper functions to safely access article properties
  const getArticleIsFeatured = (article: NewsArticle | BlogPost): boolean => {
    if ('isFeatured' in article) {
      return article.isFeatured;
    }
    if ('featured' in article) {
      return article.featured || false;
    }
    return false;
  };

  const getArticleUrl = (article: NewsArticle | BlogPost): string | undefined => {
    if ('url' in article) {
      return article.url;
    }
    return undefined;
  };

  const getArticleImageUrl = (article: NewsArticle | BlogPost): string | undefined => {
    if ('imageUrl' in article) {
      return article.imageUrl;
    }
    return undefined;
  };

  const getArticleCategory = (article: NewsArticle | BlogPost): string | undefined => {
    if ('category' in article) {
      return article.category;
    }
    return undefined;
  };

  const getArticleSourceName = (article: NewsArticle | BlogPost): string | undefined => {
    if ('sourceName' in article) {
      return article.sourceName;
    }
    return undefined;
  };

  // Determine what to display
  const articles = newsArticles.length > 0 ? newsArticles : originalPosts;
  const regularArticles = articles.filter(article => !getArticleIsFeatured(article));

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      // Trigger news fetch on backend
      await fetch(`${apiUrl}/api/news/fetch`, { method: 'POST' });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section
        id="blog-hero"
        className="relative h-screen flex items-center justify-center overflow-hidden bg-black hero-with-animation"
        data-testid="blog-hero"
      >
        {/* ANN Animation Background */}
        <div className="absolute inset-0 z-0">
          <ANNAnimation 
            className="w-full h-full"
            enableInteraction={true}
          />
        </div>
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10"></div>
        
        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="hero-title text-5xl md:text-7xl font-light mb-4 glow-text text-white">
            AI/ML/DL News & Insights
          </h1>
          <p className="text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto opacity-90 text-white">
            Stay updated with the latest developments in Artificial Intelligence, 
            Machine Learning, and Deep Learning from leading tech publications and research institutions.
          </p>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 px-6 border-b border-phi-gray">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { key: 'all', label: 'All Topics' },
              { key: 'AI', label: 'Artificial Intelligence' },
              { key: 'ML', label: 'Machine Learning' },
              { key: 'DL', label: 'Deep Learning' },
              { key: 'Research', label: 'Research' },
              { key: 'Academic', label: 'Academic' },
              { key: 'Industry', label: 'Industry' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key as any)}
                className="capitalize"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="animate-pulse space-y-8">
              {/* Featured Articles Loading */}
              <div className="text-center mb-16">
                <div className="h-12 bg-phi-gray rounded-lg w-64 mx-auto mb-6"></div>
                <div className="h-6 bg-phi-gray rounded-lg w-96 mx-auto"></div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-phi-gray rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Featured Articles Grid */}
          {featuredNews.length > 0 && (
            <section className="py-24 px-6" data-testid="featured-articles">
              <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-16">
                  <h2 className="text-5xl font-bold mb-6 glow-text">Featured Research</h2>
                  <p className="text-xl opacity-80 mb-8">
                    Top AI/ML/DL breakthroughs and research highlights from leading institutions.
                  </p>
                  
                  {/* Refresh Button */}
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-phi-light text-phi-black hover:bg-phi-white transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh News'}
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredNews.slice(0, 6).map((article) => (
                    <Card 
                      key={article.id} 
                      className="glassmorphism rounded-xl overflow-hidden hover:bg-opacity-10 transition-all duration-300 group"
                      data-testid={`featured-article-${article.id}`}
                    >
                      {/* Article Image or Placeholder */}
                      <div className="relative">
                        {isValidImageUrl(article.imageUrl) ? (
                          <div className="relative">
                            <img 
                              src={article.imageUrl!} 
                              alt={article.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            {/* Small indicator that image is available */}
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-phi-light text-phi-black text-xs px-2 py-1">
                                Has Image
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="h-48">
                            {getImagePlaceholder(article, false)}
                          </div>
                        )}
                        
                        {/* Featured Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="bg-phi-light text-phi-black text-xs px-2 py-1 font-semibold">
                            FEATURED
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Article Content */}
                      <div className="p-6">
                        {/* Source and Category Badges */}
                        <div className="flex items-center gap-2 mb-3">
                          {article.category && (
                            <Badge variant="outline" className="border-phi-white text-phi-white text-xs">
                              {safeText(article.category)}
                            </Badge>
                          )}
                          {article.sourceName && (
                            <Badge variant="secondary" className="bg-phi-gray text-phi-white text-xs">
                              {safeText(article.sourceName)}
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-phi-light transition-colors">
                          {safeText(article.title)}
                        </h3>
                        
                        {article.excerpt && (
                          <p className="opacity-80 text-sm mb-4 line-clamp-3">
                            {safeExcerpt(article.excerpt)}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-xs opacity-60 space-x-3">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {safeText(article.author)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(article.publishedAt)}
                            </div>
                          </div>
                          {article.readTime && (
                            <div className="flex items-center text-xs opacity-60">
                              <Clock className="h-3 w-3 mr-1" />
                              {safeText(article.readTime)}
                            </div>
                          )}
                        </div>

                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {safeTags(article.tags).slice(0, 2).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="secondary" 
                                className="bg-phi-gray text-phi-white text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button 
                          variant="ghost" 
                          className="text-phi-white text-sm hover:opacity-70 p-0 h-auto bg-transparent group-hover:text-phi-light transition-all"
                          data-testid={`button-read-featured-${article.id}`}
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          Read Full Article <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Articles Grid */}
          <section className="py-24 px-6" data-testid="articles-grid">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-6 glow-text">All Articles</h2>
                <p className="text-xl opacity-80">
                  Browse the complete collection of AI/ML/DL research and insights.
                </p>
              </div>

              {regularArticles.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularArticles.map((article) => (
                    <Card 
                      key={article.id} 
                      className="glassmorphism rounded-xl overflow-hidden hover:bg-opacity-10 transition-all duration-300"
                      data-testid={`article-${article.id}`}
                    >
                      {isValidImageUrl(getArticleImageUrl(article)) ? (
                        <div className="relative">
                          <img 
                            src={getArticleImageUrl(article)!} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {/* Small indicator that image is available */}
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-phi-light text-phi-black text-xs px-2 py-1">
                              Has Image
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        getImagePlaceholder(article as NewsArticle, false)
                      )}
                      
                      <div className="p-6">
                        {/* Source and Category Badges */}
                        <div className="flex items-center gap-2 mb-3">
                          {getArticleCategory(article) && (
                            <Badge variant="outline" className="border-phi-white text-phi-white text-xs">
                              {safeText(getArticleCategory(article))}
                            </Badge>
                          )}
                          {getArticleSourceName(article) && (
                            <Badge variant="secondary" className="bg-phi-gray text-phi-white text-xs">
                              {safeText(getArticleSourceName(article))}
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-bold mb-3 line-clamp-2">
                          {safeText(article.title)}
                        </h3>
                        <p className="opacity-80 text-sm mb-4 line-clamp-3">
                          {safeExcerpt(article.excerpt)}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-xs opacity-60 space-x-3">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {safeText(article.author)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(article.publishedAt)}
                            </div>
                          </div>
                          {article.readTime && (
                            <div className="flex items-center text-xs opacity-60">
                              <Clock className="h-3 w-3 mr-1" />
                              {safeText(article.readTime)}
                            </div>
                          )}
                        </div>

                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {safeTags(article.tags).slice(0, 3).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="secondary" 
                                className="bg-phi-gray text-phi-white text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button 
                          variant="ghost" 
                          className="text-phi-white text-sm hover:opacity-70 p-0 h-auto bg-transparent"
                          data-testid={`button-read-more-${article.id}`}
                          onClick={() => {
                            const url = getArticleUrl(article);
                            if (url) {
                              window.open(url, '_blank');
                            } else {
                              console.log('Article has no external URL:', article.title);
                            }
                          }}
                        >
                          Read Full Article <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glassmorphism p-12 rounded-xl text-center">
                  <h3 className="text-2xl font-bold mb-4">No Articles Available</h3>
                  <p className="opacity-80">
                    We're fetching the latest AI/ML/DL news and research. Check back soon for updates.
                  </p>
                  <Button 
                    onClick={handleRefresh}
                    className="mt-4 bg-phi-light text-phi-black hover:bg-phi-white transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh News
                  </Button>
                </Card>
              )}
            </div>
          </section>
        </>
      )}


      {/* CTA Section */}
      <section className="py-24 px-6" data-testid="blog-cta">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 glow-text">
            Ready to Get Started?
          </h2>
          <p className="text-xl opacity-80 mb-12">
            Contact our team to discuss how our AI solutions can transform your business operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/company/contact">
              <Button
                className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg"
                data-testid="button-get-in-touch"
              >
                Get In Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button 
                variant="outline" 
                className="border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                data-testid="button-explore-services"
              >
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
