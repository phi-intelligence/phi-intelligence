# 🚀 Complete VM Hosting Guide for PHI Intelligence

## 📋 **Step-by-Step Hosting Process**

### **Phase 1: VM Setup & Preparation**

#### **Step 1: Connect to Your VM**
```bash
# SSH into your Azure VM
ssh your-username@your-vm-public-ip

# Update system packages
sudo apt update && sudo apt upgrade -y
```

#### **Step 2: Install Required Tools**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Install additional tools
sudo apt install curl wget unzip -y

# Logout and login again to apply Docker group changes
exit
# SSH back in
ssh your-username@your-vm-public-ip
```

#### **Step 3: Configure Firewall**
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### **Phase 2: Upload Application to VM**

#### **Step 4: Upload Your Application**
```bash
# Option A: Using SCP (from your local machine)
scp -r /home/phi/Desktop/Phi-Intelligence/PHIAI your-username@your-vm-ip:/home/your-username/

# Option B: Using Git (if you have a repository)
git clone https://github.com/your-username/PHIAI.git
cd PHIAI

# Option C: Using rsync (recommended for large files)
rsync -avz --progress /home/phi/Desktop/Phi-Intelligence/PHIAI/ your-username@your-vm-ip:/home/your-username/PHIAI/
```

#### **Step 5: Navigate to Application Directory**
```bash
# On your VM
cd PHIAI
ls -la  # Verify all files are present
```

### **Phase 3: Environment Configuration**

#### **Step 6: Configure Environment Variables**

**Update phi_intelligence/.env for Production:**
```bash
nano phi_intelligence/.env
```

**Replace with production values:**
```bash
# =============================================================================
# PHI INTELLIGENCE APPLICATION ENVIRONMENT CONFIGURATION
# =============================================================================
# Production environment configuration

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb

# Redis (Redis Cloud)
REDIS_URL=rediss://:your-password@your-db.redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345

# LiveKit (LiveKit Cloud)
LIVEKIT_PHI_URL=wss://your-project.livekit.cloud
LIVEKIT_PHI_API_KEY=your-livekit-api-key
LIVEKIT_PHI_API_SECRET=your-livekit-secret

LIVEKIT_COMPANY_URL=wss://your-project.livekit.cloud
LIVEKIT_COMPANY_API_KEY=your-livekit-api-key
LIVEKIT_COMPANY_API_SECRET=your-livekit-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=phi

# Production settings
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# CORS Configuration (IMPORTANT!)
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip
VITE_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-here

# File upload settings
MAX_RESUME_SIZE=10485760
ALLOWED_RESUME_TYPES=pdf,docx,doc,txt

# Cloudflare R2 Storage
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

**Update phi_voice/.env for Production:**
```bash
nano phi_voice/.env
```

**Replace with production values:**
```bash
# =============================================================================
# PHI VOICE SERVICES ENVIRONMENT CONFIGURATION
# =============================================================================
# Production environment configuration

# Redis (Redis Cloud)
REDIS_HOST=your-db.redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-password
REDIS_SSL=true

# LiveKit (LiveKit Cloud)
LIVEKIT_PHI_URL=wss://your-project.livekit.cloud
LIVEKIT_PHI_API_KEY=your-livekit-api-key
LIVEKIT_PHI_API_SECRET=your-livekit-secret

LIVEKIT_COMPANY_URL=wss://your-project.livekit.cloud
LIVEKIT_COMPANY_API_KEY=your-livekit-api-key
LIVEKIT_COMPANY_API_SECRET=your-livekit-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=phi

# Production settings
ENVIRONMENT=production
NODE_ENV=production
```

### **Phase 4: CORS Configuration**

#### **Step 7: Configure CORS Properly**

**Update docker-compose.yml CORS settings:**
```bash
nano docker-compose.yml
```

**Find the environment section for phi_intelligence and update:**
```yaml
environment:
  - ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip
  - VITE_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip
  - REDIS_URL=redis://redis:6379
  - NODE_ENV=production
  - PORT=5000
```

**Update Nginx CORS headers in nginx/nginx.conf:**
```bash
nano nginx/nginx.conf
```

**Add CORS headers to the server blocks:**
```nginx
# Add this to both HTTP and HTTPS server blocks
add_header Access-Control-Allow-Origin "https://your-domain.com" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
add_header Access-Control-Allow-Credentials "true" always;

# Handle preflight requests
if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin "https://your-domain.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Access-Control-Max-Age 1728000;
    add_header Content-Type 'text/plain charset=UTF-8';
    add_header Content-Length 0;
    return 204;
}
```

