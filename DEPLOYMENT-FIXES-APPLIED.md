# PHIAI Deployment Fixes Applied

**Date**: October 15, 2025
**Status**: Ready for Deployment

## ✅ Critical Fixes Completed

### 1. Azure Dependencies Removed (BLOCKING ISSUE FIXED)
**Problem**: Token servers stuck in Azure authentication loop on AWS infrastructure
**Solution**: Removed all Azure Key Vault dependencies

**Files Modified**:
- `phi_voice/token_servers/phi_token_server/requirements.txt` - Removed azure-identity & azure-keyvault-secrets
- `phi_voice/token_servers/company_token_server/requirements.txt` - Removed azure-identity & azure-keyvault-secrets  
- `phi_voice/token_servers/hotel_token_server/requirements.txt` - Removed azure-identity & azure-keyvault-secrets
- `phi_voice/token_servers/restaurant_token_server/requirements.txt` - Removed azure-identity & azure-keyvault-secrets
- `phi_voice/token_servers/hospital_token_server/requirements.txt` - Removed azure-identity & azure-keyvault-secrets
- `phi_voice/token_servers/phi_token_server/server.py` - Removed key_vault_service import and calls
- `phi_voice/token_servers/company_token_server/server.py` - Removed key_vault_service import and calls
- `phi_voice/token_servers/hotel_token_server/server.py` - Removed key_vault_service import
- `phi_voice/token_servers/restaurant_token_server/server.py` - Removed key_vault_service import
- `phi_voice/token_servers/hospital_token_server/server.py` - Removed key_vault_service import

**Result**: Token servers will now ONLY use environment variables (no Azure calls)

### 2. phi_intelligence Server Fixed (BLOCKING ISSUE FIXED)
**Problem**: Server crashed trying to serve dist/index.html when SKIP_FRONTEND_SERVE=true
**Solution**: Added conditional check before serving static files

**File Modified**:
- `phi_intelligence/server/index.ts` (lines 173-189)

**Code Change**:
```typescript
// Before: Always tried to serve static files in production
if (process.env.NODE_ENV === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app); // ❌ CRASHES when SKIP_FRONTEND_SERVE=true
}

// After: Check SKIP_FRONTEND_SERVE flag
if (process.env.NODE_ENV === "development") {
  await setupVite(app, server);
} else if (process.env.SKIP_FRONTEND_SERVE !== 'true') {
  serveStatic(app); // Only serve if not using external frontend
} else {
  console.log('📡 Frontend served externally (e.g., AWS Amplify)'); // ✅ API-only mode
}
```

**Result**: Backend runs in API-only mode without crashes

### 3. VITE_API_URL Added (CRITICAL CONNECTION FIX)
**Problem**: Frontend had no idea where to send API requests
**Solution**: Added VITE_API_URL to all configuration files

**Files Modified**:
- `env.aws.template` - Added VITE_API_URL
- `load-aws-secrets.sh` - Added export VITE_API_URL
- `docker-compose.aws.yml` - Added VITE_API_URL environment variable
- `phi_intelligence/.env` - Added VITE_API_URL

**Value**: `VITE_API_URL=https://api.phiintelligence.com`

**Result**: Frontend will now make API calls to correct backend URL

### 4. CORS Updated (CONNECTION FIX)
**Problem**: CORS blocked requests from phiintelligence.com custom domain
**Solution**: Added all domains to CORS whitelist

**Updated CORS Origins**:
```
https://main.d3ozd8k0s4za13.amplifyapp.com  (Amplify URL)
https://phiintelligence.com                  (Custom domain)
https://www.phiintelligence.com              (WWW subdomain)
http://3.8.127.229                           (Lightsail IP - for testing)
```

**Files Modified**:
- `phi_intelligence/.env`
- `load-aws-secrets.sh`

**Result**: All domain variants can now communicate with backend

### 5. Replit Dependencies Removed (CLEANUP)
**Problem**: Obsolete Replit-specific packages causing build warnings
**Solution**: Removed Replit vite plugins

