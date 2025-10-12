-- Migration: Add contact management enhancements
-- Date: 2024-08-30
-- Description: Add priority, source, response tracking, and assignment fields to contacts table

-- Add new columns to contacts table
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "priority" text DEFAULT 'medium';
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "source" text DEFAULT 'contact_form';
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "response_time_hours" integer;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "last_contacted_at" timestamp;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "assigned_to" text;

-- Add new columns to job_applications table
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'new';
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "priority" text DEFAULT 'medium';
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "rating" integer;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "assigned_to" text;
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "interview_date" timestamp;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "contacts_priority_idx" ON "contacts" ("priority");
CREATE INDEX IF NOT EXISTS "contacts_source_idx" ON "contacts" ("source");
CREATE INDEX IF NOT EXISTS "contacts_assigned_to_idx" ON "contacts" ("assigned_to");
CREATE INDEX IF NOT EXISTS "contacts_last_contacted_idx" ON "contacts" ("last_contacted_at");

CREATE INDEX IF NOT EXISTS "job_applications_status_idx" ON "job_applications" ("status");
CREATE INDEX IF NOT EXISTS "job_applications_priority_idx" ON "job_applications" ("priority");
CREATE INDEX IF NOT EXISTS "job_applications_assigned_to_idx" ON "job_applications" ("assigned_to");
CREATE INDEX IF NOT EXISTS "job_applications_interview_date_idx" ON "job_applications" ("interview_date");

-- Add constraints for valid values
ALTER TABLE "contacts" ADD CONSTRAINT IF NOT EXISTS "contacts_priority_check" 
  CHECK ("priority" IN ('low', 'medium', 'high'));

ALTER TABLE "contacts" ADD CONSTRAINT IF NOT EXISTS "contacts_source_check" 
  CHECK ("source" IN ('contact_form', 'career_page', 'referral', 'other'));

ALTER TABLE "job_applications" ADD CONSTRAINT IF NOT EXISTS "job_applications_status_check" 
  CHECK ("status" IN ('new', 'reviewing', 'interviewing', 'offered', 'rejected'));

ALTER TABLE "job_applications" ADD CONSTRAINT IF NOT EXISTS "job_applications_priority_check" 
  CHECK ("priority" IN ('low', 'medium', 'high'));

-- Update existing records to have default values
UPDATE "contacts" SET "priority" = 'medium' WHERE "priority" IS NULL;
UPDATE "contacts" SET "source" = 'contact_form' WHERE "source" IS NULL;
UPDATE "job_applications" SET "status" = 'new' WHERE "status" IS NULL;
UPDATE "job_applications" SET "priority" = 'medium' WHERE "priority" IS NULL;
