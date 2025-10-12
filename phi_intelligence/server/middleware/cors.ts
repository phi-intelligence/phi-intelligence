import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export class CORSService {
  private static getCORSConfig(): CORSConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Production: Strict CORS
      return {
        allowedOrigins: process.env.VITE_ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
        credentials: true,
        maxAge: 86400 // 24 hours
      };
    } else {
      // Development: Use environment variable like production
      return {
        allowedOrigins: process.env.VITE_ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
        credentials: true,
        maxAge: 86400
      };
    }
  }

  static createCORS() {
    const config = this.getCORSConfig();
    
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (config.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: config.allowedMethods,
      allowedHeaders: config.allowedHeaders,
      exposedHeaders: config.exposedHeaders,
      credentials: config.credentials,
      maxAge: config.maxAge,
      preflightContinue: false,
      optionsSuccessStatus: 204
    });
  }

  // CORS error handler
  static handleCORSError(err: any, req: Request, res: Response, next: NextFunction) {
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({
        error: 'CORS: Origin not allowed',
        message: 'The origin of this request is not allowed by CORS policy',
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9)
      });
    }
    next(err);
  }
}
