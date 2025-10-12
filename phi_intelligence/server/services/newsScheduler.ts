import * as cron from 'node-cron';
import RSSAggregatorService, { RawNewsArticle } from './rssAggregator';
import { NewsSource, NewsArticle, InsertNewsArticle } from '../../shared/schema';
import NEWS_SOURCES, { PRIORITY_LEVELS } from '../config/newsSources';

export class NewsSchedulerService {
  private rssAggregator: RSSAggregatorService;
  private storage: any; // Will be injected
  private isRunning: boolean = false;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private isFetching: boolean = false; // Prevent overlapping fetches

  constructor(storage: any) {
    this.rssAggregator = new RSSAggregatorService();
    this.storage = storage;
  }

  /**
   * Initialize the news scheduler with all configured sources
   */
  async initialize(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ News Scheduler is already running, skipping initialization');
      return;
    }
    
    console.log('🚀 Initializing News Scheduler...');
    
    try {
      // Initialize news sources in database
      await this.initializeNewsSources();
      
      // Start scheduler
      this.startScheduler();
      
      console.log('✅ News Scheduler initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing News Scheduler:', error);
      throw error;
    }
  }

  /**
   * Initialize news sources in database if they don't exist
   */
  private async initializeNewsSources(): Promise<void> {
    console.log('📝 Initializing news sources...');
    
    for (const sourceConfig of NEWS_SOURCES) {
      try {
        // Check if source already exists
        const existingSource = await this.storage.getNewsSourceByUrl(sourceConfig.url);
        
        if (!existingSource) {
          await this.storage.createNewsSource(sourceConfig);
          console.log(`✅ Added news source: ${sourceConfig.name}`);
        } else {
          console.log(`ℹ️ News source already exists: ${sourceConfig.name}`);
        }
      } catch (error) {
        console.error(`❌ Error initializing source ${sourceConfig.name}:`, error);
      }
    }
  }

  /**
   * Start the cron scheduler for different priority levels
   */
  private startScheduler(): void {
    if (this.isRunning) {
      console.log('⚠️ News Scheduler is already running');
      return;
    }

    console.log('🔒 Setting isRunning flag to true');
    this.isRunning = true;

    // All sources - every 3 hours (as requested)
    // Use a single cron job for all priorities to avoid conflicts
    this.schedulePriorityFetch('ALL', '0 */3 * * *');

    // Initial fetch immediately
    this.fetchAllNews();

    this.isRunning = true;
    console.log('⏰ News Scheduler started - fetching every 3 hours');
  }

  /**
   * Schedule fetching for a specific priority level
   */
  private schedulePriorityFetch(priority: string | number, cronExpression: string): void {
    const jobKey = `priority_${priority}`;
    
    const cronJob = cron.schedule(cronExpression, async () => {
      if (priority === 'ALL') {
        console.log(`🔄 Scheduled fetch for ALL sources`);
        await this.fetchAllNews();
      } else {
        console.log(`🔄 Scheduled fetch for priority ${priority} sources`);
        await this.fetchNewsByPriority(priority as number);
      }
    }, {
      // Remove invalid scheduled property
    });

    this.cronJobs.set(jobKey, cronJob);
    cronJob.start();
    
    console.log(`⏰ Scheduled fetch for priority ${priority} with cron: ${cronExpression}`);
  }

  /**
   * Fetch all news from all sources
   */
  async fetchAllNews(): Promise<void> {
    // Prevent overlapping fetches
    if (this.isFetching) {
      console.log('⚠️ News fetch already in progress, skipping...');
      return;
    }
    
    this.isFetching = true;
    console.log('📰 Starting full news fetch...');
    
    try {
      const sources = await this.storage.getNewsSources();
      let totalArticles = 0;
      let successfulSources = 0;

      for (const source of sources) {
        if (source.status === 'active') {
          try {
            const articles = await this.fetchFromSource(source);
            totalArticles += articles.length;
            successfulSources++;
            console.log(`✅ ${source.name}: ${articles.length} articles`);
          } catch (error) {
            console.error(`❌ Error fetching from ${source.name}:`, error);
            await this.logFetchError(source.id, error);
          }
        }
      }

      // Limit articles to 10 per topic after fetching
      await this.limitArticlesPerTopic();
      
      console.log(`📊 News fetch completed: ${totalArticles} articles from ${successfulSources} sources`);
    } catch (error) {
      console.error('❌ Error in fetchAllNews:', error);
    } finally {
      this.isFetching = false;
      console.log('✅ News fetch completed, ready for next scheduled run');
    }
  }

  /**
   * Fetch news from sources with specific priority
   */
  async fetchNewsByPriority(priority: number): Promise<void> {
    // Prevent overlapping fetches
    if (this.isFetching) {
      console.log(`⚠️ News fetch already in progress, skipping priority ${priority}...`);
      return;
    }
    
    console.log(`📰 Fetching news for priority ${priority}...`);
    
    try {
      const sources = await this.storage.getNewsSourcesByPriority(priority);
      let totalArticles = 0;

      for (const source of sources) {
        if (source.status === 'active') {
          try {
            const articles = await this.fetchFromSource(source);
            totalArticles += articles.length;
            console.log(`✅ ${source.name} (Priority ${priority}): ${articles.length} articles`);
          } catch (error) {
            console.error(`❌ Error fetching from ${source.name}:`, error);
            await this.logFetchError(source.id, error);
          }
        }
      }

      console.log(`📊 Priority ${priority} fetch completed: ${totalArticles} articles`);
    } catch (error) {
      console.error(`❌ Error in fetchNewsByPriority(${priority}):`, error);
    }
  }

  /**
   * Fetch news from a single source
   */
  async fetchFromSource(source: NewsSource): Promise<NewsArticle[]> {
    const startTime = Date.now();
    
    try {
      // Fetch articles from RSS
      const rawArticles = await this.rssAggregator.fetchFromRSS(source);
      
      if (rawArticles.length === 0) {
        console.log(`ℹ️ No articles found for ${source.name}`);
        return [];
      }

      // Process and store articles
      const processedArticles: NewsArticle[] = [];
      
      for (const rawArticle of rawArticles) {
        try {
          // Check if article already exists
          const existingArticle = await this.storage.getNewsArticleByUrl(rawArticle.url);
          
          if (!existingArticle) {
            // Process article
            const processedArticle = await this.processArticle(rawArticle);
            
            // Store article
            const savedArticle = await this.storage.createNewsArticle(processedArticle);
            processedArticles.push(savedArticle);
            
            console.log(`📝 New article: ${rawArticle.title.substring(0, 50)}...`);
          }
        } catch (error) {
          console.error(`❌ Error processing article from ${source.name}:`, error);
        }
      }

      // Update source last fetch time
      await this.storage.updateNewsSourceLastFetch(source.id, new Date());

      // Log successful fetch
      const fetchDuration = Date.now() - startTime;
      await this.logFetchSuccess(source.id, rawArticles.length, processedArticles.length, fetchDuration);

      return processedArticles;
    } catch (error) {
      const fetchDuration = Date.now() - startTime;
      await this.logFetchError(source.id, error, fetchDuration);
      throw error;
    }
  }

  /**
   * Process raw article data
   */
  private async processArticle(rawArticle: RawNewsArticle): Promise<InsertNewsArticle> {
    // Calculate read time
    const readTime = this.calculateReadTime(rawArticle.excerpt || '');
    
    // Determine if article should be featured
    const isFeatured = this.shouldBeFeatured(rawArticle);

    // Ensure tags is a valid array of strings
    const validTags = Array.isArray(rawArticle.tags) 
      ? rawArticle.tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
      : [];

    return {
      sourceId: rawArticle.sourceId,
      title: rawArticle.title,
      url: rawArticle.url,
      excerpt: rawArticle.excerpt || '',
      content: rawArticle.content,
      author: rawArticle.author || 'Unknown',
      publishedAt: rawArticle.publishedAt,
      category: rawArticle.category || 'AI',
      tags: validTags,
      imageUrl: rawArticle.imageUrl,
      readTime: `${readTime} min read`,
      isFeatured,
      fetchStatus: 'processed'
    };
  }

  /**
   * Calculate read time for article
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, minutes); // Minimum 1 minute
  }

  /**
   * Determine if article should be featured
   */
  private shouldBeFeatured(article: RawNewsArticle): boolean {
    // Feature recent articles with important keywords
    const isRecent = new Date().getTime() - article.publishedAt.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours
    
    const hasImportantKeywords = [
      'breakthrough', 'release', 'launch', 'announcement', 'new model',
      'gpt', 'chatgpt', 'deepmind', 'openai', 'research', 'paper'
    ].some(keyword => article.title.toLowerCase().includes(keyword.toLowerCase()));
    
    return isRecent && hasImportantKeywords;
  }

  /**
   * Log successful fetch
   */
  private async logFetchSuccess(
    sourceId: string, 
    articlesFound: number, 
    articlesProcessed: number, 
    fetchDuration: number
  ): Promise<void> {
    await this.storage.createNewsFetchLog({
      sourceId,
      status: 'success',
      articlesFound,
      articlesProcessed,
      fetchDuration
    });
  }

  /**
   * Log fetch error
   */
  private async logFetchError(
    sourceId: string, 
    error: any, 
    fetchDuration?: number
  ): Promise<void> {
    await this.storage.createNewsFetchLog({
      sourceId,
      status: 'failed',
      articlesFound: 0,
      articlesProcessed: 0,
      errorMessage: error.message || 'Unknown error',
      fetchDuration: fetchDuration || 0
    });
  }

  /**
   * Clear all articles (for testing)
   */
  async clearAllArticles(): Promise<void> {
    await this.storage.clearAllNewsArticles();
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    console.log('🛑 Stopping News Scheduler...');
    
    this.cronJobs.forEach((job, key) => {
      job.stop();
      console.log(`⏹️ Stopped cron job: ${key}`);
    });
    
    this.cronJobs.clear();
    this.isRunning = false;
    this.isFetching = false;
    console.log('✅ News Scheduler stopped');
  }

  /**
   * Restart the scheduler (useful for fixing infinite loops)
   */
  restart(): void {
    console.log('🔄 Restarting News Scheduler...');
    this.stop();
    setTimeout(() => {
      this.initialize();
    }, 1000); // Wait 1 second before restarting
  }

  /**
   * Limit articles to 10 per topic to keep the system lean
   */
  private async limitArticlesPerTopic(): Promise<void> {
    console.log('🔒 Limiting articles to 10 per topic...');
    
    try {
      const categories = ['AI', 'ML', 'DL', 'Research', 'Academic', 'Industry'];
      let totalRemoved = 0;
      
      for (const category of categories) {
        const articles = await this.storage.getNewsArticlesByCategory(category);
        
        if (articles.length > 10) {
          // Sort by published date (newest first) and keep only 10
                    const sortedArticles = articles.sort((a: any, b: any) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          
          const articlesToRemove = sortedArticles.slice(10);
          
          for (const article of articlesToRemove) {
            // Actually archive the article by updating its status
            try {
              await this.storage.updateNewsArticle(article.id, {
                fetchStatus: 'archived'
              });
              console.log(`📚 Archived article: ${article.title.substring(0, 50)}...`);
            } catch (error) {
              console.error(`❌ Failed to archive article ${article.id}:`, error);
            }
          }
          
          totalRemoved += articlesToRemove.length;
        }
      }
      
      console.log(`✅ Article limiting completed. ${totalRemoved} articles archived.`);
    } catch (error) {
      console.error('❌ Error limiting articles per topic:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; activeJobs: number } {
    return {
      isRunning: this.isRunning,
      activeJobs: this.cronJobs.size
    };
  }
}

export default NewsSchedulerService;
