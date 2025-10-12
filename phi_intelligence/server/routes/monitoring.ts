import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schemas
const PerformanceMetricsSchema = z.object({
  pageLoadTime: z.number(),
  timeToFirstByte: z.number(),
  domContentLoaded: z.number(),
  firstContentfulPaint: z.number().optional(),
  largestContentfulPaint: z.number().optional(),
  cumulativeLayoutShift: z.number().optional(),
  url: z.string(),
  timestamp: z.string(),
  sessionId: z.string(),
});

const UserInteractionSchema = z.object({
  interactions: z.array(z.object({
    type: z.enum(['click', 'scroll', 'navigation', 'form_submit', 'error']),
    timestamp: z.number(),
    element: z.string().optional(),
    details: z.record(z.any()).optional(),
  })),
  url: z.string(),
  timestamp: z.string(),
  sessionId: z.string(),
});

const ErrorReportSchema = z.object({
  errorId: z.string().optional(),
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  context: z.string().optional(),
  timestamp: z.number(),
  url: z.string(),
  userAgent: z.string(),
  sessionId: z.string(),
});

const WarningSchema = z.object({
  message: z.string(),
  data: z.any().optional(),
  context: z.object({
    component: z.string().optional(),
    action: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    timestamp: z.number(),
  }),
});

const ApiMetricsSchema = z.object({
  method: z.string(),
  url: z.string(),
  duration: z.number(),
  status: z.number(),
  context: z.object({
    component: z.string().optional(),
    action: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    timestamp: z.number(),
  }),
});

// Performance monitoring endpoint
router.post('/performance', async (req: Request, res: Response) => {
  try {
    const data = PerformanceMetricsSchema.parse(req.body);
    
    // Log performance metrics
    console.log('Performance Metrics:', {
      ...data,
      receivedAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Here you would typically store in database or send to monitoring service
    // For now, we'll just log to console
    
    res.status(200).json({ 
      success: true, 
      message: 'Performance metrics recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Performance monitoring error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid performance metrics data' 
    });
  }
});

// User interactions endpoint
router.post('/interactions', async (req: Request, res: Response) => {
  try {
    const data = UserInteractionSchema.parse(req.body);
    
    // Log user interactions
    console.log('User Interactions:', {
      ...data,
      receivedAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Here you would typically store in database or send to analytics service
    
    res.status(200).json({ 
      success: true, 
      message: 'User interactions recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('User interactions error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid user interactions data' 
    });
  }
});

// Error reporting endpoint
router.post('/errors', async (req: Request, res: Response) => {
  try {
    const data = ErrorReportSchema.parse(req.body);
    
    // Log error report
    console.error('Error Report:', {
      ...data,
      receivedAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Here you would typically store in database or send to error monitoring service
    // For critical errors, you might want to send alerts
    
    res.status(200).json({ 
      success: true, 
      message: 'Error report recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reporting error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid error report data' 
    });
  }
});

// Warning monitoring endpoint
router.post('/warnings', async (req: Request, res: Response) => {
  try {
    const data = WarningSchema.parse(req.body);
    
    // Log warning
    console.warn('Warning Report:', {
      ...data,
      receivedAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Here you would typically store in database or send to monitoring service
    
    res.status(200).json({ 
      success: true, 
      message: 'Warning recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Warning monitoring error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid warning data' 
    });
  }
});

// API metrics endpoint
router.post('/api-metrics', async (req: Request, res: Response) => {
  try {
    const data = ApiMetricsSchema.parse(req.body);
    
    // Log API metrics
    console.log('API Metrics:', {
      ...data,
      receivedAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Here you would typically store in database or send to monitoring service
    
    res.status(200).json({ 
      success: true, 
      message: 'API metrics recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API metrics error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid API metrics data' 
    });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  });
});

// Metrics summary endpoint
router.get('/summary', (req: Request, res: Response) => {
  // This would typically aggregate metrics from database
  // For now, return basic system info
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    },
    environment: process.env.NODE_ENV,
  });
});

export default router;