**Files Modified**:
- `phi_intelligence/package.json` - Removed @replit/* packages
- `phi_intelligence/vite.config.ts` - Removed plugin imports and usage

**Result**: Cleaner build process, fewer dependencies

### 6. Docker Compose Cleanup (DOCUMENTATION)
**Problem**: Two docker-compose files caused confusion
**Solution**: Marked old file as deprecated

**File Modified**:
- `docker-compose.yml` - Added deprecation notice

**Result**: Clear which file to use for AWS deployment

## 🚀 Deployment Steps

### Step 1: Upload Fixed Files to Lightsail VM

```bash
# From local machine
cd /home/phi/Desktop/Phi-Intelligence/PHIAI

# Upload entire phi_intelligence directory (includes fixes)
scp -i lightsail-key.pem -r phi_intelligence ubuntu@3.8.127.229:~/phiai/

# Upload phi_voice token_servers (includes Azure removal)
scp -i lightsail-key.pem -r phi_voice/token_servers ubuntu@3.8.127.229:~/phiai/phi_voice/

# Upload updated docker-compose and scripts
scp -i lightsail-key.pem docker-compose.aws.yml ubuntu@3.8.127.229:~/phiai/
scp -i lightsail-key.pem load-aws-secrets.sh ubuntu@3.8.127.229:~/phiai/
scp -i lightsail-key.pem env.aws.template ubuntu@3.8.127.229:~/phiai/
```

### Step 2: SSH into VM and Rebuild Containers

```bash
# SSH into VM
ssh -i lightsail-key.pem ubuntu@3.8.127.229

# Navigate to project directory
cd ~/phiai

# Stop all containers
docker compose -f docker-compose.aws.yml down

# Load environment variables from AWS Secrets Manager
source ./load-aws-secrets.sh

# Rebuild and restart all containers
docker compose -f docker-compose.aws.yml up -d --build

# Monitor container status
watch -n 2 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
```

### Step 3: Configure AWS Amplify Environment Variables

**Go to**: AWS Console → Amplify → main.d3ozd8k0s4za13 → Environment variables

**Add the following variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://api.phiintelligence.com` |
| `VITE_PHI_TOKEN_SERVER_URL` | `https://api.phiintelligence.com/voice/phi` |
| `VITE_COMPANY_TOKEN_SERVER_URL` | `https://api.phiintelligence.com/voice/company` |
| `VITE_HOTEL_RECEPTIONIST_TOKEN_SERVER_URL` | `https://api.phiintelligence.com/voice/hotel` |
| `VITE_RESTAURANT_ORDER_TOKEN_SERVER_URL` | `https://api.phiintelligence.com/voice/restaurant` |
| `VITE_HOSPITAL_APPOINTMENT_TOKEN_SERVER_URL` | `https://api.phiintelligence.com/voice/hospital` |
| `VITE_LIVEKIT_URL` | `wss://phi-intelligence-general-pwgb54ng.livekit.cloud` |
| `VITE_LIVEKIT_COMPANY_URL` | `wss://phi-intelligence-company-tku4otnx.livekit.cloud` |

**Then**: Trigger new Amplify build (redeploy)

### Step 4: Verify Deployment

**Check Container Health** (on VM):
```bash
docker ps
# All containers should show "healthy" status
```

**Check Container Logs** (on VM):
```bash
# Check phi_intelligence - should show "API-only mode enabled"
docker logs phi_intelligence --tail 20

# Check phi_token_server - should NOT show Azure errors
docker logs phi_token_server --tail 20

# Check company_token_server
docker logs company_token_server --tail 20
```

**Test API Endpoints**:
```bash
# Health check
curl http://localhost:5000/health
curl http://localhost:8001/health
curl http://localhost:8002/health

# Or from external
curl https://api.phiintelligence.com/health
```

**Test from Browser** (after Amplify redeploy):
1. Go to `https://phiintelligence.com`
2. Open browser console (F12)
3. Check for:
   - ✅ No CORS errors
   - ✅ API calls succeed
   - ✅ News loads
   - ✅ Contact form works

## 📊 Expected Container Status After Fix

```
NAMES                     STATUS                  
phi_intelligence          Up X minutes (healthy)   ← Should be HEALTHY now
phi_nginx                 Up X minutes (healthy)   
company_token_server      Up X minutes (healthy)   
phi_token_server          Up X minutes (healthy)   ← Should be HEALTHY now
restaurant_token_server   Up X minutes (healthy)   
hotel_token_server        Up X minutes (healthy)   
hospital_token_server     Up X minutes (healthy)   
phi_redis                 Up X minutes (healthy)   
```

## 🔧 Troubleshooting

### If phi_intelligence still unhealthy:
```bash
docker logs phi_intelligence --tail 100
# Look for: "📡 Frontend served externally"
# Should NOT see: "Error: ENOENT: no such file or directory, stat '/app/dist/index.html'"
```

### If phi_token_server still unhealthy:
```bash
docker logs phi_token_server --tail 100  
# Should NOT see: "Request URL: 'http://169.254.169.254/metadata/identity/oauth2/token'"
# Should see: "✅ Using LiveKit credentials from environment variables"
```

### If frontend can't connect to backend:
1. Check browser console for CORS errors
2. Verify VITE_API_URL in Amplify environment variables
3. Check if api.phiintelligence.com DNS points to Lightsail IP
4. Test API directly: `curl https://api.phiintelligence.com/health`

## 📝 Files Changed Summary

### Configuration Files (7)
- ✅ `env.aws.template`
- ✅ `load-aws-secrets.sh`
- ✅ `docker-compose.aws.yml`
- ✅ `docker-compose.yml` (deprecation notice)
- ✅ `phi_intelligence/.env`
- ✅ `phi_intelligence/package.json`
- ✅ `phi_intelligence/vite.config.ts`

### Backend Server (1)
- ✅ `phi_intelligence/server/index.ts`

### Token Servers - Requirements (5)
- ✅ `phi_voice/token_servers/phi_token_server/requirements.txt`
- ✅ `phi_voice/token_servers/company_token_server/requirements.txt`
- ✅ `phi_voice/token_servers/hotel_token_server/requirements.txt`
- ✅ `phi_voice/token_servers/restaurant_token_server/requirements.txt`
- ✅ `phi_voice/token_servers/hospital_token_server/requirements.txt`

### Token Servers - Code (5)
- ✅ `phi_voice/token_servers/phi_token_server/server.py`
- ✅ `phi_voice/token_servers/company_token_server/server.py`
- ✅ `phi_voice/token_servers/hotel_token_server/server.py`
- ✅ `phi_voice/token_servers/restaurant_token_server/server.py`
- ✅ `phi_voice/token_servers/hospital_token_server/server.py`

**Total**: 18 files modified

## 🎯 Next Actions Required

1. **Upload files to VM** (see Step 1 above)
2. **Rebuild containers** (see Step 2 above)  
3. **Configure Amplify env vars** (see Step 3 above)
4. **Verify everything works** (see Step 4 above)

## 📞 Support

If issues persist after deployment:
- Check container logs: `docker logs <container_name>`
- Check nginx logs: `docker logs phi_nginx`
- Test API endpoints manually with curl
- Verify DNS: `nslookup api.phiintelligence.com`

