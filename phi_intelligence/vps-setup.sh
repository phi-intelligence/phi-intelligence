#!/bin/bash
set -e

echo "🚀 Starting Phi Intelligence VPS Setup..."

# Step 1 - Install build tools and PM2
echo "📦 Installing build tools and PM2..."
apt-get install -y build-essential python3
npm install -g pm2

# Step 2 - Install dependencies
echo "📦 Installing Node dependencies..."
cd /var/www/phi-intelligence
npm ci --legacy-peer-deps

# Step 3 - Set production env
echo "⚙️ Configuring production environment..."
sed -i 's/NODE_ENV=development/NODE_ENV=production/' /var/www/phi-intelligence/.env
# Add SKIP_FRONTEND_SERVE only if not already set
grep -q 'SKIP_FRONTEND_SERVE' /var/www/phi-intelligence/.env || echo "SKIP_FRONTEND_SERVE=true" >> /var/www/phi-intelligence/.env

# Step 4 - Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/phi-intelligence << 'EOF'
server {
    listen 80;
    server_name phiintelligence.com www.phiintelligence.com 213.165.91.219;

    root /var/www/phi-intelligence/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:5000;
    }
}
EOF

ln -sf /etc/nginx/sites-available/phi-intelligence /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
echo "✅ Nginx configured"

# Step 5 - Start app with PM2
echo "🚀 Starting app with PM2..."
cd /var/www/phi-intelligence
pm2 delete phi-intelligence 2>/dev/null || true
pm2 start npm --name "phi-intelligence" -- run start:prod
pm2 save
pm2 startup | tail -1 | bash || true

# Step 6 - Verify
echo ""
echo "✅ Setup complete! Verifying..."
pm2 status
sleep 3
curl -s http://localhost:5000/health && echo "" || echo "⚠️ Health check failed - check pm2 logs"

echo ""
echo "🎉 Phi Intelligence is live at http://213.165.91.219"
echo "📋 Useful commands:"
echo "   pm2 logs phi-intelligence   # View logs"
echo "   pm2 restart phi-intelligence # Restart app"
echo "   pm2 status                  # Check status"
