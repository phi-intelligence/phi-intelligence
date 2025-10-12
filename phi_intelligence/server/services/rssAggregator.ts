import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsSource, NewsArticle, InsertNewsArticle } from '../../shared/schema';

// RSS Parser with custom fields
const parser = new Parser({
  customFields: {
    item: ['media:content', 'dc:creator', 'category', 'content:encoded', 'dc:date', 'pubDate', 'date']
  }
});

export interface RawNewsArticle {
  title: string;
  url: string;
  excerpt?: string;
  content?: string;
  author?: string;
  publishedAt: Date;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  sourceId: string;
  sourceName: string;
}

export class RSSAggregatorService {
  
  /**
   * Fetch articles from RSS feed
   */
  async fetchFromRSS(source: NewsSource): Promise<RawNewsArticle[]> {
    if (!source.rssUrl) {
      console.warn(`No RSS URL provided for source: ${source.name}`);
      return [];
    }

    try {
      console.log(`Fetching RSS from: ${source.name} (${source.rssUrl})`);
      const feed = await parser.parseURL(source.rssUrl);
      
      const articles = feed.items.map(item => ({
        title: item.title || 'Untitled Article',
        url: item.link || '',
        excerpt: item.contentSnippet || item.content || '',
        author: (item as any).creator || (item as any).author || 'Unknown',
        publishedAt: this.extractPublicationDate(item),
        imageUrl: this.extractImageUrl(item),
        category: this.categorizeArticle(item.title || '', item.contentSnippet || ''),
        tags: this.extractTags(item.title || '', item.contentSnippet || '', (item as any).categories),
        sourceId: source.id,
        sourceName: source.name
      }));
      
      // Filter for AI-related articles with logging
      const aiArticles = articles.filter(article => {
        const isAI = article.url && this.isAIRelated(article.title, article.excerpt);
        if (!isAI && article.title) {
          console.log(`🚫 Filtered out non-AI article: "${article.title.substring(0, 60)}..."`);
        }
        return isAI;
      });
      
      console.log(`✅ Source: ${source.name} - Found ${aiArticles.length} AI-related articles out of ${articles.length} total`);
      return aiArticles;
      
    } catch (error) {
      console.error(`Error fetching RSS from ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Extract publication date from RSS item with multiple fallbacks
   */
  private extractPublicationDate(item: any): Date {
    // Try multiple date fields in order of preference
    const dateFields = [
      item.pubDate,           // Standard RSS pubDate
      item['dc:date'],        // Dublin Core date
      item.date,              // Generic date field
      item.isoDate,           // ISO date (if available)
      item.lastBuildDate      // Last build date as fallback
    ];
    
    for (const dateField of dateFields) {
      if (dateField) {
        try {
          const parsedDate = new Date(dateField);
          // Check if the date is valid and not in the future
          if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
            console.log(`✅ Using date: ${parsedDate.toISOString()} from field: ${dateField}`);
            return parsedDate;
          }
        } catch (error) {
          console.log(`⚠️ Failed to parse date: ${dateField}`);
        }
      }
    }
    
    // If no valid date found, use a reasonable fallback (1 week ago)
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() - 7);
    console.log(`⚠️ No valid date found, using fallback: ${fallbackDate.toISOString()}`);
    return fallbackDate;
  }

  /**
   * Extract image URL from RSS item
   */
  private extractImageUrl(item: any): string | undefined {
    // Try to extract from media:content
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
      return item['media:content'].$.url;
    }
    
    // Try to extract from content if it's HTML
    if (item.content) {
      const $ = cheerio.load(item.content);
      const img = $('img').first();
      if (img.attr('src')) {
        return img.attr('src');
      }
    }
    
    return undefined;
  }

  /**
   * Categorize article based on content with strict AI/ML/DL focus
   */
  private categorizeArticle(title: string, excerpt: string): string {
    const text = `${title} ${excerpt}`.toLowerCase();
    
    // Deep Learning specific keywords (highest priority)
    if (text.includes('deep learning') || text.includes('neural network') || text.includes('neural networks') ||
        text.includes('cnn') || text.includes('rnn') || text.includes('transformer') || text.includes('attention') ||
        text.includes('bert') || text.includes('gpt') || text.includes('llm') || text.includes('large language model') ||
        text.includes('foundation model') || text.includes('convolutional') || text.includes('recurrent')) {
      return 'DL';
    }
    
    // Machine Learning specific keywords (second priority)
    if (text.includes('machine learning') || text.includes('ml ') || 
        text.includes('supervised learning') || text.includes('unsupervised learning') ||
        text.includes('reinforcement learning') || text.includes('transfer learning') ||
        text.includes('algorithm') || text.includes('model training') || text.includes('inference')) {
      return 'ML';
    }
    
    // Artificial Intelligence general (third priority)
    if (text.includes('artificial intelligence') || text.includes(' ai ') ||
        text.includes('chatgpt') || text.includes('openai') || text.includes('deepmind') ||
        text.includes('anthropic') || text.includes('claude')) {
      return 'AI';
    }
    
    // Research and Academic (only if clearly AI-related)
    if ((text.includes('research') || text.includes('paper') || text.includes('study') ||
        text.includes('arxiv') || text.includes('conference') || text.includes('journal')) &&
        (text.includes('ai') || text.includes('machine learning') || text.includes('deep learning') ||
         text.includes('neural') || text.includes('algorithm'))) {
      return 'Research';
    }
    
    // Academic (only if clearly AI-related)
    if ((text.includes('university') || text.includes('academic') || text.includes('scholar')) &&
        (text.includes('ai') || text.includes('machine learning') || text.includes('deep learning'))) {
      return 'Academic';
    }
    
    // Industry (only if clearly AI-related)
    if ((text.includes('startup') || text.includes('funding') || text.includes('market') ||
        text.includes('business') || text.includes('enterprise') || text.includes('product')) &&
        (text.includes('ai') || text.includes('machine learning') || text.includes('deep learning'))) {
      return 'Industry';
    }
    
    // Default to AI if we can't categorize but it passed the AI filter
    return 'AI';
  }

  /**
   * Extract tags from content
   */
  private extractTags(title: string, excerpt: string, categories?: any): string[] {
    const text = `${title} ${excerpt}`.toLowerCase();
    const tags: string[] = [];
    
    // Common AI/ML/DL tags
    const tagKeywords = [
      'artificial intelligence', 'machine learning', 'deep learning', 'neural networks',
      'ai', 'ml', 'dl', 'nlp', 'computer vision', 'robotics', 'autonomous',
      'chatgpt', 'gpt', 'bert', 'transformer', 'cnn', 'rnn', 'gan',
      'reinforcement learning', 'supervised learning', 'unsupervised learning',
      'data science', 'big data', 'predictive analytics', 'automation'
    ];
    
    tagKeywords.forEach(keyword => {
      if (text.includes(keyword) && !tags.some(tag => tag.toLowerCase().includes(keyword.split(' ')[0]))) {
        // Add the keyword as a properly formatted tag
        const formattedTag = keyword.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        tags.push(formattedTag);
      }
    });
    
    // Add categories if available
    if (categories && Array.isArray(categories)) {
      categories.forEach((category: string) => {
        if (category && !tags.includes(category)) {
          tags.push(category);
        }
      });
    }
    
    // Limit to 5 tags
    return tags.slice(0, 5);
  }

  /**
   * Check if article is AI/ML/DL related with strict filtering
   */
  private isAIRelated(title: string, excerpt: string): boolean {
    const text = `${title} ${excerpt}`.toLowerCase();
    
    // Primary AI/ML/DL keywords (must contain at least one)
    const primaryKeywords = [
      'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'neural networks',
      'chatgpt', 'gpt', 'bert', 'transformer', 'llm', 'large language model', 'foundation model',
      'computer vision', 'nlp', 'natural language processing', 'speech recognition', 'speech synthesis',
      'autonomous', 'self-driving', 'autonomous vehicle', 'robotics', 'automation'
    ];
    
    // Secondary AI/ML/DL keywords (strengthen the case)
    const secondaryKeywords = [
      'ai', 'ml', 'dl', 'algorithm', 'model', 'training', 'inference', 'prediction',
      'data science', 'big data', 'analytics', 'deepmind', 'openai', 'meta ai', 'nvidia',
      'research', 'study', 'paper', 'conference', 'journal', 'arxiv', 'preprint'
    ];
    
    // Industry/company specific keywords
    const companyKeywords = [
      'openai', 'deepmind', 'anthropic', 'google ai', 'meta ai', 'microsoft ai', 'nvidia ai',
      'amazon ai', 'apple ai', 'tesla ai', 'hugging face', 'stability ai', 'midjourney'
    ];
    
    // Technical AI terms
    const technicalKeywords = [
      'supervised learning', 'unsupervised learning', 'reinforcement learning', 'transfer learning',
      'cnn', 'rnn', 'lstm', 'gru', 'attention mechanism', 'backpropagation', 'gradient descent',
      'overfitting', 'underfitting', 'cross-validation', 'ensemble learning', 'random forest',
      'support vector machine', 'k-means', 'clustering', 'classification', 'regression'
    ];
    
    // Check for primary keywords (strongest signal)
    const hasPrimaryKeyword = primaryKeywords.some(keyword => text.includes(keyword));
    if (hasPrimaryKeyword) {
      // For Google Keyword feed, ensure it's actually AI-related
      if (text.includes('google') && !(text.includes('ai') || text.includes('artificial intelligence'))) {
        return false;
      }
      return true;
    }
    
    // Check for secondary keywords with context
    const secondaryCount = secondaryKeywords.filter(keyword => text.includes(keyword)).length;
    const companyCount = companyKeywords.filter(keyword => text.includes(keyword)).length;
    const technicalCount = technicalKeywords.filter(keyword => text.includes(keyword)).length;
    
    // Require multiple secondary indicators to be considered AI-related
    const totalAIIndicators = secondaryCount + companyCount + technicalCount;
    
    // Must have at least 2 AI-related indicators or 1 company + 1 technical
    return totalAIIndicators >= 2 || (companyCount >= 1 && technicalCount >= 1);
  }

  /**
   * Extract full content from article URL (optional enhancement)
   */
  async extractFullContent(url: string): Promise<string | undefined> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $('script').remove();
      $('style').remove();
      
      // Try to find main content area
      const contentSelectors = [
        'article',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.content',
        '.post-body',
        'main'
      ];
      
      let content = '';
      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > 100) break;
        }
      }
      
      // If no specific content area found, try body
      if (content.length < 100) {
        content = $('body').text().trim();
      }
      
      return content.length > 100 ? content : undefined;
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error);
      return undefined;
    }
  }
}

export default RSSAggregatorService;
