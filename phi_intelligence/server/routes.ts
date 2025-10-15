import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSchema, 
  insertJobApplicationSchema,
  insertJobSchema,
  updateJobSchema,
  updateContactSchema,
  updateJobApplicationSchema,
  contacts,
  jobApplications,
  jobs,
  blogPosts,
  adminUsers,
  voiceSessions,
  voicebotProfiles
} from "../shared/schema";
import { z } from "zod";
import NewsSchedulerService from "./services/newsScheduler";
import { r2StorageService } from "./services/r2StorageService";
import multer from "multer";
import { getDb } from "./database";
import { eq, desc, sql, and, like, gte, lte } from "drizzle-orm";
import { adminAuthMiddleware } from "./middleware/adminAuth";
import monitoringRoutes from "./routes/monitoring";
import { AuthService } from "./services/authService";
import keyVaultService from "./services/keyVaultService";

// Initialize news scheduler
const newsScheduler = new NewsSchedulerService(storage);

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (must be first for Docker healthcheck)
  app.get("/health", async (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      mode: process.env.SKIP_FRONTEND_SERVE === 'true' ? 'api-only' : 'full-stack',
      database: !!process.env.DATABASE_URL
    });
  });

  // Auto-initialize news system on server start
  console.log('🚀 Auto-initializing news system...');
  try {
    await newsScheduler.initialize();
    console.log('✅ News system auto-initialized successfully');
  } catch (error) {
    console.error('❌ Failed to auto-initialize news system:', error);
  }

  // Contact form submission
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid contact data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to submit contact form" });
      }
    }
  });

  // Get all contacts (for admin purposes)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json({ success: true, contacts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  // Get contact by ID
  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const contacts = await storage.getContacts();
      const contact = contacts.find(c => c.id === id);
      
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      res.json({ success: true, contact });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  // Contact form validation endpoint
  app.post("/api/contacts/validate", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      res.json({ success: true, message: "Contact data is valid" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid contact data", details: error.errors });
      } else {
        res.status(500).json({ error: "Validation failed" });
      }
    }
  });

  // Contact statistics endpoint
  app.get("/api/contacts/stats", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      
      // Calculate statistics
      const totalContacts = contacts.length;
      const today = new Date();
      const todayContacts = contacts.filter(c => {
        if (!c.createdAt) return false;
        const contactDate = new Date(c.createdAt);
        return contactDate.toDateString() === today.toDateString();
      }).length;
      
      const thisWeekContacts = contacts.filter(c => {
        if (!c.createdAt) return false;
        const contactDate = new Date(c.createdAt);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return contactDate >= weekAgo;
      }).length;
      
      const thisMonthContacts = contacts.filter(c => {
        if (!c.createdAt) return false;
        const contactDate = new Date(c.createdAt);
        return contactDate.getMonth() === today.getMonth() && 
               contactDate.getFullYear() === today.getFullYear();
      }).length;
      
      // Service interest breakdown
      const serviceBreakdown = contacts.reduce((acc, contact) => {
        if (contact.service) {
          acc[contact.service] = (acc[contact.service] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      res.json({
        success: true,
        stats: {
          total: totalContacts,
          today: todayContacts,
          thisWeek: thisWeekContacts,
          thisMonth: thisMonthContacts,
          serviceBreakdown
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact statistics" });
    }
  });

  // Get blog posts
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Get featured blog posts
  app.get("/api/blog/featured", async (req, res) => {
    try {
      const posts = await storage.getFeaturedBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured blog posts" });
    }
  });

  // Get single blog post by slug
  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // NEWS API ROUTES

  // Initialize news scheduler on startup
  app.post("/api/news/initialize", async (req, res) => {
    try {
      await newsScheduler.initialize();
      res.json({ success: true, message: "News scheduler initialized successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize news scheduler" });
    }
  });

  // Get all news articles
  app.get("/api/news", async (req, res) => {
    try {
      const { category, source, limit } = req.query;
      let articles = await storage.getNewsArticles();

      // Filter by category
      if (category && category !== 'all') {
        articles = await storage.getNewsArticlesByCategory(category as string);
      }

      // Filter by source type
      if (source && source !== 'all') {
        articles = await storage.getNewsArticlesBySourceType(source as string);
      }

      // Add source names to articles
      const sources = await storage.getNewsSources();
      const sourceMap = new Map(sources.map(s => [s.id, s.name]));
      articles = articles.map(article => ({
        ...article,
        sourceName: sourceMap.get(article.sourceId || '') || 'Unknown Source'
      }));

      // Apply 10-article limit per topic (as requested)
      if (!limit) {
        const categoryGroups = new Map<string, any[]>();
        articles.forEach(article => {
          const cat = article.category || 'AI';
          if (!categoryGroups.has(cat)) {
            categoryGroups.set(cat, []);
          }
          categoryGroups.get(cat)!.push(article);
        });
        
        // Keep only 10 newest articles per category
        articles = [];
        categoryGroups.forEach((categoryArticles, category) => {
          const sorted = categoryArticles.sort((a, b) => 
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          articles.push(...sorted.slice(0, 10));
        });
      } else {
        // If limit is specified, use that instead
        articles = articles.slice(0, parseInt(limit as string));
      }

      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news articles" });
    }
  });

  // Get featured news articles
  app.get("/api/news/featured", async (req, res) => {
    try {
      const articles = await storage.getFeaturedNewsArticles();
      
      // Add source names to featured articles
      const sources = await storage.getNewsSources();
      const sourceMap = new Map(sources.map(s => [s.id, s.name]));
      const articlesWithSources = articles.map(article => ({
        ...article,
        sourceName: sourceMap.get(article.sourceId || '') || 'Unknown Source'
      }));
      
      res.json(articlesWithSources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured news articles" });
    }
  });

  // Get news articles by category
  app.get("/api/news/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await storage.getNewsArticlesByCategory(category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news articles by category" });
    }
  });

  // Get news articles by source
  app.get("/api/news/source/:sourceId", async (req, res) => {
    try {
      const { sourceId } = req.params;
      const articles = await storage.getNewsArticlesBySource(sourceId);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news articles by source" });
    }
  });

  // Get news sources
  app.get("/api/news/sources", async (req, res) => {
    try {
      const sources = await storage.getNewsSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news sources" });
    }
  });

  // Get news source by ID
  app.get("/api/news/sources/:id", async (req, res) => {
    try {
      const source = await storage.getNewsSource(req.params.id);
      if (!source) {
        return res.status(404).json({ error: "News source not found" });
      }
      res.json(source);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news source" });
    }
  });

  // Manually trigger news fetch
  app.post("/api/news/fetch", async (req, res) => {
    try {
      await newsScheduler.fetchAllNews();
      res.json({ success: true, message: "News fetch triggered successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger news fetch" });
    }
  });

  // Get news scheduler status
  app.get("/api/news/status", async (req, res) => {
    try {
      const status = newsScheduler.getStatus();
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to get news scheduler status" });
    }
  });

  // Restart news scheduler (for fixing infinite loops)
  app.post("/api/news/restart", async (req, res) => {
    try {
      newsScheduler.restart();
      res.json({ success: true, message: "News scheduler restarting..." });
    } catch (error) {
      res.status(500).json({ error: "Failed to restart news scheduler" });
    }
  });

  // Get news fetch logs
  app.get("/api/news/logs", async (req, res) => {
    try {
      const { sourceId } = req.query;
      let logs;
      
      if (sourceId) {
        logs = await storage.getNewsFetchLogsBySource(sourceId as string);
      } else {
        logs = await storage.getNewsFetchLogs();
      }
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news logs" });
    }
  });

  // Get single news article by ID (WILDCARD ROUTE - MUST BE LAST)
  app.get("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.getNewsArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "News article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news article" });
    }
  });

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: parseInt(process.env.MAX_RESUME_SIZE || '10485760'), // 10MB default
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = (process.env.ALLOWED_RESUME_TYPES || 'pdf,docx,doc,txt').split(',');
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      
      if (fileExtension && allowedTypes.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
      }
    }
  });

  // Resume upload endpoint
  app.post("/api/jobs/:jobId/resume-upload", upload.single('resume'), async (req, res) => {
    try {
      const { jobId } = req.params;
      const { applicantId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No resume file provided" });
      }

      if (!applicantId) {
        return res.status(400).json({ error: "Applicant ID is required" });
      }

      // Validate job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Upload resume to R2
      const uploadResult = await r2StorageService.uploadResume(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        jobId,
        applicantId
      );

      if (!uploadResult.success) {
        return res.status(500).json({ error: uploadResult.error || "Resume upload failed" });
      }

      res.json({
        success: true,
        message: "Resume uploaded successfully",
        fileUrl: uploadResult.fileUrl,
        fileKey: uploadResult.fileKey,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });

    } catch (error) {
      console.error('❌ Resume upload error:', error);
      res.status(500).json({ 
        error: "Failed to upload resume",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate presigned upload URL for direct client upload
  app.post("/api/jobs/:jobId/presigned-upload-url", async (req, res) => {
    try {
      const { jobId } = req.params;
      const { fileName, contentType, applicantId } = req.body;

      if (!fileName || !contentType || !applicantId) {
        return res.status(400).json({ 
          error: "fileName, contentType, and applicantId are required" 
        });
      }

      // Validate job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Generate presigned URL
      const result = await r2StorageService.generatePresignedUploadUrl(
        fileName,
        contentType,
        jobId,
        applicantId
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error || "Failed to generate upload URL" });
      }

      res.json({
        success: true,
        uploadUrl: result.uploadUrl,
        fileKey: result.fileKey
      });

    } catch (error) {
      console.error('❌ Presigned URL generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate upload URL",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get resume download URL
  app.get("/api/resumes/:fileKey/download", async (req, res) => {
    try {
      const { fileKey } = req.params;
      const { expiresIn } = req.query;

      const result = await r2StorageService.getDownloadUrl(
        fileKey,
        expiresIn ? parseInt(expiresIn as string) : 3600
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error || "Failed to generate download URL" });
      }

      res.json({
        success: true,
        downloadUrl: result.downloadUrl
      });

    } catch (error) {
      console.error('❌ Download URL generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate download URL",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // R2 storage health check
  app.get("/api/r2/health", async (req, res) => {
    try {
      const configStatus = r2StorageService.getConfigStatus();
      const connectionTest = await r2StorageService.testConnection();

      res.json({
        success: true,
        config: configStatus,
        connection: connectionTest
      });

    } catch (error) {
      console.error('❌ R2 health check error:', error);
      res.status(500).json({ 
        error: "R2 health check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Job application submission
  app.post("/api/jobs/:jobId/apply", async (req, res) => {
    try {
      const { jobId } = req.params;
      const applicationData = insertJobApplicationSchema.parse(req.body);
      
      // Validate job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      const application = await storage.createJobApplication({
        ...applicationData,
        jobId
      });
      
      res.json({ success: true, application });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid application data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to submit job application" });
      }
    }
  });

  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  // Get job by ID
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // POST /api/news/clear - Clear all articles (for testing)
  app.post('/api/news/clear', async (req, res) => {
    try {
      await newsScheduler.clearAllArticles();
      res.json({ success: true, message: 'All articles cleared successfully' });
    } catch (error) {
      console.error('Error clearing articles:', error);
      res.status(500).json({ error: 'Failed to clear articles' });
    }
  });

  // ========================================
  // ADMIN API ENDPOINTS
  // ========================================
  
  // Admin authentication
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      // Use AuthService for authentication
      const result = await AuthService.authenticateAdmin(username, password);
      
      if (!result.success) {
        return res.status(401).json({ error: result.error });
      }

      // Set refresh token as HttpOnly cookie
      res.cookie('admin_refresh_token', result.refreshToken, {
        httpOnly: true,        // JavaScript can't access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',    // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'              // Available on all routes
      });

      // Return user info and access token (refresh token is in cookie)
      res.json({
        success: true,
        user: result.user,
        accessToken: result.accessToken
        // Don't send refresh token in response body
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Add token refresh endpoint
  app.post('/api/admin/refresh', async (req, res) => {
    try {
      // Get refresh token from cookie instead of body
      const refreshToken = req.cookies.admin_refresh_token;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const result = await AuthService.refreshAccessToken(refreshToken);
      
      if (result.error) {
        // Clear invalid cookie
        res.clearCookie('admin_refresh_token');
        return res.status(401).json({ error: result.error });
      }

      // Set new refresh token as HttpOnly cookie
      res.cookie('admin_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      // Return only access token
      res.json({
        success: true,
        accessToken: result.accessToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  });

  // Add logout endpoint
  app.post('/api/admin/logout', async (req, res) => {
    try {
      // Clear refresh token cookie
      res.clearCookie('admin_refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // Admin dashboard overview
  app.get('/api/admin/dashboard', adminAuthMiddleware, async (req, res) => {
    try {
      const db = await getDb();
      const [contactsCount, applicationsCount, jobsCount, blogPostsCount, voiceSessionsCount, activeVoicebotsCount] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(contacts),
        db.select({ count: sql`count(*)` }).from(jobApplications),
        db.select({ count: sql`count(*)` }).from(jobs),
        db.select({ count: sql`count(*)` }).from(blogPosts),
        db.select({ count: sql`count(*)` }).from(voiceSessions),
        db.select({ count: sql`count(*)` }).from(voicebotProfiles).where(eq(voicebotProfiles.status, 'active'))
      ]);

      res.json({
        success: true,
        stats: {
          contacts: contactsCount[0]?.count || 0,
          applications: applicationsCount[0]?.count || 0,
          jobs: jobsCount[0]?.count || 0,
          blogPosts: blogPostsCount[0]?.count || 0,
          voiceSessions: voiceSessionsCount[0]?.count || 0,
          activeVoicebots: activeVoicebotsCount[0]?.count || 0
        }
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Admin contacts management with enhanced filtering
  app.get('/api/admin/contacts', adminAuthMiddleware, async (req, res) => {
    try {
      const { 
        status, 
        priority, 
        source, 
        assignedTo, 
        search, 
        startDate, 
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const db = await getDb();
      
      // Build filter conditions
      let whereConditions = [];
      
      if (status) whereConditions.push(eq(contacts.status, status as string));
      if (priority) whereConditions.push(eq(contacts.priority, priority as string));
      if (source) whereConditions.push(eq(contacts.source, source as string));
      if (assignedTo) whereConditions.push(eq(contacts.assignedTo, assignedTo as string));
      
      if (search) {
        whereConditions.push(
          sql`(${contacts.name} ILIKE ${`%${search}%`} OR ${contacts.email} ILIKE ${`%${search}%`} OR ${contacts.company} ILIKE ${`%${search}%`})`
        );
      }
      
      if (startDate && endDate) {
        whereConditions.push(
          and(
            gte(contacts.createdAt, new Date(startDate as string)),
            lte(contacts.createdAt, new Date(endDate as string))
          )
        );
      }

      // Apply filters if any
      let query = db.select().from(contacts);
      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }

      // Get total count for pagination
      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(contacts);
      if (whereConditions.length > 0) {
        const filteredCount = await db.select({ count: sql<number>`count(*)` }).from(contacts).where(and(...whereConditions));
        totalResult[0] = filteredCount[0];
      }
      const total = totalResult[0]?.count || 0;

      // Apply pagination and ordering
      const offset = (Number(page) - 1) * Number(limit);
      const contactsList = await query
        .orderBy(desc(contacts.createdAt))
        .limit(Number(limit))
        .offset(offset);
      
      res.json({ 
        success: true, 
        contacts: contactsList,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      console.error('Admin contacts error:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  // Update contact with enhanced fields
  app.put('/api/admin/contacts/:id', adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = updateContactSchema.parse(req.body);
      
      // Add timestamp for last contacted if status is being updated
      if (updateData.status && updateData.status !== 'new') {
        updateData.lastContactedAt = new Date();
      }
      
      const db = await getDb();
      await db
        .update(contacts)
        .set(updateData)
        .where(eq(contacts.id, id));
      
      res.json({ success: true, message: 'Contact updated successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid update data', details: error.errors });
      } else {
        console.error('Update contact error:', error);
        res.status(500).json({ error: 'Failed to update contact' });
      }
    }
  });

  // Admin job applications management with enhanced fields
  app.get('/api/admin/applications', adminAuthMiddleware, async (req, res) => {
    try {
      const { 
        status, 
        priority, 
        assignedTo, 
        search, 
        startDate, 
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const db = await getDb();
      
      // Build filter conditions
      let whereConditions = [];
      
      if (status) whereConditions.push(eq(jobApplications.status, status as string));
      if (priority) whereConditions.push(eq(jobApplications.priority, priority as string));
      if (assignedTo) whereConditions.push(eq(jobApplications.assignedTo, assignedTo as string));
      
      if (search) {
        whereConditions.push(
          sql`(${jobs.title} ILIKE ${`%${search}%`})`
        );
      }
      
      if (startDate && endDate) {
        whereConditions.push(
          and(
            gte(jobApplications.createdAt, new Date(startDate as string)),
            lte(jobApplications.createdAt, new Date(endDate as string))
          )
        );
      }

      // Apply filters if any
      let query = db.select({
        id: jobApplications.id,
        jobId: jobApplications.jobId,
        personalInfo: jobApplications.personalInfo,
        experience: jobApplications.experience,
        education: jobApplications.education,
        skills: jobApplications.skills,
        coverLetter: jobApplications.coverLetter,
        resumeUrl: jobApplications.resumeUrl,
        status: jobApplications.status,
        notes: jobApplications.notes,
        priority: jobApplications.priority,
        rating: jobApplications.rating,
        assignedTo: jobApplications.assignedTo,
        interviewDate: jobApplications.interviewDate,
        createdAt: jobApplications.createdAt,
        updatedAt: jobApplications.updatedAt,
        jobTitle: jobs.title
      }).from(jobApplications).leftJoin(jobs, eq(jobApplications.jobId, jobs.id));

      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }

      // Get total count for pagination
      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(jobApplications);
      if (whereConditions.length > 0) {
        const filteredCount = await db.select({ count: sql<number>`count(*)` }).from(jobApplications).where(and(...whereConditions));
        totalResult[0] = filteredCount[0];
      }
      const total = totalResult[0]?.count || 0;

      // Apply pagination and ordering
      const offset = (Number(page) - 1) * Number(limit);
      const applications = await query
        .orderBy(desc(jobApplications.createdAt))
        .limit(Number(limit))
        .offset(offset);
      
      res.json({ 
        success: true, 
        applications,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      console.error('Admin applications error:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  // Update application with enhanced fields
  app.put('/api/admin/applications/:id', adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = updateJobApplicationSchema.parse(req.body);
      
      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date();
      
      const db = await getDb();
      await db
        .update(jobApplications)
        .set(updateData)
        .where(eq(jobApplications.id, id));
      
      res.json({ success: true, message: 'Application updated successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid update data', details: error.errors });
      } else {
        console.error('Update application error:', error);
        res.status(500).json({ error: 'Failed to update application' });
      }
    }
  });

  // Admin job postings management
  app.get('/api/admin/jobs', adminAuthMiddleware, async (req, res) => {
    try {
      const db = await getDb();
      const jobsList = await db
        .select()
        .from(jobs)
        .orderBy(desc(jobs.createdAt));
      
      res.json({ success: true, jobs: jobsList });
    } catch (error) {
      console.error('Admin jobs error:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  // Create new job posting
  app.post('/api/admin/jobs', adminAuthMiddleware, async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.json({ success: true, job });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid job data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create job' });
      }
    }
  });

  // Update job posting
  app.put('/api/admin/jobs/:id', adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const jobData = updateJobSchema.parse(req.body);
      
      const db = await getDb();
      await db
        .update(jobs)
        .set({ ...jobData, updatedAt: new Date() })
        .where(eq(jobs.id, id));
      
      res.json({ success: true, message: 'Job updated successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid job data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update job' });
      }
    }
  });

  // Delete job posting
  app.delete('/api/admin/jobs/:id', adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if there are applications for this job
      const db = await getDb();
      const applications = await db
        .select({ count: sql`count(*)` })
        .from(jobApplications)
        .where(eq(jobApplications.jobId, id));
      
      if (applications[0]?.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete job with existing applications' 
        });
      }
      
      await db.delete(jobs).where(eq(jobs.id, id));
      res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({ error: 'Failed to delete job' });
    }
  });

  // Voice Metrics Endpoints
  app.get('/api/admin/voice-metrics/sessions', adminAuthMiddleware, async (req, res) => {
    try {
      const { 
        voicebotId, 
        companyName, 
        status, 
        startDate, 
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const db = await getDb();
      
      // Build filter conditions
      let whereConditions = [];
      
      if (voicebotId) whereConditions.push(eq(voiceSessions.voicebotId, voicebotId as string));
      if (companyName) whereConditions.push(eq(voiceSessions.companyName, companyName as string));
      if (status) whereConditions.push(eq(voiceSessions.status, status as string));
      
      if (startDate && endDate) {
        whereConditions.push(
          and(
            gte(voiceSessions.startTime, new Date(startDate as string)),
            lte(voiceSessions.startTime, new Date(endDate as string))
          )
        );
      }

      // Apply filters if any
      let query = db.select().from(voiceSessions);
      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }

      // Get total count for pagination
      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(voiceSessions);
      if (whereConditions.length > 0) {
        const filteredCount = await db.select({ count: sql<number>`count(*)` }).from(voiceSessions).where(and(...whereConditions));
        totalResult[0] = filteredCount[0];
      }
      const total = totalResult[0]?.count || 0;

      // Apply pagination and ordering
      const offset = (Number(page) - 1) * Number(limit);
      const sessionsList = await query
        .orderBy(desc(voiceSessions.startTime))
        .limit(Number(limit))
        .offset(offset);
      
      res.json({ 
        success: true, 
        sessions: sessionsList,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      console.error('Voice metrics sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch voice sessions' });
    }
  });

  app.get('/api/admin/voice-metrics/summary', adminAuthMiddleware, async (req, res) => {
    try {
      const { voicebotId, companyName } = req.query;
      
      const db = await getDb();
      let whereConditions = [];
      
      if (voicebotId) whereConditions.push(eq(voiceSessions.voicebotId, voicebotId as string));
      if (companyName) whereConditions.push(eq(voiceSessions.companyName, companyName as string));
      
      let query = db.select().from(voiceSessions);
      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }
      
      const sessions = await query;
      
      // Calculate summary statistics
      const totalSessions = sessions.length;
      const activeSessions = sessions.filter((s: any) => s.status === 'active').length;
      const completedSessions = sessions.filter((s: any) => s.status === 'completed').length;
      
      // Calculate average duration for completed sessions
      const completedWithDuration = sessions.filter((s: any) => s.status === 'completed' && s.durationSeconds);
      const totalDuration = completedWithDuration.reduce((sum: number, s: any) => sum + Number(s.durationSeconds), 0);
      const avgDurationMinutes = completedWithDuration.length > 0 ? (totalDuration / completedWithDuration.length) / 60 : 0;
      
      // Get recent activity
      const recentSessions = sessions
        .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5);
      
      res.json({
        success: true,
        summary: {
          totalSessions,
          activeSessions,
          completedSessions,
          avgDurationMinutes: Math.round(avgDurationMinutes * 100) / 100,
          recentSessions
        }
      });
    } catch (error) {
      console.error('Voice metrics summary error:', error);
      res.status(500).json({ error: 'Failed to fetch voice metrics summary' });
    }
  });

  app.get('/api/admin/voice-metrics/voicebots', adminAuthMiddleware, async (req, res) => {
    try {
      const db = await getDb();
      const voicebots = await db
        .select()
        .from(voicebotProfiles)
        .orderBy(desc(voicebotProfiles.createdAt));
      
      res.json({ success: true, voicebots });
    } catch (error) {
      console.error('Voice metrics voicebots error:', error);
      res.status(500).json({ error: 'Failed to fetch voicebots' });
    }
  });

  // LiveKit configuration endpoint for frontend
  app.get("/api/livekit/config", async (req, res) => {
    try {
      // Use environment variables directly (AWS Secrets Manager loads them)
      const phiUrl = process.env.LIVEKIT_PHI_URL;
      const phiApiKey = process.env.LIVEKIT_PHI_API_KEY;
      const phiApiSecret = process.env.LIVEKIT_PHI_API_SECRET;
      const companyUrl = process.env.LIVEKIT_COMPANY_URL;
      const companyApiKey = process.env.LIVEKIT_COMPANY_API_KEY;
      const companyApiSecret = process.env.LIVEKIT_COMPANY_API_SECRET;

      if (!phiUrl || !phiApiKey || !phiApiSecret || !companyUrl || !companyApiKey || !companyApiSecret) {
        throw new Error('LiveKit credentials not found in environment');
      }

      res.json({
        phi: {
          url: phiUrl,
          apiKey: phiApiKey,
          apiSecret: phiApiSecret
        },
        company: {
          url: companyUrl,
          apiKey: companyApiKey,
          apiSecret: companyApiSecret
        }
      });
    } catch (error) {
      console.error('Failed to get LiveKit config:', error);
      res.status(500).json({ error: 'Failed to load LiveKit configuration' });
    }
  });

  // Chat endpoint - Proxy to OpenAI (SECURE - API key hidden from frontend)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Prepare messages with system prompt
      const messages = [
        {
          role: 'system',
          content: 'You are Phi Intelligence, a professional AI assistant specializing in AI solutions, business automation, workforce management, and industrial automation. You help businesses optimize operations, reduce costs, and implement AI solutions. Provide helpful, accurate, and concise responses. Use a friendly but professional tone. Keep responses under 150 words unless the user asks for detailed information. Focus on practical business applications and ROI.'
        },
        ...(conversationHistory || [])
      ];

      // Call OpenAI from backend (secure)
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
          stream: false
        }),
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        res.json({
          success: true,
          message: {
            role: 'assistant',
            content: data.choices[0].message.content
          }
        });
      } else {
        const errorData = await openaiResponse.json().catch(() => ({}));
        console.error('OpenAI API Error:', errorData);
        res.status(openaiResponse.status).json({ 
          error: errorData.error?.message || 'OpenAI API request failed' 
        });
      }
    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // DEPRECATED: Remove API key exposure endpoint (security risk)
  // Frontend should call /api/chat instead of getting the key
  app.get("/api/openai/key", async (req, res) => {
    console.warn('⚠️ DEPRECATED: /api/openai/key endpoint accessed - use /api/chat instead');
    res.status(410).json({ 
      error: 'This endpoint is deprecated for security reasons. Use /api/chat instead.',
      migration: 'Call POST /api/chat with {message, conversationHistory} instead of calling OpenAI directly'
    });
  });

  // Register monitoring routes
  app.use('/api/monitoring', monitoringRoutes);

  return createServer(app);
}
