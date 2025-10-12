#!/bin/bash

# ========================================
# SSL Setup Script for Phi Intelligence
# ========================================
# Manages SSL certificates and Nginx configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSL_DIR="./nginx/ssl"
NGINX_DIR="./nginx"
DOMAIN_NAME=""

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if OpenSSL is installed
    if ! command -v openssl &> /dev/null; then
        print_error "OpenSSL is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Create SSL directory if it doesn't exist
    mkdir -p "$SSL_DIR"
    
    print_success "Prerequisites check passed"
}

# Function to generate self-signed certificate
generate_self_signed() {
    print_status "Generating self-signed SSL certificate..."
    
    local key_file="$SSL_DIR/key.pem"
    local cert_file="$SSL_DIR/cert.pem"
    local dhparam_file="$SSL_DIR/dhparam.pem"
    
    # Generate private key
    openssl genrsa -out "$key_file" 2048
    
    # Generate certificate signing request
    openssl req -new -key "$key_file" -out "$SSL_DIR/cert.csr" -subj "/C=US/ST=State/L=City/O=Phi Intelligence/CN=phiintelligence.com"
    
    # Generate self-signed certificate
    openssl x509 -req -days 365 -in "$SSL_DIR/cert.csr" -signkey "$key_file" -out "$cert_file"
    
    # Generate DH parameters
    openssl dhparam -out "$dhparam_file" 2048
    
    # Clean up CSR
    rm "$SSL_DIR/cert.csr"
    
    # Set proper permissions
    chmod 600 "$key_file"
    chmod 644 "$cert_file"
    chmod 644 "$dhparam_file"
    
    print_success "Self-signed certificate generated successfully"
    print_warning "This certificate is for testing only. Use Let's Encrypt for production."
}

