# 🌐 Nginx Deployment Guide for PHI Voice Application

## ✅ **What I've Fixed in Your Nginx Configuration**

### **1. 🔧 Corrected Service Names**
- **Before**: `server taskmaster:5000` ❌
- **After**: `server phi_intelligence:5000` ✅
- **Before**: `server phi_voice:8001` ❌  
- **After**: `server phi_token_server:8001` ✅
- **Before**: `server phi_voice:8002` ❌
- **After**: `server company_token_server:8002` ✅

### **2. 🛣️ Proper URL Routing**
- **Main App**: `http://your-vm-ip/` → Phi Intelligence
- **Phi Voice**: `http://your-vm-ip/voice/phi/` → Phi Token Server
- **Company Voice**: `http://your-vm-ip/voice/company/` → Company Token Server
- **API**: `http://your-vm-ip/api/` → Phi Intelligence API
- **Health**: `http://your-vm-ip/health` → Nginx health check

### **3. 🔒 SSL Configuration**
- **HTTP**: Port 80 (working immediately)
- **HTTPS**: Port 443 (SSL certificates commented out for now)
- **Self-signed certificates**: Generated via `nginx/setup-ssl.sh`

---

## 🚀 **Quick Deployment Commands**

### **Option 1: Deploy with Nginx (Recommended)**
```bash
# Deploy everything including Nginx
./deploy-with-nginx.sh
```

### **Option 2: Manual Deployment**
```bash
# 1. Generate SSL certificates
./nginx/setup-ssl.sh

# 2. Deploy with production profile (includes Nginx)
docker compose --profile production up -d

# 3. Check status
docker compose ps
```

### **Option 3: Deploy without Nginx (Direct Access)**
```bash
# Deploy without Nginx (access via ports)
docker compose up -d

# Access via:
# - http://your-vm-ip:5000 (Phi Intelligence)
# - http://your-vm-ip:8001 (Phi Voice)
# - http://your-vm-ip:8002 (Company Voice)
```

---

## 🌐 **Access Your Application**

### **With Nginx (Clean URLs)**
```bash
# Get your VM's public IP
PUBLIC_IP=$(curl -s ifconfig.me)

# Your application URLs
echo "Main App:    http://$PUBLIC_IP/"
echo "Phi Voice:   http://$PUBLIC_IP/voice/phi/"
echo "Company Voice: http://$PUBLIC_IP/voice/company/"
echo "API:         http://$PUBLIC_IP/api/"
echo "Health:      http://$PUBLIC_IP/health"
```

### **Without Nginx (Direct Ports)**
```bash
# Your application URLs
echo "Main App:    http://$PUBLIC_IP:5000/"
echo "Phi Voice:   http://$PUBLIC_IP:8001/"
echo "Company Voice: http://$PUBLIC_IP:8002/"
```

---

## 🔧 **Nginx Management Commands**

### **Check Nginx Status**
```bash
# Check if Nginx is running
docker compose ps nginx

# Test Nginx configuration
docker compose exec nginx nginx -t

# View Nginx logs
docker compose logs nginx
```

### **Restart Nginx**
```bash
# Restart Nginx only
docker compose restart nginx

# Reload Nginx configuration
docker compose exec nginx nginx -s reload
```

### **Update Nginx Configuration**
```bash
# 1. Edit nginx/nginx.conf
nano nginx/nginx.conf

# 2. Test configuration
docker compose exec nginx nginx -t

# 3. Reload if test passes
docker compose exec nginx nginx -s reload
```

---

## 🔒 **SSL Certificate Setup**

### **For Testing (Self-signed)**
```bash
# Generate self-signed certificates
./nginx/setup-ssl.sh

# Uncomment SSL lines in nginx/nginx.conf
# Then restart Nginx
docker compose restart nginx
```

### **For Production (Let's Encrypt)**
```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Get certificate (replace your-domain.com)
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Uncomment SSL lines in nginx/nginx.conf
# Then restart Nginx
docker compose restart nginx
```

---

## 🛡️ **Firewall Configuration**

### **With Nginx (Ports 80, 443)**
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Remove individual service ports (optional)
sudo ufw delete allow 5000
sudo ufw delete allow 8001
sudo ufw delete allow 8002

# Check firewall status
sudo ufw status
```

### **Without Nginx (All Service Ports)**
```bash
# Allow all service ports
sudo ufw allow 5000
sudo ufw allow 8001
sudo ufw allow 8002
sudo ufw allow 6379  # Redis (if needed externally)

# Check firewall status
sudo ufw status
```

---

## 🧪 **Testing Your Deployment**

### **Test All Endpoints**
```bash
# Get your VM's public IP
PUBLIC_IP=$(curl -s ifconfig.me)

# Test main application
curl -f http://$PUBLIC_IP/ && echo "✅ Main app working"

# Test health endpoint
curl -f http://$PUBLIC_IP/health && echo "✅ Health check working"

# Test voice services
curl -f http://$PUBLIC_IP/voice/phi/health && echo "✅ Phi voice working"
curl -f http://$PUBLIC_IP/voice/company/health && echo "✅ Company voice working"

# Test API
curl -f http://$PUBLIC_IP/api/health && echo "✅ API working"
```

### **Test in Browser**
1. Open `http://your-vm-ip/` in your browser
2. Navigate to voice features
3. Test voice functionality
4. Check browser console for any errors

---

## 📊 **Monitoring & Troubleshooting**

### **View All Logs**
```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f nginx
docker compose logs -f phi_intelligence
docker compose logs -f phi_token_server
docker compose logs -f company_token_server
```

### **Check Service Health**
```bash
# Check all services
docker compose ps

# Check individual service health
docker compose exec phi_intelligence curl -f http://localhost:5000/health
docker compose exec phi_token_server python -c "import requests; requests.get('http://localhost:8001/health', timeout=5)"
docker compose exec company_token_server python -c "import requests; requests.get('http://localhost:8002/health', timeout=5)"
```

### **Common Issues & Solutions**

#### **Nginx 502 Bad Gateway**
```bash
# Check if backend services are running
docker compose ps

# Check backend service logs
docker compose logs phi_intelligence
docker compose logs phi_token_server
docker compose logs company_token_server
```

#### **Nginx Configuration Error**
```bash
# Test Nginx configuration
docker compose exec nginx nginx -t

# Check Nginx logs
docker compose logs nginx
```

#### **SSL Certificate Issues**
```bash
# Check certificate files
ls -la nginx/ssl/

# Regenerate certificates
./nginx/setup-ssl.sh
```

---

## 🎉 **You're All Set!**

Your PHI Voice application is now properly configured with Nginx reverse proxy! 

**Key Benefits:**
- ✅ Clean URLs (no ports)
- ✅ Professional setup
- ✅ Security headers
- ✅ Rate limiting
- ✅ SSL ready
- ✅ Load balancing ready

**Next Steps:**
1. Test your application
2. Set up SSL certificates for production
3. Configure your domain name
4. Monitor performance

**Your application is production-ready!** 🚀✨
