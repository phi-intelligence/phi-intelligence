import { eq, desc, and, isNull, isNotNull, ne, inArray } from 'drizzle-orm';
import { getDb } from './database';
import * as schema from '../shared/schema';
import type { 
  User, InsertUser, Contact, InsertContact, Job, InsertJob, 
  BlogPost, InsertBlogPost, NewsSource, InsertNewsSource, 
  NewsArticle, InsertNewsArticle, NewsFetchLog, InsertNewsFetchLog,
  JobApplication, InsertJobApplication 
} from '../shared/schema';

export class DatabaseStorage {
  // User Management
  async getUser(id: string): Promise<User | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const db = await getDb();
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // Contact Management
  async createContact(contact: InsertContact): Promise<Contact> {
    const db = await getDb();
    const result = await db.insert(schema.contacts).values(contact).returning();
    return result[0];
  }

  async getContacts(): Promise<Contact[]> {
    const db = await getDb();
    return await db.select().from(schema.contacts).orderBy(desc(schema.contacts.createdAt));
  }

  // Job Management
  async getJobs(): Promise<Job[]> {
    const db = await getDb();
    return await db.select().from(schema.jobs).where(eq(schema.jobs.isActive, true));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.jobs).where(eq(schema.jobs.id, id));
    return result[0];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const db = await getDb();
    const result = await db.insert(schema.jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: string, jobData: Partial<InsertJob>): Promise<Job> {
    const db = await getDb();
    const result = await db.update(schema.jobs)
      .set(jobData)
      .where(eq(schema.jobs.id, id))
      .returning();
    return result[0];
  }

  async deleteJob(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(schema.jobs).where(eq(schema.jobs.id, id)).returning();
    return result.length > 0;
  }

  async toggleJobStatus(id: string): Promise<Job> {
    const job = await this.getJob(id);
    if (!job) {
      throw new Error('Job not found');
    }
    
    const db = await getDb();
    const result = await db.update(schema.jobs)
      .set({ isActive: !job.isActive })
      .where(eq(schema.jobs.id, id))
      .returning();
    return result[0];
  }

