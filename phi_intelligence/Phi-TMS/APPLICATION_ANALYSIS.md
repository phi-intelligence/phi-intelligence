# Phi-TMS Application Analysis

**Analysis Date:** December 7, 2024  
**Application Status:** Partially Running

---

## Executive Summary

**Phi-TMS** (Phi Time Management System) is a comprehensive **Project and Employee Management System** built with:
- **Backend:** FastAPI (Python) with SQLAlchemy ORM
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Database:** SQLite (development) / PostgreSQL (production via Docker)
- **Architecture:** RESTful API with JWT authentication

---

## Current Running Status

### ✅ Running Services
1. **Frontend (Docker)**
   - Container: `phi-tms-frontend`
   - Port: `5173`
   - Status: Running (25 hours uptime)
   - URL: http://localhost:5173

2. **PostgreSQL Database (Docker)**
   - Container: `phi-tms-postgres`
   - Port: `5433` (host) → `5432` (container)
   - Status: Running & Healthy (25 hours uptime)
   - Database: `phi_tms_db`
   - User: `phi_tms_user`

### ❌ Not Running
1. **Backend API Server**
   - Expected Port: `5000`
   - Status: **NOT RUNNING**
   - Impact: Frontend cannot communicate with backend API

### 📊 Database Status
- **SQLite Database:** `/backend/phi_tms.db` (508 KB) - exists but may be outdated
- **PostgreSQL:** Running in Docker but backend not connected

---

## Application Architecture

### Backend Structure

```
backend/
├── app/
│   ├── api/v1/          # API Routes
│   │   ├── auth.py      # Authentication endpoints
│   │   ├── attendance.py
│   │   ├── leave.py
│   │   ├── employees.py
│   │   ├── projects.py  # Project management
│   │   ├── tasks.py     # Task management
│   │   ├── timelogs.py  # Time tracking
│   │   └── admin.py     # Admin operations
│   ├── models/          # SQLAlchemy Models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── timelog.py
│   │   ├── attendance.py
│   │   ├── leave.py
│   │   ├── payroll.py
│   │   └── admin.py
│   ├── schemas/         # Pydantic Schemas
│   ├── services/        # Business Logic
│   ├── core/            # Core utilities
│   │   ├── database.py
│   │   ├── security.py
│   │   └── dependencies.py
│   └── middleware/      # Middleware
│       ├── error_handler.py
│       ├── audit_log.py
│       └── rate_limit.py
```

### Frontend Structure

```
frontend/
├── src/
│   ├── pages/           # Page Components
│   │   ├── Dashboard.tsx
│   │   ├── projects/   # Project pages
│   │   ├── tasks/      # Task pages
│   │   ├── attendance/ # Attendance pages
│   │   ├── leave/      # Leave management
│   │   ├── time/       # Time tracking
│   │   └── admin/      # Admin pages
│   ├── components/     # Reusable Components
│   ├── services/       # API Services
│   ├── contexts/        # React Contexts
│   └── types/          # TypeScript Types
```

---

## Core Features & Modules

### 1. **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (RBAC)
- Roles: `ADMIN`, `PROJECT_LEAD`, `EMPLOYEE`
- Password encryption with bcrypt
- Audit logging for security events

### 2. **User & Employee Management**
- User registration (Admin only)
- Employee profiles
- Role management
- User activation/deactivation

