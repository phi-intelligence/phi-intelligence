#!/bin/bash
# ========================================
# SSL Certificate Setup Script
# ========================================

echo "🔒 Setting up SSL certificates for Nginx..."

# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificate for testing
echo "📝 Generating self-signed SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Phi Intelligence/CN=phiintelligence.com"

# Generate DH parameters for enhanced security
echo "🔐 Generating DH parameters..."
openssl dhparam -out nginx/ssl/dhparam.pem 2048

# Set proper permissions
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem
chmod 644 nginx/ssl/dhparam.pem

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificate files:"
echo "   - nginx/ssl/cert.pem (Certificate)"
echo "   - nginx/ssl/key.pem (Private Key)"
echo "   - nginx/ssl/dhparam.pem (DH Parameters)"

echo ""
echo "🔧 To enable SSL in Nginx:"
echo "   1. Uncomment SSL lines in nginx/nginx.conf"
echo "   2. Restart Nginx: docker compose restart nginx"
echo ""
echo "⚠️  Note: This is a self-signed certificate for testing only."
echo "   For production, use Let's Encrypt or a trusted CA certificate."