# Function to setup Let's Encrypt certificate
setup_letsencrypt() {
    print_status "Setting up Let's Encrypt certificate..."
    
    if [[ -z "$DOMAIN_NAME" ]]; then
        print_error "Domain name is required for Let's Encrypt. Use --domain option."
        exit 1
    fi
    
    # Check if certbot is available
    if ! command -v certbot &> /dev/null; then
        print_error "Certbot is not installed. Please install it first:"
        echo "  sudo apt-get install certbot"
        exit 1
    fi
    
    # Create certificate
    certbot certonly --standalone -d "$DOMAIN_NAME" --email admin@"$DOMAIN_NAME" --agree-tos --non-interactive
    
    # Copy certificates to SSL directory
    sudo cp "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" "$SSL_DIR/cert.pem"
    sudo cp "/etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem" "$SSL_DIR/key.pem"
    
    # Generate DH parameters
    openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048
    
    # Set proper permissions
    sudo chown $USER:$USER "$SSL_DIR"/*
    chmod 600 "$SSL_DIR/key.pem"
    chmod 644 "$SSL_DIR/cert.pem"
    chmod 644 "$SSL_DIR/dhparam.pem"
    
    print_success "Let's Encrypt certificate setup completed"
}

# Function to setup custom certificates
setup_custom_certs() {
    print_status "Setting up custom SSL certificates..."
    
    local cert_path="$1"
    local key_path="$2"
    
    if [[ ! -f "$cert_path" ]] || [[ ! -f "$key_path" ]]; then
        print_error "Certificate or key file not found"
        exit 1
    fi
    
    # Copy certificates
    cp "$cert_path" "$SSL_DIR/cert.pem"
    cp "$key_path" "$SSL_DIR/key.pem"
    
    # Generate DH parameters
    openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048
    
    # Set proper permissions
    chmod 600 "$SSL_DIR/key.pem"
    chmod 644 "$SSL_DIR/cert.pem"
    chmod 644 "$SSL_DIR/dhparam.pem"
    
    print_success "Custom certificates setup completed"
}

# Function to test SSL configuration
test_ssl() {
    print_status "Testing SSL configuration..."
    
    local cert_file="$SSL_DIR/cert.pem"
    local key_file="$SSL_DIR/key.pem"
    
    if [[ ! -f "$cert_file" ]] || [[ ! -f "$key_file" ]]; then
        print_error "SSL certificates not found. Please generate them first."
        exit 1
    fi
    
    # Test certificate validity
    if openssl x509 -in "$cert_file" -text -noout &> /dev/null; then
        print_success "Certificate is valid"
    else
        print_error "Certificate is invalid"
        exit 1
    fi
    
    # Test private key
    if openssl rsa -in "$key_file" -check -noout &> /dev/null; then
        print_success "Private key is valid"
    else
        print_error "Private key is invalid"
        exit 1
    fi
    
    print_success "SSL configuration test passed"
}

# Function to start Nginx with SSL
start_nginx_ssl() {
    print_status "Starting Nginx with SSL configuration..."
    
    # Test SSL configuration first
    test_ssl
    
    # Start Nginx with production profile
    docker-compose --profile production up -d nginx
    
    if [[ $? -eq 0 ]]; then
        print_success "Nginx started with SSL on ports 80/443"
    else
        print_error "Failed to start Nginx"
        exit 1
    fi
}

# Function to update Nginx configuration with domain
update_nginx_config() {
    if [[ -z "$DOMAIN_NAME" ]]; then
        print_warning "No domain name specified, skipping Nginx domain update"
        return
    fi
    
    print_status "Updating Nginx configuration with domain: $DOMAIN_NAME"
    
    # Update nginx.conf with domain name
    sed -i "s/server_name _;/server_name $DOMAIN_NAME;/g" "$NGINX_DIR/nginx.conf"
    
    print_success "Nginx configuration updated with domain: $DOMAIN_NAME"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  self-signed     - Generate self-signed certificate for testing"
    echo "  letsencrypt     - Setup Let's Encrypt certificate (requires domain)"
    echo "  custom          - Setup custom certificates (requires paths)"
    echo "  test            - Test SSL configuration"
    echo "  start-nginx     - Start Nginx with SSL"
    echo "  help            - Show this help message"
    echo ""
    echo "Options:"
    echo "  --domain NAME   - Domain name for Let's Encrypt"
    echo "  --cert PATH     - Path to custom certificate file"
    echo "  --key PATH      - Path to custom private key file"
    echo ""
    echo "Examples:"
    echo "  $0 self-signed"
    echo "  $0 --domain phiintelligence.com letsencrypt"
    echo "  $0 --cert /path/to/cert.pem --key /path/to/key.pem custom"
    echo "  $0 test"
    echo "  $0 start-nginx"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        --cert)
            CUSTOM_CERT="$2"
            shift 2
            ;;
        --key)
            CUSTOM_KEY="$2"
            shift 2
            ;;
        self-signed)
            COMMAND="self-signed"
            shift
            ;;
        letsencrypt)
            COMMAND="letsencrypt"
            shift
            ;;
        custom)
            COMMAND="custom"
            shift
            ;;
        test)
            COMMAND="test"
            shift
            ;;
        start-nginx)
            COMMAND="start-nginx"
            shift
            ;;
        help|*)
            show_usage
            exit 0
            ;;
    esac
done

# Main script logic
main() {
    check_prerequisites
    
    case "${COMMAND:-help}" in
        self-signed)
            generate_self_signed
            ;;
        letsencrypt)
            setup_letsencrypt
            update_nginx_config
            ;;
        custom)
            if [[ -z "$CUSTOM_CERT" ]] || [[ -z "$CUSTOM_KEY" ]]; then
                print_error "Custom certificate and key paths are required"
                exit 1
            fi
            setup_custom_certs "$CUSTOM_CERT" "$CUSTOM_KEY"
            update_nginx_config
            ;;
        test)
            test_ssl
            ;;
        start-nginx)
            start_nginx_ssl
            ;;
        help|*)
            show_usage
            exit 0
            ;;
    esac
    
    print_success "SSL setup completed successfully!"
}

# Run main function
main "$@"
