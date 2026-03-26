# AWS Amplify Environment Variables Setup

## 🎯 Critical Step for Frontend-Backend Connection

After uploading files to Lightsail, you MUST configure environment variables in AWS Amplify for the frontend to connect to the backend.

## 📍 Where to Add Variables

1. Go to **AWS Console**
2. Navigate to **AWS Amplify**
3. Select your app: **main.d3ozd8k0s4za13**
4. Click **Environment variables** in left sidebar
5. Click **Manage variables**

## 📋 Variables to Add

### Backend API Connection (CRITICAL)
```
VITE_API_URL = https://api.phiintelligence.com
```
**Purpose**: Frontend uses this to make all API calls (contacts, news, jobs, auth, etc.)

### Token Server URLs
```
VITE_PHI_TOKEN_SERVER_URL = https://api.phiintelligence.com/voice/phi
VITE_COMPANY_TOKEN_SERVER_URL = https://api.phiintelligence.com/voice/company
```
**Purpose**: Voice features (LiveKit token generation)

**Note**: Hotel, Restaurant, and Hospital token servers have been removed from the backend.

### LiveKit WebSocket URLs
```
VITE_LIVEKIT_URL = wss://phi-intelligence-general-pwgb54ng.livekit.cloud
VITE_LIVEKIT_COMPANY_URL = wss://phi-intelligence-company-tku4otnx.livekit.cloud
```
**Purpose**: Real-time voice communication

### Chat (no extra Amplify vars)
Chat is fully server-side. The backend (Lightsail + AWS Secrets Manager) uses Gemini or OpenAI; the frontend only calls `VITE_API_URL/api/chat`. No Google/Gemini env vars are required in Amplify for chat to work.

## 🚀 After Adding Variables

1. **Save** the environment variables
2. Click **Redeploy this version** or trigger new build
3. Wait for build to complete (2-5 minutes)
4. Verify deployment at: `https://phiintelligence.com`

## ✅ Verification Steps

### 1. Check Build Logs
In Amplify Console → Build History → Latest Build → View Logs

Look for:
```
Environment variables loaded successfully
VITE_API_URL found
Build completed successfully
```

### 2. Test Frontend
Open `https://phiintelligence.com` in browser:

**Open Developer Console** (F12) and check:
```javascript
// Test in console:
console.log(import.meta.env.VITE_API_URL);
// Should output: "https://api.phiintelligence.com"
```

### 3. Check Network Tab
- Go to: Contact page or News page
- Open Network tab (F12)
- Should see requests to: `https://api.phiintelligence.com/api/...`
- Should NOT see CORS errors
- Status codes should be 200 OK

### 4. Test Features
- ✅ Homepage loads correctly
- ✅ News section shows articles
- ✅ Contact form can be submitted
- ✅ Voice bot can connect
- ✅ No errors in console

## 🔧 Troubleshooting

### If frontend still can't connect:

**Problem**: "Failed to fetch" or "Network error"
**Solution**: 
1. Verify VITE_API_URL is set in Amplify
2. Check if api.phiintelligence.com resolves to Lightsail IP:
   ```bash
   nslookup api.phiintelligence.com
   # Should show: 3.8.127.229
   ```
3. Test API directly: `curl https://api.phiintelligence.com/health`

**Problem**: CORS errors in console
**Solution**:
1. Verify VITE_ALLOWED_ORIGINS includes all domains
2. Check backend logs: `docker logs phi_intelligence | grep CORS`
3. Verify nginx is running: `docker ps | grep phi_nginx`

**Problem**: API calls go to wrong URL
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Verify Amplify build used latest code
4. Check build logs for environment variable loading

## 📝 Complete Variable List (Copy-Paste)

For easy setup, here's the complete list in Amplify format:

```
VITE_API_URL=https://api.phiintelligence.com
VITE_PHI_TOKEN_SERVER_URL=https://api.phiintelligence.com/voice/phi
VITE_COMPANY_TOKEN_SERVER_URL=https://api.phiintelligence.com/voice/company
VITE_LIVEKIT_URL=wss://phi-intelligence-general-pwgb54ng.livekit.cloud
VITE_LIVEKIT_COMPANY_URL=wss://phi-intelligence-company-tku4otnx.livekit.cloud
```

## ⚡ Quick Setup (If you prefer AWS CLI)

```bash
# Set Amplify App ID
APP_ID="d3ozd8k0s4za13"
BRANCH_NAME="main"

# Add environment variables via AWS CLI
aws amplify update-branch \
  --app-id $APP_ID \
  --branch-name $BRANCH_NAME \
  --environment-variables \
    VITE_API_URL="https://api.phiintelligence.com" \
    VITE_PHI_TOKEN_SERVER_URL="https://api.phiintelligence.com/voice/phi" \
    VITE_COMPANY_TOKEN_SERVER_URL="https://api.phiintelligence.com/voice/company" \
    VITE_LIVEKIT_URL="wss://phi-intelligence-general-pwgb54ng.livekit.cloud" \
    VITE_LIVEKIT_COMPANY_URL="wss://phi-intelligence-company-tku4otnx.livekit.cloud"

# Trigger new build
aws amplify start-job \
  --app-id $APP_ID \
  --branch-name $BRANCH_NAME \
  --job-type RELEASE
```

## 🎯 Success Indicators

After completing setup, you should see:

### In Amplify Build Logs:
```
✓ Environment variables loaded (5)
✓ VITE_API_URL configured
✓ Build completed successfully
✓ Deployment succeeded
```

### In Browser Console:
```
✅ No CORS errors
✅ API calls to api.phiintelligence.com succeed
✅ LiveKit connections work
✅ All features functional
```

### In Network Tab:
```
GET https://api.phiintelligence.com/api/news → 200 OK
GET https://api.phiintelligence.com/api/blog → 200 OK
POST https://api.phiintelligence.com/api/contacts → 200 OK
```

