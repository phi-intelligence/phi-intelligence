# Backend & Admin Authentication System - Detailed Analysis

## 📋 Table of Contents
1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Admin Authentication System](#admin-authentication-system)
3. [Password Management](#password-management)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Security Features](#security-features)
7. [Key Files & Components](#key-files--components)
8. [Current Admin User Setup](#current-admin-user-setup)
9. [Recommendations](#recommendations)

---

## 🏗️ Backend Architecture Overview

### **Technology Stack**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens) using `jose` library
- **Password Hashing**: bcrypt (12 salt rounds)
- **Security**: Helmet, CORS, Rate Limiting

### **Server Entry Point**
**File**: `phi_intelligence/server/index.ts`

**Key Features**:
- Express server with security middleware (Helmet, CORS, Rate Limiting)
- SSL/HTTPS support for production
- Database connection initialization
- Vite dev server integration for development
- Static file serving for production
- Comprehensive error handling and logging

**Port Configuration**:
- Default: `5000` (configurable via `PORT` environment variable)
- HTTP redirect server on port `80` (production)
- HTTPS server on configured port (production)

---

## 🔐 Admin Authentication System

### **Authentication Flow**

1. **Login Process** (`POST /api/admin/login`):
   ```
   Client → Server: { username, password }
   Server → Database: Query admin_users table
   Server → bcrypt: Verify password hash
   Server → JWT: Generate access token (15 min) + refresh token (7 days)
   Server → Client: { user, accessToken } + HttpOnly cookie (refreshToken)
   ```

2. **Token Refresh** (`POST /api/admin/refresh`):
   ```
   Client → Server: Refresh token from HttpOnly cookie
   Server → JWT: Verify refresh token
   Server → JWT: Generate new access token
   Server → Client: { accessToken }
   ```

3. **Protected Routes**:
   - All admin routes use `adminAuthMiddleware`
   - Validates Bearer token in Authorization header
   - Verifies token signature and expiration
   - Checks user exists and is active in database

### **JWT Token Structure**

**Access Token**:
- **Expiration**: 15 minutes
- **Payload**: `{ userId, username, role, iat, exp }`
- **Secret**: `JWT_SECRET` or from Key Vault
- **Algorithm**: HS256

**Refresh Token**:
- **Expiration**: 7 days
- **Payload**: `{ userId, username, role, iat, exp }`
- **Secret**: `JWT_REFRESH_SECRET` or from Key Vault
- **Storage**: HttpOnly cookie (secure, sameSite: strict)

### **Authentication Middleware**

**File**: `phi_intelligence/server/middleware/adminAuth.ts`

**Functionality**:
- Extracts Bearer token from Authorization header
- Verifies JWT token signature and expiration
- Queries database to ensure user exists and is active
- Attaches `adminUser` object to request
- Role-based access control via `requireRole()` middleware

**Usage Example**:
```typescript
app.get('/api/admin/dashboard', adminAuthMiddleware, async (req, res) => {
  // req.adminUser is available here
});
```

---

## 🔑 Password Management

### **Password Hashing**

**File**: `phi_intelligence/server/utils/jwt.ts` (PasswordService class)

**Implementation**:
- **Library**: bcrypt
- **Salt Rounds**: 12 (high security)
- **Methods**:
  - `hashPassword(password: string)`: Creates bcrypt hash
  - `verifyPassword(password: string, hash: string)`: Verifies password against hash

**Security Features**:
- Passwords are NEVER stored in plain text
- bcrypt automatically handles salt generation
- Constant-time comparison prevents timing attacks

### **Password Storage**

**Database Table**: `admin_users`
- Column: `password` (text, NOT NULL)
- Format: bcrypt hash string (e.g., `$2b$12$...`)

**⚠️ Current Issue**: 
The migration file (`0001_admin_schema.sql`) inserts a default admin user with **plain text password**:
```sql
INSERT INTO "admin_users" ("username", "email", "password", "role") 
VALUES ('admin', 'admin@phiintelligence.com', 'admin123', 'admin')
```

**This is a security vulnerability!** The password should be hashed before insertion.

---

## 🗄️ Database Schema

### **Admin Users Table**

**File**: `phi_intelligence/shared/schema.ts`

```typescript
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),  // Should be bcrypt hash
  role: text("role").default("admin"),   // admin, super_admin
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Indexes**:
- `idx_admin_users_username` on `username`
- `idx_admin_users_email` on `email`

### **Related Tables**

1. **contacts**: Contact form submissions with admin management fields
2. **job_applications**: Job applications with admin review fields
3. **jobs**: Job postings (admin can CRUD)
4. **blog_posts**: Blog content management
5. **news_articles**: News aggregation system
6. **voice_sessions**: Voice bot session metrics
7. **voicebot_profiles**: Voice bot configurations

---

## 🌐 API Endpoints

### **Public Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/refresh` | Refresh access token |
| POST | `/api/admin/logout` | Admin logout |

### **Protected Admin Endpoints** (Require `adminAuthMiddleware`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/contacts` | List contacts (with filtering) |
| PUT | `/api/admin/contacts/:id` | Update contact |
| GET | `/api/admin/applications` | List job applications |
| PUT | `/api/admin/applications/:id` | Update application |
| GET | `/api/admin/jobs` | List jobs |
| POST | `/api/admin/jobs` | Create job |
| PUT | `/api/admin/jobs/:id` | Update job |
| DELETE | `/api/admin/jobs/:id` | Delete job |
| GET | `/api/admin/voice-metrics/sessions` | Voice session metrics |
| GET | `/api/admin/voice-metrics/summary` | Voice metrics summary |
| GET | `/api/admin/voice-metrics/voicebots` | Voice bot profiles |

### **Request Format for Protected Routes**

```http
GET /api/admin/dashboard
Authorization: Bearer <access_token>
```

---

## 🛡️ Security Features

### **1. Password Security**
- ✅ bcrypt hashing (12 salt rounds)
- ✅ Passwords never sent in responses
- ⚠️ **Issue**: Default admin password in migration is plain text

### **2. JWT Security**
- ✅ Separate secrets for access and refresh tokens
- ✅ Short-lived access tokens (15 min)
- ✅ Refresh tokens in HttpOnly cookies (XSS protection)
- ✅ Token expiration validation
- ✅ Secure cookie flags (httpOnly, secure, sameSite)

### **3. API Security**
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 requests per 15 minutes per IP)
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection (Drizzle ORM parameterized queries)

### **4. Authentication Security**
- ✅ Bearer token authentication
- ✅ Active user verification
- ✅ Role-based access control
- ✅ Account deactivation support

---

## 📁 Key Files & Components

### **Backend Core Files**

1. **`server/index.ts`**
   - Main server entry point
   - Middleware setup
   - Route registration
   - SSL/HTTPS configuration

2. **`server/routes.ts`**
   - All API route definitions
   - Admin authentication endpoints
   - Protected admin routes
   - Public API routes

3. **`server/services/authService.ts`**
   - `AuthService.authenticateAdmin()`: Login logic
   - `AuthService.refreshAccessToken()`: Token refresh logic
   - Password verification
   - Token generation

4. **`server/middleware/adminAuth.ts`**
   - `adminAuthMiddleware`: JWT verification
   - `requireRole()`: Role-based access control
   - Request augmentation with admin user

5. **`server/utils/jwt.ts`**
   - `JWTService`: Token generation and verification
   - `PasswordService`: Password hashing and verification
   - Secret management (Key Vault or env vars)

6. **`server/database.ts`**
   - Database connection (Neon PostgreSQL)
   - Connection testing
   - Database initialization

7. **`server/databaseStorage.ts`**
   - Database operations abstraction
   - CRUD operations for all entities

8. **`shared/schema.ts`**
   - Drizzle ORM schema definitions
   - TypeScript types
   - Zod validation schemas

### **Frontend Admin Files**

1. **`client/src/contexts/AdminContext.tsx`**
   - Admin authentication context
   - Login/logout functions
   - Token refresh logic
   - Auto-refresh before expiration

2. **`client/src/pages/admin/AdminLogin.tsx`**
   - Admin login UI component

---

## 👤 Current Admin User Setup

### **Default Admin User** (from migration)

**⚠️ SECURITY WARNING**: This is currently stored as **plain text**!

```sql
INSERT INTO "admin_users" ("username", "email", "password", "role") 
VALUES ('admin', 'admin@phiintelligence.com', 'admin123', 'admin')
```

**Credentials**:
- **Username**: `admin`
- **Email**: `admin@phiintelligence.com`
- **Password**: `admin123` (⚠️ **NOT HASHED**)
- **Role**: `admin`

### **How to Create a Proper Admin User**

You need to hash the password before inserting. Here's how:

**Option 1: Using Node.js Script**
```javascript
import bcrypt from 'bcrypt';

const password = 'your_secure_password';
const hash = await bcrypt.hash(password, 12);
console.log(hash); // Use this in SQL INSERT
```

**Option 2: Using Database Function** (if available)
```sql
-- This requires pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO admin_users (username, email, password, role) 
VALUES ('admin', 'admin@phiintelligence.com', crypt('admin123', gen_salt('bf', 12)), 'admin');
```

**Option 3: Create Admin via API** (Recommended)
Create a script or endpoint to create admin users with proper password hashing.

---

## 🔧 Recommendations

### **Critical Security Fixes**

1. **Fix Default Admin Password**:
   - Remove plain text password from migration
   - Create a script to hash and insert admin user
   - Or use a database function with pgcrypto

2. **Add Admin User Creation Endpoint**:
   ```typescript
   POST /api/admin/users (super_admin only)
   - Create new admin users with hashed passwords
   - Validate email format
   - Enforce strong password requirements
   ```

3. **Add Password Reset Functionality**:
   - Email-based password reset
   - Secure token generation
   - Password change endpoint

4. **Enhance Password Requirements**:
   - Minimum length (8+ characters)
   - Complexity requirements
   - Password strength validation

### **Improvements**

1. **Audit Logging**:
   - Log all admin actions
   - Track login attempts
   - Monitor failed authentication

2. **Two-Factor Authentication (2FA)**:
   - Add 2FA support for admin accounts
   - TOTP-based authentication

3. **Session Management**:
   - Track active sessions
   - Allow session revocation
   - Show active sessions in admin panel

4. **Rate Limiting on Login**:
   - Specific rate limit for login endpoint
   - Prevent brute force attacks
   - Account lockout after failed attempts

5. **Environment Variable Documentation**:
   - Document all required environment variables
   - Create `.env.example` file
   - Validate required vars on startup

### **Code Quality**

1. **Error Handling**:
   - Consistent error response format
   - Detailed error logging
   - User-friendly error messages

2. **Testing**:
   - Unit tests for authentication
   - Integration tests for admin routes
   - Password hashing tests

3. **Documentation**:
   - API documentation (OpenAPI/Swagger)
   - Authentication flow diagrams
   - Deployment guides

---

## 📝 Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...

# JWT Secrets
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
SESSION_SECRET=your_session_secret

# API Keys
OPENAI_API_KEY=your_openai_key
LIVEKIT_PHI_URL=...
LIVEKIT_PHI_API_KEY=...
LIVEKIT_PHI_API_SECRET=...
LIVEKIT_COMPANY_URL=...
LIVEKIT_COMPANY_API_KEY=...
LIVEKIT_COMPANY_API_SECRET=...

# Server
PORT=5000
NODE_ENV=production
SKIP_FRONTEND_SERVE=false

# R2 Storage (Cloudflare)
R2_PRIMARY_ACCESS_KEY=...
R2_PRIMARY_SECRET_KEY=...
R2_PRIMARY_BUCKET=...
CLOUDFLARE_ACCOUNT_ID=...
```

---

## 🎯 Summary

### **Strengths**
✅ Modern JWT-based authentication
✅ Secure password hashing (bcrypt)
✅ HttpOnly cookies for refresh tokens
✅ Role-based access control
✅ Comprehensive security middleware
✅ Type-safe with TypeScript
✅ Well-structured codebase

### **Critical Issues**
⚠️ Default admin password stored as plain text in migration
⚠️ No admin user creation endpoint
⚠️ No password reset functionality
⚠️ No password strength validation

### **Next Steps**
1. Fix the default admin password hash in migration
2. Create a script to properly initialize admin users
3. Add admin user management endpoints
4. Implement password reset functionality
5. Add comprehensive logging and monitoring

---

**Last Updated**: 2024-12-19
**Analysis By**: AI Code Analysis
