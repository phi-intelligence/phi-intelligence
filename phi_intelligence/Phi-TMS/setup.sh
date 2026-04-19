#!/bin/bash

# Phi-TMS Setup Script
echo "🚀 Setting up Phi-TMS Project and Employee Management System..."
echo ""

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Create environment files if they don't exist
echo "📝 Creating environment files..."

if [ ! -f backend/.env ]; then
    cat > backend/.env << EOF
# Application
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://phi_tms_user:phi_tms_password_2024@postgres:5432/phi_tms_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h

# Encryption (for sensitive data like bank details)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping...${NC}"
fi

if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env already exists, skipping...${NC}"
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo ""
echo "📦 Installing backend dependencies..."
docker-compose exec backend npm install

echo ""
echo "🗄️  Running database migrations..."
docker-compose exec backend npx prisma generate
docker-compose exec backend npx prisma migrate deploy

echo ""
echo "🌱 Seeding database with initial data..."
docker-compose exec backend npm run seed

echo ""
echo "📦 Installing frontend dependencies..."
docker-compose exec frontend npm install

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 Phi-TMS is now running!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📧 Default Credentials:"
echo "   Admin:"
echo "     Email: admin@phi-tms.com"
echo "     Password: Admin@123"
echo ""
echo "   Developers (same password):"
echo "     sreeharipc@phiintelligence.com"
echo "     melbinproy@phiintelligence.com"
echo "     Password: Phi_Tmspass"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Access backend shell: docker-compose exec backend sh"
echo "   Access database: docker-compose exec postgres psql -U phi_tms_user -d phi_tms_db"
echo ""






