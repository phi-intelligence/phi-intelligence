CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"author" text NOT NULL,
	"published_at" timestamp DEFAULT now(),
	"read_time" text,
	"tags" text[],
	"featured" boolean DEFAULT false,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"service" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"personal_info" text NOT NULL,
	"experience" text NOT NULL,
	"education" text NOT NULL,
	"skills" text[],
	"cover_letter" text NOT NULL,
	"resume_url" text NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" varchar,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"excerpt" text,
	"content" text,
	"author" text,
	"published_at" timestamp,
	"category" text,
	"tags" text[],
	"image_url" text,
	"read_time" text,
	"is_featured" boolean DEFAULT false,
	"fetch_status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "news_articles_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "news_fetch_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" varchar,
	"status" text NOT NULL,
	"articles_found" integer DEFAULT 0,
	"articles_processed" integer DEFAULT 0,
	"error_message" text,
	"fetch_duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"rss_url" text,
	"api_key" text,
	"last_fetch" timestamp,
	"status" text DEFAULT 'active',
	"priority" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_source_id_news_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."news_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_fetch_logs" ADD CONSTRAINT "news_fetch_logs_source_id_news_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."news_sources"("id") ON DELETE no action ON UPDATE no action;