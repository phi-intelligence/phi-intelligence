#!/bin/bash
# ========================================
# Deploy Fixes to AWS Lightsail
# ========================================
# This script uploads all fixed files to the VM and rebuilds containers

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

LIGHTSAIL_IP="3.8.127.229"
SSH_KEY="lightsail-key.pem"
SSH_USER="ubuntu"
REMOTE_DIR="~/phiai"

print_header "PHIAI Deployment - Upload Fixes to Lightsail"

# Check SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key not found: $SSH_KEY"
    exit 1
fi

print_success "SSH key found: $SSH_KEY"

# Test SSH connection
print_status "Testing SSH connection to $LIGHTSAIL_IP..."
if ! ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SSH_USER@$LIGHTSAIL_IP "echo 'Connected'" > /dev/null 2>&1; then
    print_error "Cannot connect to Lightsail VM"
    exit 1
fi
print_success "SSH connection successful"

# Create backup on VM
print_header "Creating Backup on VM"
ssh -i "$SSH_KEY" $SSH_USER@$LIGHTSAIL_IP << 'ENDSSH'
cd ~/phiai
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="backup_${timestamp}"
mkdir -p "$backup_dir"
cp -r phi_intelligence "$backup_dir/" 2>/dev/null || true
cp -r phi_voice/token_servers "$backup_dir/" 2>/dev/null || true
cp docker-compose.aws.yml "$backup_dir/" 2>/dev/null || true
echo "✓ Backup created: $backup_dir"
ENDSSH

print_success "Backup created on VM"

# Upload phi_intelligence (backend + frontend source)
print_header "Uploading phi_intelligence (Backend)"
print_status "Uploading phi_intelligence/server..."
scp -i "$SSH_KEY" -r phi_intelligence/server $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/phi_intelligence/

print_status "Uploading phi_intelligence/shared..."
scp -i "$SSH_KEY" -r phi_intelligence/shared $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/phi_intelligence/

print_status "Uploading phi_intelligence configs..."
scp -i "$SSH_KEY" phi_intelligence/package.json $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/phi_intelligence/
scp -i "$SSH_KEY" phi_intelligence/package-lock.json $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/phi_intelligence/
scp -i "$SSH_KEY" phi_intelligence/tsconfig.json $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/phi_intelligence/
scp -i "$SSH_KEY" phi_intelligence/Dockerfile $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/phi_intelligence/
scp -i "$SSH_KEY" phi_intelligence/vite.config.ts $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/phi_intelligence/

print_success "phi_intelligence uploaded"

# Upload phi_voice token_servers
print_header "Uploading Token Servers"
print_status "Uploading all 5 token servers..."
scp -i "$SSH_KEY" -r phi_voice/token_servers $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/phi_voice/

print_success "Token servers uploaded"

# Upload docker-compose and scripts
print_header "Uploading Configuration Files"
scp -i "$SSH_KEY" docker-compose.aws.yml $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/
scp -i "$SSH_KEY" load-aws-secrets.sh $SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/

print_success "Configuration files uploaded"

# Rebuild containers on VM
print_header "Rebuilding Containers on VM"

ssh -i "$SSH_KEY" $SSH_USER@$LIGHTSAIL_IP << 'ENDSSH'
cd ~/phiai

echo "🛑 Stopping containers..."
docker compose -f docker-compose.aws.yml down

echo "🔐 Loading secrets from AWS Secrets Manager..."
chmod +x load-aws-secrets.sh
source ./load-aws-secrets.sh

echo "🔨 Rebuilding containers..."
docker compose -f docker-compose.aws.yml up -d --build

echo "⏳ Waiting for containers to start (30 seconds)..."
sleep 30

echo "📊 Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 Checking phi_intelligence logs:"
docker logs phi_intelligence --tail 10

echo ""
echo "🔍 Checking phi_token_server logs:"
docker logs phi_token_server --tail 10

ENDSSH

print_success "Deployment complete!"

print_header "Next Steps"
echo "1. Configure AWS Amplify environment variables (see DEPLOYMENT-FIXES-APPLIED.md)"
echo "2. Trigger new Amplify build"
echo "3. Test from browser: https://phiintelligence.com"
echo ""
echo "To check container logs:"
echo "  ssh -i $SSH_KEY $SSH_USER@$LIGHTSAIL_IP 'docker logs <container_name>'"
echo ""
echo "To check all container status:"
echo "  ssh -i $SSH_KEY $SSH_USER@$LIGHTSAIL_IP 'docker ps'"

print_success "All done! 🎉"

