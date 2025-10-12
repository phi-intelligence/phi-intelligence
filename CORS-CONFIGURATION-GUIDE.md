# 🔧 Complete CORS Configuration Guide

## 🎯 **CORS Configuration for PHI Intelligence**

### **What is CORS?**
CORS (Cross-Origin Resource Sharing) allows your web application to make requests to your API from different domains. Without proper CORS configuration, browsers will block requests from your frontend to your backend.

## 📋 **Step-by-Step CORS Configuration**

### **Step 1: Update Environment Variables**

#### **phi_intelligence/.env**
```bash
# CORS Configuration - Replace with your actual domains
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip,http://localhost:3000,http://localhost:5000

# Frontend CORS (VITE_* variables are exposed to frontend)
VITE_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip

# Additional CORS settings
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Origin,X-Requested-With,Content-Type,Accept,Authorization
```

#### **phi_voice/.env**
```bash
# CORS for voice services
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip
```

### **Step 2: Update Docker Compose Environment**

#### **docker-compose.yml**
```yaml
services:
  phi_intelligence:
    environment:
      # CORS Configuration
      - ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip
      - VITE_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip
      - CORS_CREDENTIALS=true
      - CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
      - CORS_HEADERS=Origin,X-Requested-With,Content-Type,Accept,Authorization
      # ... other environment variables

  phi_token_server:
    environment:
      - ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip
      # ... other environment variables

  company_token_server:
    environment:
      - ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip
      # ... other environment variables
```

### **Step 3: Update Nginx CORS Headers**

#### **nginx/nginx.conf**
```nginx
http {
    # Add CORS map for dynamic origin handling
    map $http_origin $cors_origin {
        default "";
        "~^https://your-domain\.com$" $http_origin;
        "~^https://www\.your-domain\.com$" $http_origin;
        "~^http://your-vm-ip$" $http_origin;
        "~^https://your-vm-ip$" $http_origin;
        "~^http://localhost:3000$" $http_origin;
        "~^http://localhost:5000$" $http_origin;
    }

    server {
        listen 80;
        server_name _;

        # CORS Headers
        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin $cors_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }

        # Your existing location blocks...
    }

    server {
        listen 443 ssl http2;
        server_name _;

        # Same CORS headers for HTTPS
        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;

        # Handle preflight requests for HTTPS
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin $cors_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }

        # Your existing location blocks...
    }
}
```

### **Step 4: Update Backend CORS Configuration**

#### **phi_intelligence/server/middleware/cors.ts** (if exists)
```typescript
import cors from 'cors';

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 200
};

export default cors(corsOptions);
```

### **Step 5: Update Frontend API Configuration**

#### **phi_intelligence/client/src/services/api.ts** (if exists)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for CORS
apiClient.interceptors.request.use(
  (config) => {
    // Add origin header if needed
    config.headers['Origin'] = window.location.origin;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## 🔧 **CORS Configuration Scripts**

### **Quick CORS Update Script**
```bash
#!/bin/bash
# update-cors.sh

echo "🔧 Updating CORS configuration..."

# Get VM IP
VM_IP=$(curl -s ifconfig.me)
echo "VM IP: $VM_IP"

# Update environment files
sed -i "s/your-vm-ip/$VM_IP/g" phi_intelligence/.env
sed -i "s/your-vm-ip/$VM_IP/g" phi_voice/.env

# Update docker-compose.yml
sed -i "s/your-vm-ip/$VM_IP/g" docker-compose.yml

# Update nginx configuration
sed -i "s/your-vm-ip/$VM_IP/g" nginx/nginx.conf

echo "✅ CORS configuration updated!"
echo "📝 Remember to update 'your-domain.com' with your actual domain if you have one."
```

### **CORS Test Script**
```bash
#!/bin/bash
# test-cors.sh

echo "🧪 Testing CORS configuration..."

# Get VM IP
VM_IP=$(curl -s ifconfig.me)

# Test CORS preflight
echo "Testing CORS preflight request..."
curl -X OPTIONS \
  -H "Origin: http://$VM_IP" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  http://$VM_IP/api/health

echo ""
echo "Testing CORS actual request..."
curl -X GET \
  -H "Origin: http://$VM_IP" \
  -H "Content-Type: application/json" \
  -v \
  http://$VM_IP/api/health

echo "✅ CORS test complete!"
```

## 🌐 **Domain-Specific CORS Configuration**

### **If You Have a Domain:**

#### **Update all files with your domain:**
```bash
# Replace placeholder with your actual domain
DOMAIN="your-actual-domain.com"

# Update environment files
sed -i "s/your-domain.com/$DOMAIN/g" phi_intelligence/.env
sed -i "s/your-domain.com/$DOMAIN/g" phi_voice/.env

# Update docker-compose.yml
sed -i "s/your-domain.com/$DOMAIN/g" docker-compose.yml

# Update nginx configuration
sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf
```

### **If You Only Have an IP:**

#### **Use IP-based CORS:**
```bash
# Get your VM's public IP
VM_IP=$(curl -s ifconfig.me)

# Update all configurations with IP
sed -i "s/your-vm-ip/$VM_IP/g" phi_intelligence/.env
sed -i "s/your-vm-ip/$VM_IP/g" phi_voice/.env
sed -i "s/your-vm-ip/$VM_IP/g" docker-compose.yml
sed -i "s/your-vm-ip/$VM_IP/g" nginx/nginx.conf
```

## 🚨 **Common CORS Issues & Solutions**

### **Issue 1: "Access to fetch at 'X' from origin 'Y' has been blocked by CORS policy"**

**Solution:**
```bash
# Check if your origin is in ALLOWED_ORIGINS
echo $ALLOWED_ORIGINS

# Add your origin to the list
# Update phi_intelligence/.env
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://your-vm-ip,https://your-vm-ip,http://localhost:3000
```

### **Issue 2: "Credentials flag is set to true, but Access-Control-Allow-Credentials is not 'true'"

**Solution:**
```bash
# Ensure CORS_CREDENTIALS=true in environment
# And add_header Access-Control-Allow-Credentials "true" in nginx
```

### **Issue 3: "Request header field authorization is not allowed by Access-Control-Allow-Headers"**

**Solution:**
```bash
# Add Authorization to allowed headers
CORS_HEADERS=Origin,X-Requested-With,Content-Type,Accept,Authorization
```

## ✅ **CORS Verification Checklist**

- [ ] Environment variables updated with correct origins
- [ ] Docker Compose environment includes CORS settings
- [ ] Nginx CORS headers configured
- [ ] Backend CORS middleware configured (if applicable)
- [ ] Frontend API client configured with credentials
- [ ] Preflight requests handled properly
- [ ] CORS tested with actual requests
- [ ] All domains/IPs added to allowed origins

## 🧪 **Testing CORS**

### **Browser Console Test:**
```javascript
// Test CORS from browser console
fetch('http://your-vm-ip/api/health', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => console.log('CORS working:', data))
.catch(error => console.error('CORS error:', error));
```

### **Command Line Test:**
```bash
# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: http://your-vm-ip" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  http://your-vm-ip/api/health
```

**Your CORS configuration is now properly set up for production!** 🎉✨
