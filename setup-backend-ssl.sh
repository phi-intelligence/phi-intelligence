#!/bin/bash
# ========================================
# SSL Certificate Setup for Backend API
# ========================================
# This script sets up Let's Encrypt SSL for api.phiintelligence.com
# Run this on the Lightsail VM as root or with sudo

set -e

echo "🔒 Setting up SSL for api.phiintelligence.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root or with sudo"
    exit 1
fi

# Update package list
echo "📦 Updating package list..."
apt-get update -qq

# Install Certbot
echo "📦 Installing Certbot..."
apt-get install -y certbot > /dev/null 2>&1

# Stop nginx container to free port 80
echo "⏸️  Stopping nginx container..."
cd /home/ubuntu/phiai
docker compose -f docker-compose.aws.yml stop nginx

# Wait for port to be free
echo "⏳ Waiting for port 80 to be free..."
sleep 5

# Generate SSL certificate using standalone mode
echo "🔐 Generating SSL certificate for api.phiintelligence.com..."
echo ""
echo "⚠️  You will be asked for:"
echo "   1. Email address (for renewal notifications)"
echo "   2. Agree to Terms of Service (type 'Y')"
echo ""

certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email phi.intelligence.contact@gmail.com \
    --domains api.phiintelligence.com \
    --preferred-challenges http

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate generated successfully!"
    echo ""
else
    echo "❌ Certificate generation failed!"
    exit 1
fi

# Create SSL directory in phiai
echo "📁 Creating SSL directory..."
mkdir -p /home/ubuntu/phiai/nginx/ssl/phiintelligence

# Copy certificates to nginx volume
echo "📋 Copying certificates..."
cp /etc/letsencrypt/live/api.phiintelligence.com/fullchain.pem /home/ubuntu/phiai/nginx/ssl/phiintelligence/
cp /etc/letsencrypt/live/api.phiintelligence.com/privkey.pem /home/ubuntu/phiai/nginx/ssl/phiintelligence/

# Set proper permissions
chmod 644 /home/ubuntu/phiai/nginx/ssl/phiintelligence/fullchain.pem
chmod 600 /home/ubuntu/phiai/nginx/ssl/phiintelligence/privkey.pem

echo "✅ Certificates copied to nginx/ssl/phiintelligence/"

# Start nginx container
echo "🚀 Starting nginx container with SSL..."
cd /home/ubuntu/phiai
docker compose -f docker-compose.aws.yml start nginx

# Wait for nginx to start
sleep 5

# Test nginx configuration
echo ""
echo "🧪 Testing nginx configuration..."
docker compose -f docker-compose.aws.yml exec nginx nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
else
    echo "❌ Nginx configuration has errors!"
    exit 1
fi

# Reload nginx to apply configuration
echo "🔄 Reloading nginx..."
docker compose -f docker-compose.aws.yml exec nginx nginx -s reload

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SSL SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Certificate details:"
echo "   Domain: api.phiintelligence.com"
echo "   Issuer: Let's Encrypt"
echo "   Location: /home/ubuntu/phiai/nginx/ssl/phiintelligence/"
echo "   Expiry: 90 days (auto-renewal recommended)"
echo ""
echo "🌐 Your backend is now available at:"
echo "   https://api.phiintelligence.com"
echo ""
echo "📝 Next steps:"
echo "   1. Update Amplify VITE_API_URL to https://api.phiintelligence.com"
echo "   2. Add all VITE_*_TOKEN_SERVER_URL variables"
echo "   3. Rebuild frontend"
echo ""
echo "🔄 To renew certificate (before 90 days):"
echo "   sudo certbot renew"
echo ""

