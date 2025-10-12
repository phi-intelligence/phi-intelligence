#!/bin/bash

# ========================================
# Phi Intelligence Production Deployment Script
# ========================================
# Complete deployment automation for Docker containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="Phi Intelligence"
COMPOSE_FILE="docker-compose.yml"

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

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is running"
}

# Function to check environment files
check_environment() {
    print_status "Checking environment configuration..."
    
    # Check phi_intelligence environment
    if [[ ! -f "phi_intelligence/.env" ]]; then
        print_error "phi_intelligence/.env file not found. Please create it first."
        exit 1
    fi
    
    # Check Phi Voice environment
    if [[ ! -f "phi_voice/.env" ]]; then
        print_error "phi_voice/.env file not found. Please create it first."
        exit 1
    fi
    
    # Check required environment variables
    local missing_vars=()
    
    # phi_intelligence required vars
    if ! grep -q "VITE_LIVEKIT_URL" phi_intelligence/.env; then
        missing_vars+=("VITE_LIVEKIT_URL in phi_intelligence/.env")
    fi
    
    if ! grep -q "DATABASE_URL" phi_intelligence/.env; then
        missing_vars+=("DATABASE_URL in phi_intelligence/.env")
    fi
    
    # Phi Voice required vars (Token servers only - agents run on LiveKit Cloud)
    if ! grep -q "LIVEKIT_URL" phi_voice/.env; then
        missing_vars+=("LIVEKIT_URL in phi_voice/.env")
    fi
    
    if ! grep -q "OPENAI_API_KEY" phi_voice/.env; then
        missing_vars+=("OPENAI_API_KEY in phi_voice/.env")
    fi
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_success "Environment configuration is valid"
}

# Function to build containers
build_containers() {
    print_status "Building Docker containers..."
    
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    if [[ $? -eq 0 ]]; then
        print_success "Containers built successfully"
    else
        print_error "Failed to build containers"
        exit 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    docker-compose -f "$COMPOSE_FILE" up -d
    
    if [[ $? -eq 0 ]]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to be ready
    sleep 10
    
    local healthy_services=0
    local total_services=5
    
    # Check phi_intelligence
    if docker-compose -f "$COMPOSE_FILE" ps phi_intelligence | grep -q "healthy"; then
        print_success "phi_intelligence is healthy"
        ((healthy_services++))
    else
        print_warning "phi_intelligence health check failed"
    fi
    
    # Check Phi Token Server
    if docker-compose -f "$COMPOSE_FILE" ps phi_token_server | grep -q "healthy"; then
        print_success "Phi Token Server is healthy"
        ((healthy_services++))
    else
        print_warning "Phi Token Server health check failed"
    fi
    
    # Check Company Token Server
    if docker-compose -f "$COMPOSE_FILE" ps company_token_server | grep -q "healthy"; then
        print_success "Company Token Server is healthy"
        ((healthy_services++))
    else
        print_warning "Company Token Server health check failed"
    fi
    
    # Check Redis
    if docker-compose -f "$COMPOSE_FILE" ps redis | grep -q "healthy"; then
        print_success "Redis is healthy"
        ((healthy_services++))
    else
        print_warning "Redis health check failed"
    fi
    
    # Check if all services are running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        print_success "All services are running"
        ((healthy_services++))
    else
        print_warning "Some services are not running"
    fi
    
    print_status "Health check complete: $healthy_services/$total_services services healthy"
}

# Function to show service status
show_status() {
    print_status "Service status:"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    
    if [[ -z "$service" ]]; then
        print_status "Showing logs for all services..."
        docker-compose -f "$COMPOSE_FILE" logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose -f "$COMPOSE_FILE" logs -f "$service"
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose -f "$COMPOSE_FILE" restart
    print_success "Services restarted"
}

# Function to enable monitoring profile
enable_monitoring() {
    print_status "Starting monitoring services..."
    docker-compose -f "$COMPOSE_FILE" --profile monitoring up -d redis-commander
    print_success "Monitoring enabled (Redis Commander on port 8080)"
}

# Function to enable production profile
enable_production() {
    print_status "Starting production services..."
    docker-compose -f "$COMPOSE_FILE" --profile production up -d nginx
    print_success "Production mode enabled (Nginx on ports 80/443)"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy      - Build and start all services"
    echo "  build       - Build containers only"
    echo "  start       - Start services only"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  status      - Show service status"
    echo "  logs        - Show logs (all services)"
    echo "  logs [SVC]  - Show logs for specific service"
    echo "  health      - Check service health"
    echo "  monitor     - Enable monitoring profile"
    echo "  production  - Enable production profile"
    echo "  clean       - Remove containers and volumes"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 logs phi_intelligence"
    echo "  $0 monitor"
}

# Function to clean up
clean_up() {
    print_status "Cleaning up containers and volumes..."
    
    read -p "Are you sure you want to remove all containers and volumes? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Main script logic
main() {
    cd "$SCRIPT_DIR"
    
    case "${1:-help}" in
        deploy)
            check_docker
            check_environment
            build_containers
            start_services
            check_health
            show_status
            print_success "Deployment completed successfully!"
            ;;
        build)
            check_docker
            check_environment
            build_containers
            ;;
        start)
            check_docker
            start_services
            check_health
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            check_health
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2"
            ;;
        health)
            check_health
            ;;
        monitor)
            enable_monitoring
            ;;
        production)
            enable_production
            ;;
        clean)
            clean_up
            ;;
        help|*)
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"