  // Job Application Management
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const db = await getDb();
    const result = await db.insert(schema.jobApplications).values(application).returning();
    return result[0];
  }

  async getJobApplications(): Promise<JobApplication[]> {
    const db = await getDb();
    return await db.select().from(schema.jobApplications).orderBy(desc(schema.jobApplications.createdAt));
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.jobApplications).where(eq(schema.jobApplications.id, id));
    return result[0];
  }

  async updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication> {
    const db = await getDb();
    const result = await db.update(schema.jobApplications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(schema.jobApplications.id, id))
      .returning();
    return result[0];
  }

  // Blog Management
  async getBlogPosts(): Promise<BlogPost[]> {
    const db = await getDb();
    return await db.select().from(schema.blogPosts).orderBy(desc(schema.blogPosts.publishedAt));
  }

  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    const db = await getDb();
    return await db.select().from(schema.blogPosts)
      .where(eq(schema.blogPosts.featured, true))
      .orderBy(desc(schema.blogPosts.publishedAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.slug, slug));
    return result[0];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const db = await getDb();
    const result = await db.insert(schema.blogPosts).values(post).returning();
    return result[0];
  }

  // News Management
  async getNewsSources(): Promise<NewsSource[]> {
    const db = await getDb();
    return await db.select().from(schema.newsSources);
  }

  async getNewsSource(id: string): Promise<NewsSource | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.newsSources).where(eq(schema.newsSources.id, id));
    return result[0];
  }

  async getNewsSourceByUrl(url: string): Promise<NewsSource | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.newsSources).where(eq(schema.newsSources.url, url));
    return result[0];
  }

  async getNewsSourcesByPriority(priority: number): Promise<NewsSource[]> {
    const db = await getDb();
    return await db.select().from(schema.newsSources).where(eq(schema.newsSources.priority, priority));
  }

  async createNewsSource(source: InsertNewsSource): Promise<NewsSource> {
    const db = await getDb();
    const result = await db.insert(schema.newsSources).values(source).returning();
    return result[0];
  }

  async updateNewsSource(id: string, source: Partial<InsertNewsSource>): Promise<NewsSource> {
    const db = await getDb();
    const result = await db.update(schema.newsSources)
      .set(source)
      .where(eq(schema.newsSources.id, id))
      .returning();
    return result[0];
  }

  async updateNewsSourceLastFetch(id: string, lastFetch: Date): Promise<void> {
    const db = await getDb();
    await db.update(schema.newsSources)
      .set({ lastFetch })
      .where(eq(schema.newsSources.id, id));
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    const db = await getDb();
    return await db.select().from(schema.newsArticles)
      .where(and(
        isNotNull(schema.newsArticles.publishedAt),
        ne(schema.newsArticles.fetchStatus, 'archived')
      ))
      .orderBy(desc(schema.newsArticles.publishedAt));
  }

  async getNewsArticlesByCategory(category: string): Promise<NewsArticle[]> {
    const db = await getDb();
    return await db.select().from(schema.newsArticles)
      .where(and(
        eq(schema.newsArticles.category, category),
        ne(schema.newsArticles.fetchStatus, 'archived')
      ))
      .orderBy(desc(schema.newsArticles.publishedAt));
  }

  async getNewsArticlesBySource(sourceId: string): Promise<NewsArticle[]> {
    const db = await getDb();
    return await db.select().from(schema.newsArticles)
      .where(and(
        eq(schema.newsArticles.sourceId, sourceId),
        ne(schema.newsArticles.fetchStatus, 'archived')
      ))
      .orderBy(desc(schema.newsArticles.publishedAt));
  }

  async getNewsArticlesBySourceType(type: string): Promise<NewsArticle[]> {
    const sources = await this.getNewsSources();
    const sourceIds = sources.filter(s => s.type === type).map(s => s.id);
    
    if (sourceIds.length === 0) return [];
    
    const db = await getDb();
    return await db.select().from(schema.newsArticles)
      .where(and(
        inArray(schema.newsArticles.sourceId, sourceIds),
        ne(schema.newsArticles.fetchStatus, 'archived')
      ))
      .orderBy(desc(schema.newsArticles.publishedAt));
  }

  async getFeaturedNewsArticles(): Promise<NewsArticle[]> {
    const db = await getDb();
    return await db.select().from(schema.newsArticles)
      .where(and(
        eq(schema.newsArticles.isFeatured, true),
        ne(schema.newsArticles.fetchStatus, 'archived')
      ))
      .orderBy(desc(schema.newsArticles.publishedAt));
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.newsArticles).where(eq(schema.newsArticles.id, id));
    return result[0];
  }

  async getNewsArticleByUrl(url: string): Promise<NewsArticle | undefined> {
    const db = await getDb();
    const result = await db.select().from(schema.newsArticles).where(eq(schema.newsArticles.url, url));
    return result[0];
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    // Ensure arrays are properly formatted for Drizzle ORM
    const sanitizedArticle = {
      ...article,
      tags: Array.isArray(article.tags) 
        ? article.tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0)
        : []
    };
    
    const db = await getDb();
    const result = await db.insert(schema.newsArticles).values(sanitizedArticle).returning();
    return result[0];
  }

  async updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle> {
    const db = await getDb();
    const result = await db.update(schema.newsArticles)
      .set(article)
      .where(eq(schema.newsArticles.id, id))
      .returning();
    return result[0];
  }

  async createNewsFetchLog(log: InsertNewsFetchLog): Promise<NewsFetchLog> {
    const db = await getDb();
    const result = await db.insert(schema.newsFetchLogs).values(log).returning();
    return result[0];
  }

  async getNewsFetchLogs(): Promise<NewsFetchLog[]> {
    const db = await getDb();
    return await db.select().from(schema.newsFetchLogs).orderBy(desc(schema.newsFetchLogs.createdAt));
  }

  async getNewsFetchLogsBySource(sourceId: string): Promise<NewsFetchLog[]> {
    const db = await getDb();
    return await db.select().from(schema.newsFetchLogs)
      .where(eq(schema.newsFetchLogs.sourceId, sourceId))
      .orderBy(desc(schema.newsFetchLogs.createdAt));
  }

  async archiveNewsArticle(id: string): Promise<NewsArticle> {
    const db = await getDb();
    const result = await db.update(schema.newsArticles)
      .set({ fetchStatus: 'archived' })
      .where(eq(schema.newsArticles.id, id))
      .returning();
    return result[0];
  }

  async getArchivedNewsArticles(): Promise<NewsArticle[]> {
    const db = await getDb();
    return await db.select().from(schema.newsArticles)
      .where(eq(schema.newsArticles.fetchStatus, 'archived'))
      .orderBy(desc(schema.newsArticles.createdAt));
  }

  async clearAllNewsArticles(): Promise<void> {
    const db = await getDb();
    await db.delete(schema.newsArticles);
    console.log('✅ All news articles cleared from database');
  }
}