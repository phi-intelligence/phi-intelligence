# Voice Bot Investigation Results

## Investigation Date
Current analysis of voice bot functionality issues

## System Architecture Verified ✅

### Frontend Components (Verified):
- ✅ **VoiceBubble.tsx** - Token fetching at lines 241-261
- ✅ **CompanyVoiceBubble.tsx** - Company token fetching at lines 261-290  
- ✅ **FrameworkWrapper.tsx** - LiveKit connection logic (lines 255-329)
- ✅ **livekit.ts** - Configuration loading with fallback to env vars

### Backend Services (Verified):
- ✅ **nginx.conf** - Routes `/voice/phi/` → `phi_token_server:8001` (lines 121-133)
- ✅ **nginx.conf** - Routes `/voice/company/` → `company_token_server:8002` (lines 136-148)
- ✅ **docker-compose.aws.yml** - Token servers configured (phi_token_server:8001, company_token_server:8002)

## Issues Identified

### 1. ❌ LiveKit Config Endpoint Not Returning Data
**Status**: CRITICAL ISSUE FOUND

**Problem**: `/api/livekit/config` endpoint test returned "NOT FOUND" for all URLs and keys.

**Root Cause**: The endpoint requires these environment variables in the backend:
- `LIVEKIT_PHI_URL`
- `LIVEKIT_PHI_API_KEY`
- `LIVEKIT_PHI_API_SECRET`
- `LIVEKIT_COMPANY_URL`
- `LIVEKIT_COMPANY_API_KEY`
- `LIVEKIT_COMPANY_API_SECRET`

**Impact**: Frontend `initializeLiveKitConfig()` function fails, falls back to env vars which may not be set in Amplify.

**Location**: `phi_intelligence/server/routes.ts:1167-1197`

**Fix Required**: 
1. Verify AWS Secrets Manager has all `LIVEKIT_*` variables
2. Verify `load-aws-secrets.sh` loads these variables before starting containers
3. Test endpoint: `curl https://api.phiintelligence.com/api/livekit/config`

### 2. ⚠️ Token Server Endpoints Testing Failed
**Status**: NEEDS REMOTE VERIFICATION

**Problem**: External curl tests failed (exit code 60 - SSL certificate issue), but code structure looks correct.

**Required Checks** (SSH into Lightsail):
```bash
# Check containers are running
docker ps | grep token_server

# Check container logs
docker logs phi_token_server --tail 50
docker logs company_token_server --tail 50

# Test endpoints internally
curl -X POST http://localhost:8001/token \
  -H "Content-Type: application/json" \
  -d '{"room_name":"test","participant_identity":"test"}'

curl -X POST http://localhost:8002/token \
  -H "Content-Type: application/json" \
  -d '{"room_name":"test","participant_identity":"test"}'

# Test via nginx
curl -X POST http://localhost/voice/phi/token \
  -H "Content-Type: application/json" \
  -d '{"room_name":"test","participant_identity":"test"}'
```

### 3. ⚠️ Environment Variables in Amplify
**Status**: NEEDS VERIFICATION

**Required Variables** (from `AMPLIFY-ENV-SETUP.md`):
```
VITE_PHI_TOKEN_SERVER_URL=https://api.phiintelligence.com/voice/phi
VITE_COMPANY_TOKEN_SERVER_URL=https://api.phiintelligence.com/voice/company
VITE_LIVEKIT_URL=wss://phi-intelligence-general-pwgb54ng.livekit.cloud
VITE_LIVEKIT_COMPANY_URL=wss://phi-intelligence-company-tku4otnx.livekit.cloud
```

**Verification**:
1. AWS Amplify Console → App → Environment variables
2. Check all 4 variables are present
3. Verify values match above exactly
4. Check build logs show variables loaded

**Browser Console Test**:
```javascript
console.log('PHI_TOKEN_SERVER_URL:', import.meta.env.VITE_PHI_TOKEN_SERVER_URL);
console.log('COMPANY_TOKEN_SERVER_URL:', import.meta.env.VITE_COMPANY_TOKEN_SERVER_URL);
console.log('LIVEKIT_URL:', import.meta.env.VITE_LIVEKIT_URL);
console.log('LIVEKIT_COMPANY_URL:', import.meta.env.VITE_LIVEKIT_COMPANY_URL);
```

