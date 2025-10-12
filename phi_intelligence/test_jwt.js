// Simple test for JWT service
import { SignJWT } from 'jose';

console.log('Testing JWT service...');

try {
  const payload = { userId: 'test', username: 'test', role: 'admin' };
  const secret = 'test-secret-123';
  
  console.log('Creating JWT...');
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(new TextEncoder().encode(secret));
  
  console.log('✅ JWT created successfully:', token.substring(0, 50) + '...');
} catch (error) {
  console.error('❌ JWT creation failed:', error);
}
