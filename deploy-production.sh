#!/bin/bash
# ========================================
# Production Deployment Script with CORS Configuration
# ========================================

set -e  # Exit on any error

echo "🚀 Deploying PHI Intelligence to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get VM's public IP
print_status "Getting VM's public IP..."
VM_IP=$(curl -s ifconfig.me)
if [[ -z "$VM_IP" ]]; then
    VM_IP="20.0.116.69"
    print_warning "Using fallback IP: $VM_IP"
else
    print_success "VM IP: $VM_IP"
fi

# Ask for domain (optional)
echo ""
read -p "Do you have a domain name? (y/n): " has_domain
if [[ $has_domain =~ ^[Yy]$ ]]; then
    read -p "Enter your domain name (e.g., phiintelligence.com): " DOMAIN
    print_success "Domain: $DOMAIN"
else
    DOMAIN=""
    print_warning "Using IP-based configuration: $VM_IP"
fi

# Update CORS configuration
print_status "Updating CORS configuration..."

if [[ -n "$DOMAIN" ]]; then
    # Domain-based CORS
    print_status "Configuring CORS for domain: $DOMAIN"
    
    # Update environment files
    sed -i "s/your-domain.com/$DOMAIN/g" phi_intelligence/.env
    sed -i "s/your-vm-ip/$DOMAIN/g" phi_intelligence/.env
    sed -i "s/your-domain.com/$DOMAIN/g" phi_voice/.env
    sed -i "s/your-vm-ip/$DOMAIN/g" phi_voice/.env
    
    # Update docker-compose.yml
    sed -i "s/your-domain.com/$DOMAIN/g" docker-compose.yml
    sed -i "s/your-vm-ip/$DOMAIN/g" docker-compose.yml
    
    # Update nginx configuration
    sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf
    sed -i "s/your-vm-ip/$DOMAIN/g" nginx/nginx.conf
    
    print_success "CORS configured for domain: $DOMAIN"
else
    # IP-based CORS
    print_status "Configuring CORS for IP: $VM_IP"
    
    # Update environment files
    sed -i "s/your-vm-ip/$VM_IP/g" phi_intelligence/.env
    sed -i "s/your-vm-ip/$VM_IP/g" phi_voice/.env
    
    # Update docker-compose.yml
    sed -i "s/your-vm-ip/$VM_IP/g" docker-compose.yml
    
    # Update nginx configuration
    sed -i "s/your-vm-ip/$VM_IP/g" nginx/nginx.conf
    
    print_success "CORS configured for IP: $VM_IP"
fi

# Check if Docker is running
print_status "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi
print_success "Docker is running"

# Check if docker-compose is available
print_status "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi
print_success "Docker Compose is available"

# Check environment files
print_status "Checking environment files..."
if [ ! -f "phi_intelligence/.env" ]; then
    print_error "phi_intelligence/.env file not found. Please create it with your configuration."
    exit 1
fi

if [ ! -f "phi_voice/.env" ]; then
    print_error "phi_voice/.env file not found. Please create it with your configuration."
    exit 1
fi
print_success "Environment files found"

# Check Nginx configuration
print_status "Checking Nginx configuration..."
if [ ! -f "nginx/nginx.conf" ]; then
    print_error "nginx/nginx.conf file not found."
    exit 1
fi
print_success "Nginx configuration found"

# Create SSL certificates if they don't exist
print_status "Setting up SSL certificates..."
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    print_warning "SSL certificates not found. Generating self-signed certificates..."
    ./nginx/setup-ssl.sh
    print_success "SSL certificates generated"
else
    print_success "SSL certificates already exist"
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true
print_success "Existing containers stopped"

# Build and start services
print_status "Building and starting services..."
docker compose build --no-cache
print_success "Services built successfully"

# Start services with production profile (includes Nginx)
print_status "Starting services with Nginx..."
docker compose --profile production up -d
print_success "Services started successfully"

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check Phi Intelligence
if docker compose exec -T phi_intelligence curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Phi Intelligence is healthy"
else
    print_warning "Phi Intelligence health check failed"
fi

# Check Phi Token Server
if docker compose exec -T phi_token_server python -c "import requests; requests.get('http://localhost:8001/health', timeout=5)" > /dev/null 2>&1; then
    print_success "Phi Token Server is healthy"
else
    print_warning "Phi Token Server health check failed"
fi

# Check Company Token Server
if docker compose exec -T company_token_server python -c "import requests; requests.get('http://localhost:8002/health', timeout=5)" > /dev/null 2>&1; then
    print_success "Company Token Server is healthy"
else
    print_warning "Company Token Server health check failed"
fi

# Check Redis
if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is healthy"
else
    print_warning "Redis health check failed"
fi

# Check Nginx
if docker compose exec -T nginx nginx -t > /dev/null 2>&1; then
    print_success "Nginx configuration is valid"
else
    print_warning "Nginx configuration test failed"
fi

# Test CORS
print_status "Testing CORS configuration..."
if curl -f -H "Origin: http://$VM_IP" http://$VM_IP/health > /dev/null 2>&1; then
    print_success "CORS test passed"
else
    print_warning "CORS test failed - check configuration"
fi

# Display service status
print_status "Service Status:"
docker compose ps

echo ""
print_success "🎉 PHI Intelligence deployed successfully!"
echo ""
echo "🌐 Your application is available at:"

if [[ -n "$DOMAIN" ]]; then
    echo "   Main App (HTTP):  http://$DOMAIN/"
    echo "   Main App (HTTPS): https://$DOMAIN/"
    echo "   Phi Voice:        http://$DOMAIN/voice/phi/"
    echo "   Company Voice:    http://$DOMAIN/voice/company/"
    echo "   API:              http://$DOMAIN/api/"
    echo "   Health Check:     http://$DOMAIN/health"
else
    echo "   Main App (HTTP):  http://$VM_IP/"
    echo "   Main App (HTTPS): https://$VM_IP/"
    echo "   Phi Voice:        http://$VM_IP/voice/phi/"
    echo "   Company Voice:    http://$VM_IP/voice/company/"
    echo "   API:              http://$VM_IP/api/"
    echo "   Health Check:     http://$VM_IP/health"
fi

echo ""
echo "🔧 Management Commands:"
echo "   View logs:        docker compose logs -f"
echo "   Restart Nginx:    docker compose restart nginx"
echo "   Stop all:         docker compose down"
echo "   Update config:    docker compose restart nginx"
echo ""
echo "📊 Monitoring:"
echo "   Service status:   docker compose ps"
echo "   Nginx logs:       docker compose logs nginx"
echo "   All logs:         docker compose logs -f"
echo ""
print_warning "Note: Using self-signed SSL certificate for testing."
print_warning "For production, replace with a trusted certificate."
echo ""
print_success "🚀 Your PHI Intelligence application is now live!"
