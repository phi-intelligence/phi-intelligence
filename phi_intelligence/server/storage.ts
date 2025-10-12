import { type User, type InsertUser, type Contact, type InsertContact, type Job, type InsertJob, type BlogPost, type InsertBlogPost, type NewsSource, type InsertNewsSource, type NewsArticle, type InsertNewsArticle, type NewsFetchLog, type InsertNewsFetchLog, type JobApplication, type InsertJobApplication } from "../shared/schema";
import { DatabaseStorage } from './databaseStorage';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  
  // Job Management
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<boolean>;
  toggleJobStatus(id: string): Promise<Job>;
  
  // Job Application Management
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplications(): Promise<JobApplication[]>;
  getJobApplication(id: string): Promise<JobApplication | undefined>;
  updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication>;
  
  getBlogPosts(): Promise<BlogPost[]>;
  getFeaturedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // News Management
  getNewsSources(): Promise<NewsSource[]>;
  getNewsSource(id: string): Promise<NewsSource | undefined>;
  getNewsSourceByUrl(url: string): Promise<NewsSource | undefined>;
  getNewsSourcesByPriority(priority: number): Promise<NewsSource[]>;
  createNewsSource(source: InsertNewsSource): Promise<NewsSource>;
  updateNewsSource(id: string, source: Partial<InsertNewsSource>): Promise<NewsSource>;
  updateNewsSourceLastFetch(id: string, lastFetch: Date): Promise<void>;
  
  getNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticlesByCategory(category: string): Promise<NewsArticle[]>;
  getNewsArticlesBySource(sourceId: string): Promise<NewsArticle[]>;
  getNewsArticlesBySourceType(type: string): Promise<NewsArticle[]>;
  getFeaturedNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  getNewsArticleByUrl(url: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle>;
  
  createNewsFetchLog(log: InsertNewsFetchLog): Promise<NewsFetchLog>;
  getNewsFetchLogs(): Promise<NewsFetchLog[]>;
  getNewsFetchLogsBySource(sourceId: string): Promise<NewsFetchLog[]>;
  
  // News Article Management (enhanced)
  archiveNewsArticle(id: string): Promise<NewsArticle>;
  getArchivedNewsArticles(): Promise<NewsArticle[]>;
}

export class MemStorage implements IStorage {
  private dbStorage: DatabaseStorage;

  constructor() {
    this.dbStorage = new DatabaseStorage();
  }

  // User Management
  async getUser(id: string): Promise<User | undefined> {
    return this.dbStorage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.dbStorage.getUserByUsername(username);
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.dbStorage.createUser(user);
  }

  // Contact Management
  async createContact(contact: InsertContact): Promise<Contact> {
    return this.dbStorage.createContact(contact);
  }

  async getContacts(): Promise<Contact[]> {
    return this.dbStorage.getContacts();
  }

  // Job Management
  async getJobs(): Promise<Job[]> {
    return this.dbStorage.getJobs();
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.dbStorage.getJob(id);
  }

  async createJob(job: InsertJob): Promise<Job> {
    return this.dbStorage.createJob(job);
  }

  async updateJob(id: string, jobData: Partial<InsertJob>): Promise<Job> {
    return this.dbStorage.updateJob(id, jobData);
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.dbStorage.deleteJob(id);
  }

  async toggleJobStatus(id: string): Promise<Job> {
    return this.dbStorage.toggleJobStatus(id);
  }

  // Job Application Management
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    return this.dbStorage.createJobApplication(application);
  }

  async getJobApplications(): Promise<JobApplication[]> {
    return this.dbStorage.getJobApplications();
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    return this.dbStorage.getJobApplication(id);
  }

  async updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication> {
    return this.dbStorage.updateJobApplication(id, application);
  }

  // Blog Management
  async getBlogPosts(): Promise<BlogPost[]> {
    return this.dbStorage.getBlogPosts();
  }

  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    return this.dbStorage.getFeaturedBlogPosts();
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return this.dbStorage.getBlogPost(slug);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    return this.dbStorage.createBlogPost(post);
  }

  // News Management
  async getNewsSources(): Promise<NewsSource[]> {
    return this.dbStorage.getNewsSources();
  }

  async getNewsSource(id: string): Promise<NewsSource | undefined> {
    return this.dbStorage.getNewsSource(id);
  }

  async getNewsSourceByUrl(url: string): Promise<NewsSource | undefined> {
    return this.dbStorage.getNewsSourceByUrl(url);
  }

  async getNewsSourcesByPriority(priority: number): Promise<NewsSource[]> {
    return this.dbStorage.getNewsSourcesByPriority(priority);
  }

  async createNewsSource(source: InsertNewsSource): Promise<NewsSource> {
    return this.dbStorage.createNewsSource(source);
  }

  async updateNewsSource(id: string, source: Partial<InsertNewsSource>): Promise<NewsSource> {
    return this.dbStorage.updateNewsSource(id, source);
  }

  async updateNewsSourceLastFetch(id: string, lastFetch: Date): Promise<void> {
    return this.dbStorage.updateNewsSourceLastFetch(id, lastFetch);
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    return this.dbStorage.getNewsArticles();
  }

  async getNewsArticlesByCategory(category: string): Promise<NewsArticle[]> {
    return this.dbStorage.getNewsArticlesByCategory(category);
  }

  async getNewsArticlesBySource(sourceId: string): Promise<NewsArticle[]> {
    return this.dbStorage.getNewsArticlesBySource(sourceId);
  }

  async getNewsArticlesBySourceType(type: string): Promise<NewsArticle[]> {
    return this.dbStorage.getNewsArticlesBySourceType(type);
  }

  async getFeaturedNewsArticles(): Promise<NewsArticle[]> {
    return this.dbStorage.getFeaturedNewsArticles();
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    return this.dbStorage.getNewsArticle(id);
  }

  async getNewsArticleByUrl(url: string): Promise<NewsArticle | undefined> {
    return this.dbStorage.getNewsArticleByUrl(url);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    return this.dbStorage.createNewsArticle(article);
  }

  async updateNewsArticle(id: string, article: Partial<InsertNewsArticle>): Promise<NewsArticle> {
    return this.dbStorage.updateNewsArticle(id, article);
  }

  async createNewsFetchLog(log: InsertNewsFetchLog): Promise<NewsFetchLog> {
    return this.dbStorage.createNewsFetchLog(log);
  }

  async getNewsFetchLogs(): Promise<NewsFetchLog[]> {
    return this.dbStorage.getNewsFetchLogs();
  }

  async getNewsFetchLogsBySource(sourceId: string): Promise<NewsFetchLog[]> {
    return this.dbStorage.getNewsFetchLogsBySource(sourceId);
  }

  async archiveNewsArticle(id: string): Promise<NewsArticle> {
    return this.dbStorage.archiveNewsArticle(id);
  }

  async getArchivedNewsArticles(): Promise<NewsArticle[]> {
    return this.dbStorage.getArchivedNewsArticles();
  }

  async clearAllNewsArticles(): Promise<void> {
    return this.dbStorage.clearAllNewsArticles();
  }
}

export const storage = new MemStorage();
