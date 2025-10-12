import { InsertNewsSource } from '../../shared/schema';

export const NEWS_SOURCES: InsertNewsSource[] = [
  // DEDICATED AI/ML/DL RESEARCH INSTITUTIONS
  {
    name: "BAIR (Berkeley AI Research)",
    type: "academic",
    url: "https://bair.berkeley.edu/blog",
    rssUrl: "https://bair.berkeley.edu/blog/feed.xml",
    priority: 1
  },
  {
    name: "MIT News - AI",
    type: "academic",
    url: "https://news.mit.edu/topic/artificial-intelligence2",
    rssUrl: "https://news.mit.edu/rss/topic/artificial-intelligence2",
    priority: 1
  },
  {
    name: "Nature Machine Intelligence",
    type: "academic",
    url: "https://www.nature.com/natmachintell",
    rssUrl: "https://www.nature.com/natmachintell.rss",
    priority: 1
  },

  // ARXIV PREPRINTS (AI/ML/DL ONLY)
  {
    name: "arXiv - Artificial Intelligence",
    type: "academic",
    url: "https://arxiv.org/list/cs.AI/recent",
    rssUrl: "https://rss.arxiv.org/rss/cs.AI",
    priority: 1
  },
  {
    name: "arXiv - Machine Learning", 
    type: "academic",
    url: "https://arxiv.org/list/cs.LG/recent",
    rssUrl: "https://rss.arxiv.org/rss/cs.LG",
    priority: 1
  },
  {
    name: "arXiv - Statistical Machine Learning",
    type: "academic", 
    url: "https://arxiv.org/list/stat.ML/recent",
    rssUrl: "https://rss.arxiv.org/rss/stat.ML",
    priority: 1
  },

  // DEDICATED AI NEWS SOURCES
  {
    name: "AI News (TechForge)",
    type: "tech_news",
    url: "https://www.artificialintelligence-news.com",
    rssUrl: "https://www.artificialintelligence-news.com/feed/",
    priority: 1
  },
  {
    name: "MarkTechPost",
    type: "tech_news",
    url: "https://www.marktechpost.com",
    rssUrl: "https://www.marktechpost.com/feed",
    priority: 1
  },
  {
    name: "VentureBeat AI",
    type: "tech_news",
    url: "https://venturebeat.com/category/ai/",
    rssUrl: "https://venturebeat.com/category/ai/feed/",
    priority: 1
  },

  // AI-FOCUSED BLOGS
  {
    name: "Hugging Face Blog",
    type: "tech_news",
    url: "https://huggingface.co/blog",
    rssUrl: "https://huggingface.co/blog/feed.xml",
    priority: 1
  },
  {
    name: "Towards Data Science - AI",
    type: "tech_news",
    url: "https://towardsdatascience.com/tagged/artificial-intelligence",
    rssUrl: "https://towardsdatascience.com/tagged/artificial-intelligence/feed",
    priority: 1
  },
  {
    name: "Analytics Vidhya - AI",
    type: "tech_news",
    url: "https://www.analyticsvidhya.com/blog/tag/artificial-intelligence/",
    rssUrl: "https://www.analyticsvidhya.com/blog/tag/artificial-intelligence/feed/",
    priority: 1
  }
];

export const SOURCE_CATEGORIES = {
  RESEARCH: "research",
  ACADEMIC: "academic", 
  TECH_NEWS: "tech_news",
  INDUSTRY: "industry"
} as const;

export const ARTICLE_CATEGORIES = {
  AI: "AI",
  ML: "ML", 
  DL: "DL",
  RESEARCH: "Research",
  ACADEMIC: "Academic",
  INDUSTRY: "Industry"
} as const;

export const CATEGORY_DESCRIPTIONS = {
  [ARTICLE_CATEGORIES.AI]: "General Artificial Intelligence news and developments",
  [ARTICLE_CATEGORIES.ML]: "Machine Learning algorithms, models, and applications", 
  [ARTICLE_CATEGORIES.DL]: "Deep Learning, neural networks, and advanced AI models",
  [ARTICLE_CATEGORIES.RESEARCH]: "Research papers, studies, and academic breakthroughs",
  [ARTICLE_CATEGORIES.ACADEMIC]: "University research, conferences, and scholarly work",
  [ARTICLE_CATEGORIES.INDUSTRY]: "Business applications, startups, and market trends"
} as const;

// Priority levels for scheduling
export const PRIORITY_LEVELS = {
  HIGH: 1,    // Fetch every 3 hours (all priorities use same interval)
  MEDIUM: 2,  // Fetch every 3 hours (all priorities use same interval)  
  LOW: 3      // Fetch every 3 hours (all priorities use same interval)
} as const;

export default NEWS_SOURCES;