### 3. **Project Management**
- Project CRUD operations
- Project status tracking (PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
- Project members & team allocation
- Project documents
- Milestones
- Budget tracking
- Region support (UK, INDIA, BOTH)
- Priority levels (LOW, MEDIUM, HIGH, CRITICAL)

### 4. **Task Management**
- Task CRUD operations
- Task status workflow (TODO → IN_PROGRESS → IN_REVIEW → BLOCKED → DONE)
- Task assignment & reassignment
- Task dependencies
- Task comments & attachments
- Task checklists
- Drag-and-drop task board (using @dnd-kit)
- Task filtering & search

### 5. **Time Tracking**
- Time log entries
- Project-based time logging
- Time approval workflow
- Timesheet views
- Time log notifications

### 6. **Attendance Management**
- Clock in/out functionality
- Attendance status (PRESENT, ABSENT, LEAVE, LATE, HALF_DAY)
- Attendance history
- Admin attendance reports

### 7. **Leave Management**
- Leave types configuration
- Leave balance tracking
- Leave request workflow (PENDING → APPROVED/REJECTED)
- Leave calendar view
- Public holidays
- Admin leave approvals

### 8. **Payroll Management** (Phase 3)
- Salary structure
- Salary components (ALLOWANCE, DEDUCTION, BENEFIT)
- Payroll cycles
- Tax configuration
- Payroll adjustments
- Project cost allocation
- Payroll reports

### 9. **Admin Features**
- Admin dashboard
- System settings
- Audit logs
- Employee management
- Approval workflows

---

## Technology Stack

### Backend
- **Framework:** FastAPI 0.109.0
- **Server:** Uvicorn 0.27.0
- **ORM:** SQLAlchemy 2.0.25 (async)
- **Migrations:** Alembic 1.13.1
- **Authentication:** python-jose (JWT)
- **Password:** passlib[bcrypt]
- **Validation:** Pydantic 2.5.3
- **Database Drivers:**
  - SQLite: aiosqlite 0.19.0
  - PostgreSQL: asyncpg (optional)

### Frontend
- **Framework:** React 18.2.0
- **Language:** TypeScript 5.3.3
- **Build Tool:** Vite 5.0.11
- **Styling:** TailwindCSS 3.4.1
- **Routing:** React Router DOM 6.21.1
- **HTTP Client:** Axios 1.6.5
- **UI Components:** Lucide React (icons)
- **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable
- **Notifications:** react-hot-toast
- **Date Handling:** date-fns 3.6.0

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL 15-alpine (production)
- **Development DB:** SQLite

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - Register new employee (Admin only)
- `POST /change-password` - Change password
- `GET /me` - Get current user

### Projects (`/api/projects`)
- `GET /` - List all projects (with filters)
- `POST /` - Create project
- `GET /{id}` - Get project details
- `PUT /{id}` - Update project
- `DELETE /{id}` - Delete project
- `POST /{id}/members` - Add team member
- `DELETE /{id}/members/{member_id}` - Remove team member
- `GET /{id}/metrics` - Get project metrics
- `GET /{id}/timeline` - Get project timeline
- `PUT /{id}/status` - Update project status

### Tasks (`/api/tasks`)
- `GET /my-tasks` - Get user's assigned tasks
- `GET /{id}` - Get task details
- `POST /` - Create task
- `PUT /{id}` - Update task
- `DELETE /{id}` - Delete task
- `PUT /{id}/status` - Update task status
- `POST /{id}/assign` - Assign task
- `POST /{id}/dependencies` - Add dependency
- `POST /{id}/comments` - Add comment
- `POST /reorder` - Reorder tasks

### Time Logs (`/api/timelogs`)
- `GET /` - List time logs
- `POST /` - Create time log
- `PUT /{id}` - Update time log
- `DELETE /{id}` - Delete time log
- `POST /{id}/approve` - Approve time log
- `POST /{id}/reject` - Reject time log

### Attendance (`/api/attendance`)
- `POST /clock-in` - Clock in
- `POST /clock-out` - Clock out
- `GET /history` - Get attendance history
- `GET /admin` - Admin attendance reports

### Leave (`/api/leave`)
- `GET /types` - Get leave types
- `GET /balance` - Get leave balance
- `POST /request` - Create leave request
- `GET /history` - Get leave history
- `GET /admin` - Admin leave requests
- `POST /{id}/approve` - Approve leave
- `POST /{id}/reject` - Reject leave

### Employees (`/api/employees`)
- `GET /` - List employees
- `GET /{id}` - Get employee details
- `PUT /{id}` - Update employee
- `DELETE /{id}` - Delete employee

### Admin (`/api/admin`)
- `GET /dashboard` - Admin dashboard stats
- `GET /settings` - Get settings
- `PUT /settings` - Update settings
- `GET /audit-logs` - Get audit logs

---

## Database Schema Overview

### Core Tables
- **users** - User accounts & authentication
- **employee_profiles** - Employee details
- **projects** - Project information
- **project_members** - Project team memberships
- **tasks** - Task management
- **task_dependencies** - Task relationships
- **task_comments** - Task discussions
- **task_attachments** - Task files
- **time_logs** - Time tracking entries
- **attendance** - Attendance records
- **leave_requests** - Leave applications
- **leave_balances** - Leave entitlements
- **leave_types** - Leave type configuration
- **public_holidays** - Holiday calendar
- **audit_logs** - System audit trail

### Payroll Tables (Phase 3)
- **salary_structures** - Employee salary configs
- **salary_components** - Salary breakdown
- **payroll_cycles** - Payroll periods
- **payroll_entries** - Payroll records
- **tax_configurations** - Tax settings
- **payroll_adjustments** - Payroll modifications
- **payroll_reports** - Generated reports
- **project_cost_allocations** - Cost tracking

---

## Security Features

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing (bcrypt, 10 rounds)
   - Token-based API access

2. **Authorization**
   - Role-based access control
   - Endpoint-level permissions
   - Resource ownership validation

3. **Security Middleware**
   - Rate limiting (100 requests per 15 minutes)
   - CORS configuration
   - Error handling (no stack traces in production)
   - Audit logging for sensitive operations

4. **Data Protection**
   - Encryption utilities available
   - SQL injection prevention (SQLAlchemy ORM)
   - Input validation (Pydantic schemas)

---

## Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=sqlite:///./phi_tms.db  # or postgresql://...
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=your-32-char-encryption-key-here
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Issues & Recommendations

### 🔴 Critical Issues

1. **Backend Not Running**
   - Backend API server is not running
   - Frontend cannot communicate with backend
   - **Action Required:** Start backend server

2. **Database Mismatch**
   - SQLite database exists but PostgreSQL is running
   - Backend may be configured for SQLite but PostgreSQL is available
   - **Action Required:** Verify database configuration

### ⚠️ Security Concerns

1. **Default Secrets**
   - JWT_SECRET and ENCRYPTION_KEY use default values
   - **Recommendation:** Change in production

2. **CORS Configuration**
   - Currently allows specific origin
   - **Recommendation:** Review CORS settings for production

### 💡 Recommendations

1. **Start Backend Server**
   ```bash
   cd backend
   source venv/bin/activate  # or use Docker
   uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
   ```

2. **Use Docker Compose**
   ```bash
   docker-compose up -d backend
   ```

3. **Database Migration**
   - Run Alembic migrations if using PostgreSQL
   - Verify database schema matches models

4. **Environment Setup**
   - Ensure `.env` files are properly configured
   - Use different secrets for production

5. **Health Checks**
   - Backend health endpoint: `GET /health`
   - Monitor service status

---

## Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000 (not running)
- **API Docs:** http://localhost:5000/docs (FastAPI Swagger)
- **Health Check:** http://localhost:5000/health

---

## Development Workflow

### Starting the Application

1. **Using Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```

2. **Manual Start**
   - Backend: `cd backend && uvicorn app.main:app --reload`
   - Frontend: `cd frontend && npm run dev`

### Database Migrations

```bash
cd backend
alembic upgrade head  # Apply migrations
alembic revision --autogenerate -m "description"  # Create migration
```

### Testing

- Backend tests: `pytest` (if configured)
- Frontend tests: Not configured yet

---

## Summary

**Phi-TMS** is a well-structured, feature-rich Time Management System with:
- ✅ Modern tech stack
- ✅ Comprehensive feature set
- ✅ Good separation of concerns
- ✅ Security best practices
- ❌ Backend service not running
- ⚠️ Configuration needs review

**Next Steps:**
1. Start the backend API server
2. Verify database connectivity
3. Test API endpoints
4. Review and update configuration for production readiness