### **Phase 5: Domain Configuration (Optional)**

#### **Step 8: Configure Domain Name (If You Have One)**

**Update your domain's DNS:**
```
A Record: your-domain.com → your-vm-public-ip
A Record: www.your-domain.com → your-vm-public-ip
```

**Update environment files with your domain:**
```bash
# Replace all instances of "your-domain.com" with your actual domain
sed -i 's/your-domain.com/your-actual-domain.com/g' phi_intelligence/.env
sed -i 's/your-vm-ip/your-actual-domain.com/g' phi_intelligence/.env
```

### **Phase 6: SSL Certificate Setup**

#### **Step 9: Generate SSL Certificates**

**For testing (self-signed):**
```bash
./nginx/setup-ssl.sh
```

**For production (Let's Encrypt):**
```bash
# Install Certbot
sudo apt install certbot -y

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Set proper permissions
sudo chmod 644 nginx/ssl/cert.pem
sudo chmod 600 nginx/ssl/key.pem
```

**Enable SSL in nginx.conf:**
```bash
nano nginx/nginx.conf
```

**Uncomment the SSL lines in the HTTPS server block:**
```nginx
# Uncomment these lines:
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
ssl_dhparam /etc/nginx/ssl/dhparam.pem;
```

### **Phase 7: Deployment**

#### **Step 10: Deploy the Application**

**Deploy with Nginx (Recommended):**
```bash
# Make scripts executable
chmod +x deploy-with-nginx.sh
chmod +x nginx/setup-ssl.sh

# Deploy everything
./deploy-with-nginx.sh
```

**Or deploy manually:**
```bash
# Generate SSL certificates
./nginx/setup-ssl.sh

# Deploy with production profile
docker compose --profile production up -d

# Check status
docker compose ps
```

#### **Step 11: Verify Deployment**

**Check all services:**
```bash
# Check service status
docker compose ps

# Check logs
docker compose logs -f

# Test endpoints
curl -f http://localhost/health
curl -f http://localhost/voice/phi/health
curl -f http://localhost/voice/company/health
```

**Test from external access:**
```bash
# Get your VM's public IP
curl -s ifconfig.me

# Test your application
curl -f http://your-vm-ip/health
```

### **Phase 8: Monitoring & Maintenance**

#### **Step 12: Set Up Monitoring**

**View logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f phi_intelligence
docker compose logs -f nginx
```

**Monitor resources:**
```bash
# Check Docker stats
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

#### **Step 13: Set Up Auto-renewal (For Let's Encrypt)**

**Create renewal script:**
```bash
sudo nano /etc/cron.d/certbot-renewal
```

**Add this content:**
```
0 12 * * * root certbot renew --quiet --post-hook "docker compose -f /home/your-username/PHIAI/docker-compose.yml restart nginx"
```

### **Phase 9: Security Hardening**

#### **Step 14: Additional Security**

**Update system:**
```bash
sudo apt update && sudo apt upgrade -y
```

**Install fail2ban:**
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

**Configure automatic updates:**
```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 🌐 **Final Access URLs**

### **With Domain (Production):**
```bash
https://your-domain.com/                    # Main app
https://your-domain.com/voice/phi/          # Phi voice
https://your-domain.com/voice/company/      # Company voice
https://your-domain.com/api/                # API
```

### **With IP Only:**
```bash
http://your-vm-ip/                          # Main app
http://your-vm-ip/voice/phi/                # Phi voice
http://your-vm-ip/voice/company/            # Company voice
http://your-vm-ip/api/                      # API
```

## 🔧 **Troubleshooting Commands**

### **Common Issues:**

**Service not starting:**
```bash
docker compose logs service-name
docker compose restart service-name
```

**CORS issues:**
```bash
# Check CORS headers
curl -H "Origin: https://your-domain.com" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS http://your-vm-ip/api/
```

**SSL issues:**
```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

**Nginx issues:**
```bash
# Test Nginx configuration
docker compose exec nginx nginx -t

# Reload Nginx
docker compose exec nginx nginx -s reload
```

## ✅ **Deployment Checklist**

- [ ] VM setup complete
- [ ] Docker and Docker Compose installed
- [ ] Application uploaded to VM
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Domain DNS configured (if applicable)
- [ ] SSL certificates generated
- [ ] Application deployed successfully
- [ ] All services healthy
- [ ] External access working
- [ ] Monitoring set up
- [ ] Security hardening complete

**Your PHI Intelligence application is now live and accessible!** 🎉✨
