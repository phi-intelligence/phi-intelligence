import { JWTService, PasswordService } from '../utils/jwt';
import { getDb } from '../database';
import { adminUsers } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export class AuthService {
  // Authenticate admin user
  static async authenticateAdmin(username: string, password: string): Promise<LoginResult> {
    try {
      // Get admin user from database
      const db = await getDb();
      const adminUser = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.username, username))
        .limit(1);
      
      if (!adminUser.length) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      const user = adminUser[0];
      
      // Check if account is active
      if (!user.isActive) {
        return { success: false, error: 'Account is deactivated' };
      }
      
      // Verify password
      const isValidPassword = await PasswordService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Generate tokens
      const accessToken = await JWTService.generateAccessToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      const refreshToken = await JWTService.generateRefreshToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }
  
  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken?: string; error?: string }> {
    try {
      const payload = await JWTService.verifyRefreshToken(refreshToken);
      
      // Generate new access token
      const accessToken = await JWTService.generateAccessToken({
        id: payload.userId,
        username: payload.username,
        role: payload.role
      });
      
      return { accessToken };
    } catch (error) {
      return { error: 'Invalid refresh token' };
    }
  }
}
