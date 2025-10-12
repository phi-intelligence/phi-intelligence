import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcrypt';
import { webcrypto } from 'crypto';
import keyVaultService from '../services/keyVaultService';

// Ensure crypto is available for Node.js
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  tokenType: 'access' | 'refresh';
  iat: number;
  exp: number;
}

// Jose library JWTPayload type
type JoseJWTPayload = {
  [key: string]: any;
  iat?: number;
  exp?: number;
};

export class JWTService {
  private static async getSecrets() {
    try {
      const secrets = await keyVaultService.getJWTSecrets();
      return {
        accessSecret: secrets.accessSecret,
        refreshSecret: secrets.refreshSecret
      };
    } catch (error) {
      console.warn('Failed to get JWT secrets from Key Vault, using environment variables');
      return {
        accessSecret: process.env.JWT_SECRET!,
        refreshSecret: process.env.JWT_REFRESH_SECRET!
      };
    }
  }
  
  // Generate access token (15 minutes)
  static async generateAccessToken(user: { id: string; username: string; role: string }): Promise<string> {
    const { accessSecret } = await this.getSecrets();
    const payload: Omit<JWTPayload, 'iat' | 'exp' | 'tokenType'> = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .setIssuer('phi_intelligence-app')
      .setAudience('admin-users')
      .sign(new TextEncoder().encode(accessSecret));
  }
  
  // Generate refresh token (7 days)
  static async generateRefreshToken(user: { id: string; username: string; role: string }): Promise<string> {
    const { refreshSecret } = await this.getSecrets();
    const payload: Omit<JWTPayload, 'iat' | 'exp' | 'tokenType'> = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .setIssuer('phi_intelligence-app')
      .setAudience('admin-users')
      .sign(new TextEncoder().encode(refreshSecret));
  }
  
  // Verify access token
  static async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const { accessSecret } = await this.getSecrets();
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(accessSecret)
      );
      
      // Convert Jose payload to our JWTPayload format
      const josePayload = payload as JoseJWTPayload;
      return {
        userId: josePayload.userId,
        username: josePayload.username,
        role: josePayload.role,
        tokenType: 'access',
        iat: josePayload.iat || 0,
        exp: josePayload.exp || 0
      };
    } catch (error: any) {
      if (error.code === 'ERR_JWT_EXPIRED') {
        throw new Error('Token expired');
      }
      throw new Error('Invalid token');
    }
  }
  
  // Verify refresh token
  static async verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
      const { refreshSecret } = await this.getSecrets();
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(refreshSecret)
      );
      
      // Convert Jose payload to our JWTPayload format
      const josePayload = payload as JoseJWTPayload;
      return {
        userId: josePayload.userId,
        username: josePayload.username,
        role: josePayload.role,
        tokenType: 'refresh',
        iat: josePayload.iat || 0,
        exp: josePayload.exp || 0
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

export class PasswordService {
  // Hash password with bcrypt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
  
  // Verify password against hash
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
