import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import keyVaultService from './services/keyVaultService';

// Database connection - will be initialized when needed
let sql: any = null;
let db: any = null;

async function getDatabase() {
  if (!sql || !db) {
    // Try Key Vault first, fallback to environment
    let databaseUrl: string;
    try {
      databaseUrl = await keyVaultService.getDatabaseUrl('phi');
    } catch (error) {
      console.warn('Failed to get database URL from Key Vault, using environment variable');
      databaseUrl = process.env.DATABASE_URL || '';
    }
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not available from Key Vault or environment variables');
    }
    
    sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
  }
  return { sql, db };
}

export async function getDb() {
  const { db } = await getDatabase();
  return db;
}

export async function getSql() {
  const { sql } = await getDatabase();
  return sql;
}

// Test database connection
export async function testConnection() {
  try {
    const { sql } = await getDatabase();
    const result = await sql`SELECT version()`;
    console.log('✅ Database connected successfully');
    console.log('📊 Database version:', result[0]?.version);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database with sample data
export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database with sample data...');
    
    // Check if we already have data
    const db = await getDb();
    const existingJobs = await db.select().from(schema.jobs);
    if (existingJobs.length > 0) {
      console.log('ℹ️ Database already contains data, skipping initialization');
      return;
    }

    // Insert sample jobs
    const sampleJobs = [
      {
        title: "Senior AI Engineer",
        location: "London, UK",
        type: "Full Time",
        description: "Lead the development of cutting-edge AI solutions, working with machine learning models and natural language processing systems.",
        requirements: ["Python", "TensorFlow", "AWS", "Docker"],
        isActive: true
      },
      {
        title: "Product Manager - AI Solutions",
        location: "London, UK",
        type: "Full Time",
        description: "Drive product strategy and roadmap for our AI platforms, collaborating with engineering and client success teams.",
        requirements: ["Product Strategy", "AI/ML", "Agile", "Leadership"],
        isActive: true
      },
      {
        title: "Frontend Developer",
        location: "London, UK",
        type: "Full Time",
        description: "Build beautiful and intuitive user interfaces for our AI-powered applications using modern web technologies.",
        requirements: ["React", "TypeScript", "Three.js", "Tailwind CSS"],
        isActive: true
      }
    ];

    await db.insert(schema.jobs).values(sampleJobs);
    console.log('✅ Sample jobs inserted');

    // Insert sample blog posts
    const samplePosts = [
      {
        title: "The Future of AI in Small Business Operations",
        slug: "future-ai-small-business",
        excerpt: "Explore how artificial intelligence is transforming small and medium businesses, from customer service automation to predictive analytics.",
        content: "Full article content here...",
        author: "Phi Intelligence Team",
        readTime: "8 min read",
        tags: ["AI", "Business", "Technology"],
        featured: true
      },
      {
        title: "Case Study: 40% Efficiency Boost",
        slug: "case-study-efficiency-boost",
        excerpt: "How our workforce management solution helped a retail chain improve operational efficiency.",
        content: "Case study content here...",
        author: "Sarah Johnson",
        readTime: "6 min read",
        tags: ["Case Study", "Efficiency", "Retail"],
        featured: false
      },
      {
        title: "AI Development Best Practices",
        slug: "ai-development-best-practices",
        excerpt: "Essential guidelines for building robust and scalable AI applications for business use.",
        content: "Best practices content here...",
        author: "Tech Team",
        readTime: "10 min read",
        tags: ["Development", "Best Practices", "AI"],
        featured: false
      }
    ];

    await db.insert(schema.blogPosts).values(samplePosts);
    console.log('✅ Sample blog posts inserted');

    // Insert sample contacts
    const sampleContacts = [
      {
        name: "John Smith",
        email: "john.smith@techcorp.com",
        company: "TechCorp Solutions",
        service: "voice-agents",
        message: "Interested in implementing voice agents for our customer service department."
      },
      {
        name: "Sarah Johnson",
        email: "sarah.j@retailplus.com",
        company: "RetailPlus Inc.",
        service: "workforce-management",
        message: "Looking for workforce management solutions to optimize our retail operations."
      },
      {
        name: "Michael Chen",
        email: "mchen@healthcare-ai.com",
        company: "Healthcare AI Systems",
        service: "ai-consulting",
        message: "Need strategic guidance on AI adoption in healthcare sector."
      }
    ];

    await db.insert(schema.contacts).values(sampleContacts);
    console.log('✅ Sample contacts inserted');

    console.log('🎉 Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