### 4. ✅ Nginx Configuration - CORRECT
**Status**: VERIFIED

The nginx configuration correctly routes:
- `/voice/phi/` → `http://phi_token_server/` (port 8001)
- `/voice/company/` → `http://company_token_server/` (port 8002)

Location: `nginx/nginx.conf` lines 121-148

### 5. ✅ Frontend Code Structure - CORRECT
**Status**: VERIFIED

- Token fetching logic correct in both VoiceBubble components
- Error handling in place
- Connection flow follows correct pattern:
  1. Fetch token from token server URL
  2. Get token from response
  3. Connect to LiveKit using token and server URL

## Critical Path to Fix

### Step 1: Verify Backend Environment Variables (SSH Required)
```bash
# SSH into Lightsail
ssh -i lightsail-key.pem ubuntu@3.8.127.229

# Check if secrets are loaded
cd ~/phiai
source ./load-aws-secrets.sh
echo $LIVEKIT_PHI_URL
echo $LIVEKIT_COMPANY_URL

# Check container environment
docker exec phi_intelligence env | grep LIVEKIT
docker exec phi_token_server env | grep LIVEKIT
docker exec company_token_server env | grep LIVEKIT
```

### Step 2: Test LiveKit Config Endpoint
```bash
# From SSH session
curl http://localhost:5000/api/livekit/config

# Should return JSON with phi and company configs
```

### Step 3: Test Token Servers
```bash
# Test phi token server
curl -X POST http://localhost:8001/token \
  -H "Content-Type: application/json" \
  -d '{"room_name":"test_room","participant_identity":"test_user","participant_name":"Test","ttl_minutes":30}'

# Test company token server  
curl -X POST http://localhost:8002/token \
  -H "Content-Type: application/json" \
  -d '{"room_name":"test_room","participant_identity":"test_user","participant_name":"Test","ttl_minutes":30}'
```

### Step 4: Verify Amplify Environment Variables
1. AWS Console → Amplify → App → Environment variables
2. Verify all 4 variables listed above are set
3. If missing, add them and trigger redeploy

### Step 5: Check Browser Console
1. Open `https://phiintelligence.com`
2. Open Developer Console (F12)
3. Check for errors when clicking voice bubble
4. Check Network tab for token fetch requests
5. Verify environment variables are loaded

## Expected Behavior After Fix

1. ✅ Voice bubble click → Token fetch to `/voice/phi/token` succeeds (200 OK)
2. ✅ Token received → Contains `token` and `server_url` fields
3. ✅ LiveKit connection → Connects to `server_url` with token
4. ✅ Microphone access → Browser prompts for permission
5. ✅ Agent available → Voice agent appears in room and responds

## Files Verified

- ✅ `phi_intelligence/client/src/components/voice/VoiceBubble.tsx` - Lines 241-261
- ✅ `phi_intelligence/client/src/components/voice/CompanyVoiceBubble.tsx` - Lines 261-290
- ✅ `phi_intelligence/client/src/components/voice/FrameworkWrapper.tsx` - Lines 255-329
- ✅ `phi_intelligence/client/src/config/livekit.ts` - Lines 29-56
- ✅ `nginx/nginx.conf` - Lines 121-148
- ✅ `docker-compose.aws.yml` - Token server services
- ✅ `phi_intelligence/server/routes.ts` - Lines 1167-1197

## Next Steps

**Immediate Actions Required**:
1. SSH into Lightsail and verify `LIVEKIT_*` environment variables are loaded
2. Test `/api/livekit/config` endpoint returns data
3. Test token server endpoints internally
4. Verify Amplify environment variables are set
5. Test voice bot in browser and check console/network tabs

**If Environment Variables Missing**:
1. Check AWS Secrets Manager for `LIVEKIT_*` secrets
2. Verify `load-aws-secrets.sh` includes all LiveKit variables
3. Restart containers after loading secrets

**If Token Servers Not Working**:
1. Check container logs for errors
2. Verify Redis connection (if required)
3. Check LiveKit credentials in token server containers
4. Verify nginx routing is working
