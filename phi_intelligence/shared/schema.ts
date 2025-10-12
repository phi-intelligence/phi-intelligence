import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  service: text("service"),
  message: text("message").notNull(),
  status: text("status").default("new"), // new, contacted, qualified, converted, lost
  notes: text("notes"), // Admin notes
  priority: text("priority").default("medium"), // low, medium, high
  source: text("source").default("contact_form"), // contact_form, career_page, referral, other
  responseTimeHours: integer("response_time_hours"),
  lastContactedAt: timestamp("last_contacted_at"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  readTime: text("read_time"),
  tags: text("tags").array(),
  featured: boolean("featured").default(false),
});

// News Sources Table
export const newsSources = pgTable("news_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "tech_news", "research", "academic", "industry"
  url: text("url").notNull(),
  rssUrl: text("rss_url"),
  apiKey: text("api_key"),
  lastFetch: timestamp("last_fetch"),
  status: text("status").default("active"),
  priority: integer("priority").default(1), // 1=high, 2=medium, 3=low
  createdAt: timestamp("created_at").defaultNow(),
});

// News Articles Table
export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").references(() => newsSources.id),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  author: text("author"),
  publishedAt: timestamp("published_at"),
  category: text("category"), // "AI", "ML", "DL", "Industry", "Research", "Academic"
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  readTime: text("read_time"),
  isFeatured: boolean("is_featured").default(false),
  fetchStatus: text("fetch_status").default("pending"), // "pending", "fetched", "processed"
  createdAt: timestamp("created_at").defaultNow(),
});

// News Fetch Logs Table
export const newsFetchLogs = pgTable("news_fetch_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").references(() => newsSources.id),
  status: text("status").notNull(), // "success", "failed", "partial"
  articlesFound: integer("articles_found").default(0),
  articlesProcessed: integer("articles_processed").default(0),
  errorMessage: text("error_message"),
  fetchDuration: integer("fetch_duration"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  personalInfo: text("personal_info").notNull(), // JSON string
  experience: text("experience").notNull(), // JSON string
  education: text("education").notNull(), // JSON string
  skills: text("skills").array(), // Array of skills
  coverLetter: text("cover_letter").notNull(),
  resumeUrl: text("resume_url").notNull(),
  status: text("status").default("new"), // new, reviewing, interviewing, offered, rejected
  notes: text("notes"), // Admin notes
  priority: text("priority").default("medium"), // low, medium, high
  rating: integer("rating"), // 1-5 rating
  assignedTo: text("assigned_to"),
  interviewDate: timestamp("interview_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const updateJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
});

export const insertNewsSourceSchema = createInsertSchema(newsSources).omit({
  id: true,
  createdAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
});

export const insertNewsFetchLogSchema = createInsertSchema(newsFetchLogs).omit({
  id: true,
  createdAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
}).partial();

export const updateJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type InsertNewsSource = z.infer<typeof insertNewsSourceSchema>;
export type NewsSource = typeof newsSources.$inferSelect;

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

export type InsertNewsFetchLog = z.infer<typeof insertNewsFetchLogSchema>;
export type NewsFetchLog = typeof newsFetchLogs.$inferSelect;

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export type UpdateContact = z.infer<typeof updateContactSchema>;
export type UpdateJobApplication = z.infer<typeof updateJobApplicationSchema>;

// Voice Metrics Tables
export const voiceSessions = pgTable("voice_sessions", {
  sessionId: varchar("session_id").primaryKey().default(sql`gen_random_uuid()`),
  voicebotId: varchar("voicebot_id", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 500 }).notNull(),
  roomName: varchar("room_name", { length: 255 }).notNull(),
  workerId: varchar("worker_id", { length: 255 }).notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  durationSeconds: numeric("duration_seconds", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("active"),
  performanceMetrics: jsonb("performance_metrics"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const voicebotProfiles = pgTable("voicebot_profiles", {
  voicebotId: varchar("voicebot_id", { length: 255 }).primaryKey(),
  companyName: varchar("company_name", { length: 500 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("active"),
  livekitInstance: varchar("livekit_instance", { length: 100 }).default("company"),
  configuration: jsonb("configuration"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ✅ ADDED: Voicebot Metrics Table (was missing from schema)
export const voicebotMetrics = pgTable("voicebot_metrics", {
  id: integer("id").primaryKey(),
  voicebotId: varchar("voicebot_id", { length: 255 }).notNull(),
  sessionId: varchar("session_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  actionDetails: jsonb("action_details"),
  success: boolean("success").notNull().default(true),
  responseTimeMs: integer("response_time_ms"),
  tokensUsed: integer("tokens_used"),
  costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Voicebot Usage Summaries Table (was missing from schema)
export const voicebotUsageSummaries = pgTable("voicebot_usage_summaries", {
  voicebotId: varchar("voicebot_id", { length: 255 }).primaryKey(),
  totalActions: integer("total_actions").default(0),
  successfulActions: integer("successful_actions").default(0),
  failedActions: integer("failed_actions").default(0),
  totalResponseTimeMs: integer("total_response_time_ms").default(0),
  totalTokensUsed: integer("total_tokens_used").default(0),
  totalCostUsd: numeric("total_cost_usd", { precision: 10, scale: 6 }).default("0"),
  lastActivity: timestamp("last_activity", { withTimezone: true }),
  lastActionType: varchar("last_action_type", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Voice Metrics Schemas
export const insertVoiceSessionSchema = createInsertSchema(voiceSessions).omit({
  sessionId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVoiceSessionSchema = createInsertSchema(voiceSessions).omit({
  sessionId: true,
  createdAt: true,
}).partial();

export const insertVoicebotProfileSchema = createInsertSchema(voicebotProfiles).omit({
  createdAt: true,
  updatedAt: true,
});

export const updateVoicebotProfileSchema = createInsertSchema(voicebotProfiles).omit({
  createdAt: true,
}).partial();

export type InsertVoiceSession = z.infer<typeof insertVoiceSessionSchema>;
export type VoiceSession = typeof voiceSessions.$inferSelect;
export type UpdateVoiceSession = z.infer<typeof updateVoiceSessionSchema>;

export type InsertVoicebotProfile = z.infer<typeof insertVoicebotProfileSchema>;
export type VoicebotProfile = typeof voicebotProfiles.$inferSelect;
export type UpdateVoicebotProfile = z.infer<typeof updateVoicebotProfileSchema>;

// Admin Users Table
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin"), // admin, super_admin
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
