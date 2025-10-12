#!/bin/bash
# ========================================
# PHIAI AWS Lightsail Deployment Script
# ========================================
# This script deploys PHIAI on AWS Lightsail using Docker Compose

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

print_header "PHIAI AWS Deployment"

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose not installed!"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not installed!"
    exit 1
fi

print_success "All prerequisites installed"

# Check AWS credentials
print_status "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured!"
    echo "Run: aws configure"
    exit 1
fi

print_success "AWS credentials configured"

# Load secrets from AWS Secrets Manager
print_header "Loading Secrets from AWS Secrets Manager"

if [ ! -f "./load-aws-secrets.sh" ]; then
    print_error "load-aws-secrets.sh not found!"
    exit 1
fi

print_status "Fetching secrets..."
source ./load-aws-secrets.sh

if [ -z "$DATABASE_URL" ]; then
    print_error "Failed to load secrets!"
    exit 1
fi

print_success "All secrets loaded"

# Load environment configuration
if [ -f ".env.aws" ]; then
    export $(grep -v '^#' .env.aws | xargs)
    print_success "Environment configuration loaded"
fi

# Stop existing containers
print_header "Stopping Existing Containers"
docker compose -f docker-compose.aws.yml down 2>/dev/null || true
print_success "Stopped existing containers"

# Build containers
print_header "Building Docker Images"
print_warning "This may take 10-15 minutes..."
docker compose -f docker-compose.aws.yml build --no-cache

print_success "Docker images built"

# Start services
print_header "Starting Services"
docker compose -f docker-compose.aws.yml --profile production up -d

print_success "Services started"

# Wait for services to be healthy
print_header "Waiting for Services"
print_status "Waiting 30 seconds for services to initialize..."
sleep 30

# Check service health
print_header "Health Checks"

check_health() {
    local service=$1
    local url=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        print_success "$service is healthy"
        return 0
    else
        print_warning "$service health check failed"
        return 1
    fi
}

check_health "Main App" "http://localhost/health"
check_health "Phi Token" "http://localhost/voice/phi/health"
check_health "Company Token" "http://localhost/voice/company/health"
check_health "Hotel Token" "http://localhost/voice/hotel/health" || true
check_health "Restaurant Token" "http://localhost/voice/restaurant/health" || true
check_health "Hospital Token" "http://localhost/voice/hospital/health" || true

# Show service status
print_header "Service Status"
docker compose -f docker-compose.aws.yml ps

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")

print_header "Deployment Complete!"
echo ""
print_success "PHIAI is now running on AWS Lightsail!"
echo ""
echo "Access URLs:"
echo "  Main App:      http://$PUBLIC_IP/"
echo "  API Health:    http://$PUBLIC_IP/health"
echo "  Phi Voice:     http://$PUBLIC_IP/voice/phi/"
echo "  Company Voice: http://$PUBLIC_IP/voice/company/"
echo ""
echo "Management Commands:"
echo "  View logs:     docker compose -f docker-compose.aws.yml logs -f"
echo "  Restart:       docker compose -f docker-compose.aws.yml restart"
echo "  Stop:          docker compose -f docker-compose.aws.yml down"
echo ""
echo "Next Steps:"
echo "  1. Test the application: http://$PUBLIC_IP/"
echo "  2. Configure DNS to point phiintelligence.com to $PUBLIC_IP"
echo "  3. Update Amplify with backend URL"

