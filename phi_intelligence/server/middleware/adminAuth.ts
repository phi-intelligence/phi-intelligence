import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { getDb } from '../database';
import { adminUsers } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: string;
        username: string;
        email: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

export interface AdminAuthRequest extends Request {
  adminUser: {
    id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const payload = await JWTService.verifyAccessToken(token);
    
    // Get admin user from database
    const adminUser = await getDb()
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, payload.userId))
      .limit(1);

    if (!adminUser.length || !adminUser[0].isActive) {
      return res.status(401).json({ 
        error: 'Admin user not found or inactive.' 
      });
    }

    req.adminUser = adminUser[0];
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'Token expired') {
      return res.status(401).json({ 
        error: 'Token expired. Please refresh your token.' 
      });
    }
    
    console.error('Admin auth error:', error);
    return res.status(401).json({ 
      error: 'Invalid token.' 
    });
  }
};

// Middleware to check specific role
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.adminUser.role !== requiredRole && req.adminUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    next();
  };
};
