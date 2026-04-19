import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { registerRoutes } from "./routes";
import { testConnection, initializeDatabase } from "./database";
import path from 'path';
import { CORSService } from "./middleware/cors";
import { HTTPSServer } from "./https";
import { HTTPRedirectServer } from "./httpRedirect";
import { SSLService } from "./ssl";

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:", "http:"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrcAttr: ["'none'"]
    }
  }
}));

// CORS configuration
app.use(CORSService.createCORS());

// Add CORS error handling after CORS middleware
app.use(CORSService.handleCORSError);

// Rate limiting (JSON body so the client can parse it; skip the TMS proxy and
// health checks which are internal/trusted).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // generous ceiling for an authenticated employee portal
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/tms') || req.path === '/health',
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});
app.use('/api/', limiter);

// Add cookie parser middleware
app.use(cookieParser());

import { createProxyMiddleware } from 'http-proxy-middleware';

// TMS Proxy MUST be before body parser
app.use('/api/tms', createProxyMiddleware({
  target: process.env.TMS_API_URL || 'http://localhost:6000',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/api/',
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});



(async () => {
  // Validate SSL configuration
  const sslValidation = SSLService.validateSSLConfig();
  if (!sslValidation.valid) {
    console.error('❌ SSL configuration errors:');
    sslValidation.errors.forEach(error => console.error(`  - ${error}`));
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot start production server with invalid SSL configuration');
      process.exit(1);
    }
  }

  // Test database connection
  try {
    await testConnection();
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot start production server without database. Exiting.');
      process.exit(1);
    }
  }

  // Conditional imports for development vs production
  let setupVite: any, serveStatic: any, log: any;

  if (process.env.NODE_ENV === 'development') {
    try {
      const viteModule = await import("./vite");
      setupVite = viteModule.setupVite;
      serveStatic = viteModule.serveStatic;
      log = viteModule.log;
    } catch (error) {
      console.warn('⚠️ Vite development mode not available, falling back to production mode');
      setupVite = null;
      serveStatic = (app: any) => {
        const distPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../dist');
        app.use(express.static(distPath));
        app.get('*', (req: any, res: any) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      };
      log = console.log;
    }
  } else {
    // Production fallbacks
    setupVite = null;
    serveStatic = (app: any) => {
      const distPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../dist');
      app.use(express.static(distPath));
      app.get('*', (req: any, res: any) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    };
    log = console.log;
  }

  // Register API routes first
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Log error internally with full details
    console.error('❌ Server Error:', {
      status,
      message: err.message,
      stack: err.stack,
      path: _req.path,
      method: _req.method,
      timestamp: new Date().toISOString(),
      userAgent: _req.get('User-Agent'),
      ip: _req.ip || _req.connection.remoteAddress
    });

    // Send safe response to client (no stack traces in production)
    res.status(status).json({ 
      error: isProduction ? 'Internal Server Error' : err.message,
      status,
      timestamp: new Date().toISOString(),
      ...(isProduction && { requestId: Math.random().toString(36).substr(2, 9) })
    });
  });

  // Setup Vite in development mode only
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else if (process.env.SKIP_FRONTEND_SERVE !== 'true') {
    // Production: Serve static files (only if not using external frontend like Amplify)
    serveStatic(app);
    
    // Production logging
    console.log('🚀 Production mode enabled - Serving static files');
    console.log('🔒 Security middleware: Helmet, Rate Limiting, CORS');
    console.log('📊 Error monitoring and logging enabled');
  } else {
    // Production: API-only mode (frontend served externally)
    console.log('🚀 Production API-only mode enabled');
    console.log('📡 Frontend served externally (e.g., AWS Amplify)');
    console.log('🔒 Security middleware: Helmet, Rate Limiting, CORS');
    console.log('📊 Error monitoring and logging enabled');
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);

  if (process.env.NODE_ENV === 'production' && SSLService.getSSLOptions()) {
    // Production with HTTPS
    const httpsServer = HTTPSServer.createHTTPS(app, port);
    
    // Create HTTP redirect server (port 80)
    HTTPRedirectServer.createRedirectServer(port, 80);
    
    console.log('🚀 Production HTTPS server enabled');
    console.log('🔒 SSL/TLS security active');
    console.log('🔄 HTTP to HTTPS redirect active');
  } else {
    // Development or no SSL
    server.listen(port, "0.0.0.0", () => {
      console.log(`serving on port ${port}`);
    });
  }
})();
