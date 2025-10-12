-- Migration: Add admin functionality to existing tables
-- Date: 2024-12-19
-- This migration safely adds admin fields without affecting existing data

-- Add status and notes to contacts table
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'new';
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "notes" text;

-- Add notes to job_applications table
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "notes" text;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "username" text NOT NULL UNIQUE,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "role" text DEFAULT 'admin',
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);

-- Insert default admin user (password: admin123)
-- Note: In production, this should be a properly hashed password
INSERT INTO "admin_users" ("username", "email", "password", "role") 
VALUES ('admin', 'admin@phiintelligence.com', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_contacts_status" ON "contacts" ("status");
CREATE INDEX IF NOT EXISTS "idx_job_applications_status" ON "job_applications" ("status");
CREATE INDEX IF NOT EXISTS "idx_admin_users_username" ON "admin_users" ("username");
CREATE INDEX IF NOT EXISTS "idx_admin_users_email" ON "admin_users" ("email");
