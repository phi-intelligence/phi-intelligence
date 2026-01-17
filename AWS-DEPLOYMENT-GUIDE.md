# 🚀 PHIAI AWS Deployment Guide - Complete Manual

## 📋 Quick Summary

**Architecture**: Amplify (Frontend) + Lightsail (Backend)  
**Region**: eu-west-2 (London) 🇬🇧  
**Total AWS Cost**: ~£48-52/month (~$60-65)  
**Deployment Time**: 3-4 hours  

---

## ✅ **FILES CREATED FOR YOU**

```
✅ docker-compose.aws.yml      - AWS-optimized Docker Compose
✅ load-aws-secrets.sh         - Load secrets from AWS Secrets Manager
✅ deploy-aws.sh               - Deployment script for Lightsail
✅ .env.aws                    - Environment template
✅ amplify.yml                 - Amplify build configuration
✅ AWS-DEPLOYMENT-GUIDE.md     - This file
```

---

## 🎯 **COMPLETE DEPLOYMENT STEPS**

### **PHASE 1: AWS CLI SETUP** (5 minutes)

Run on your **local machine**:

```bash
# Navigate to project
cd /home/phi/Desktop/Phi-Intelligence/PHIAI

# Configure AWS CLI for London region
aws configure

# Enter these values:
# AWS Access Key ID: YOUR_AWS_ACCESS_KEY_ID
# AWS Secret Access Key: YOUR_AWS_SECRET_ACCESS_KEY
# Default region name: eu-west-2
# Default output format: json

# Verify configuration
aws sts get-caller-identity

# Should show your AWS account details
```

---

### **PHASE 2: CREATE AWS SECRETS** (20 minutes)

**Copy and run these commands** one by one on your **local machine**:

```bash
# Set region
export AWS_REGION=eu-west-2

# 1. Database
aws secretsmanager create-secret \
    --name "phiai/database-url" \
    --secret-string "postgresql://neondb_owner:npg_eK35fkrFwIDc@ep-purple-firefly-ad04mcgl-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
    --region eu-west-2

# 2. OpenAI
aws secretsmanager create-secret \
    --name "phiai/openai-api-key" \
    --secret-string "your-openai-api-key-here" \
    --region eu-west-2

# 3. Deepgram
aws secretsmanager create-secret \
    --name "phiai/deepgram-api-key" \
    --secret-string "bfc440d4a7198f7c4a7441c2e2b3b1ca8725d6f9" \
    --region eu-west-2

# 4. Pinecone API Key
aws secretsmanager create-secret \
    --name "phiai/pinecone-api-key" \
    --secret-string "pcsk_6zRm3y_MbLMkYNMBn5cttx8owf5u7G76VxMhz32JmrUG4z1unnbhw4GBCcUsaHGY5zPY7R" \
    --region eu-west-2

# 5. Pinecone Environment
aws secretsmanager create-secret \
    --name "phiai/pinecone-environment" \
    --secret-string "us-east-1-aws" \
    --region eu-west-2

# 6. Pinecone Index
aws secretsmanager create-secret \
    --name "phiai/pinecone-index-name" \
    --secret-string "phi" \
    --region eu-west-2

# 7-9. LiveKit Phi
aws secretsmanager create-secret --name "phiai/livekit-phi-url" --secret-string "wss://phi-intelligence-general-pwgb54ng.livekit.cloud" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-phi-api-key" --secret-string "APIJtqTyZpJBbEm" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-phi-api-secret" --secret-string "B6QwNtN00ECszleaF6EmZMWzPAHbAizFxDsmL230srY" --region eu-west-2

# 10-12. LiveKit Company
aws secretsmanager create-secret --name "phiai/livekit-company-url" --secret-string "wss://phi-intelligence-company-tku4otnx.livekit.cloud" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-company-api-key" --secret-string "APISzSNm3DJ9z7j" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-company-api-secret" --secret-string "IFXjEbzjp5AfF9ZcXOva5bvyPfW6TN6W6xAcZKF73VfB" --region eu-west-2

# 13-15. LiveKit Hotel
aws secretsmanager create-secret --name "phiai/livekit-hotel-url" --secret-string "wss://hotel-template-juiuz1pt.livekit.cloud" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-hotel-api-key" --secret-string "APIx8PeBZgw8hHP" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-hotel-api-secret" --secret-string "grxUsSRQFplOR2hTGy0cJ29xUdGE7fEXwFBmfNvulPq" --region eu-west-2

# 16-18. LiveKit Restaurant
aws secretsmanager create-secret --name "phiai/livekit-restaurant-url" --secret-string "wss://restuarant-template-p9meuxon.livekit.cloud" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-restaurant-api-key" --secret-string "APIT2zi2zaUah8D" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-restaurant-api-secret" --secret-string "0HI083y1xcfXP1i0laDufxClaffuZdb4X83f53Oe5HBA" --region eu-west-2

# 19-21. LiveKit Hospital
aws secretsmanager create-secret --name "phiai/livekit-hospital-url" --secret-string "wss://hospital-template-d1yx0cjd.livekit.cloud" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-hospital-api-key" --secret-string "APIj2mZvGQBNj3R" --region eu-west-2

aws secretsmanager create-secret --name "phiai/livekit-hospital-api-secret" --secret-string "Lej1m4ppAnj0INDfnUHkT65tjUifHUYVG4OQ9FNF2RqA" --region eu-west-2

# 22-24. JWT & Session
aws secretsmanager create-secret --name "phiai/jwt-access-secret" --secret-string "5ae05b41544f86f2abde5fee6d06da0787e80746e9522ecd4b51778c2f5d60301534935b8e257a30822a3786649c7cb9668446615fd3b5a86cefd417fdf5c04d" --region eu-west-2

aws secretsmanager create-secret --name "phiai/jwt-refresh-secret" --secret-string "3c536138b7d4ee03196dfeaada7c426379dc5ef42a7dcfdcbc9da69c288e0adda5f052567790c9de5ab3b9e769ea353b8305045333707d80d97533d128a8eb51" --region eu-west-2

aws secretsmanager create-secret --name "phiai/session-secret" --secret-string "phi-intelligence-session-secret-2024" --region eu-west-2

# 25-29. Cloudflare R2
aws secretsmanager create-secret --name "phiai/r2-access-key" --secret-string "560613b5d743b25360101ae94decbf03" --region eu-west-2

aws secretsmanager create-secret --name "phiai/r2-secret-key" --secret-string "05031003dc028a1408d94e9ef0152d2575122feb5e380c1c9c160a731f4330c9" --region eu-west-2

aws secretsmanager create-secret --name "phiai/r2-bucket-name" --secret-string "phi" --region eu-west-2

aws secretsmanager create-secret --name "phiai/r2-endpoint" --secret-string "https://4bcf8832c26a1d24c67738e2ad9dedfa.r2.cloudflarestorage.com/phi" --region eu-west-2

aws secretsmanager create-secret --name "phiai/cloudflare-account-id" --secret-string "4bcf8832c26a1d24c67738e2ad9dedfa" --region eu-west-2

# Verify all secrets
aws secretsmanager list-secrets --region eu-west-2 --query "SecretList[?starts_with(Name, 'phiai/')].Name" --output table

# Expected: 29 secrets
```

**Cost**: 29 secrets × £0.33 = **£9.57/month** (~$12)

---

### **PHASE 3: DEPLOY FRONTEND TO AMPLIFY** (30 minutes)

#### **Step 1: Push Code to GitHub**

```bash
# Ensure amplify.yml is in place
ls -la amplify.yml

# Commit and push
git add amplify.yml
git commit -m "Add AWS Amplify configuration"
git push origin main
```

#### **Step 2: Deploy via AWS Console**

1. **Open AWS Amplify Console** (London):  
   https://eu-west-2.console.aws.amazon.com/amplify/home?region=eu-west-2

2. Click **"New app"** → **"Host web app"**

3. Select **"GitHub"**

4. **Authorize AWS Amplify** to access your GitHub

5. **Select Repository**:
   - Repository: `PHIAI` (or your repo name)
   - Branch: `main`

6. **App name**: `phiai-frontend`

7. **Build settings**: Auto-detected from `amplify.yml` ✅

8. **Environment variables** (leave empty for now)

9. Click **"Save and deploy"**

10. **Wait 5-10 minutes** for build

11. **Get your Amplify URL** (looks like):
    ```
    https://main.d1a2b3c4d5e6f.amplifyapp.com
    ```

12. **Save this URL** - you'll need it!

#### **Step 3: Get Amplify URL via CLI**

```bash
# Get your Amplify URL
aws amplify list-apps --region eu-west-2 \
    --query "apps[?name=='phiai-frontend'].[appId,defaultDomain]" \
    --output table

# Save URL to file
aws amplify list-apps --region eu-west-2 \
    --query "apps[?name=='phiai-frontend'].defaultDomain" \
    --output text > amplify-url.txt

# View it
cat amplify-url.txt
```

---

### **PHASE 4: CREATE LIGHTSAIL INSTANCE** (15 minutes)

#### **Step 4: Create Instance**

```bash
# Create Lightsail instance in London
aws lightsail create-instances \
    --instance-names phiai-backend \
    --availability-zone eu-west-2a \
    --blueprint-id ubuntu_22_04 \
    --bundle-id medium_2_0 \
    --region eu-west-2

# This creates:
# - Ubuntu 22.04
# - 2 vCPU, 4GB RAM, 80GB SSD
# - Cost: $40/month (£32/month)
```

#### **Step 5: Wait for Instance**

```bash
# Check status (wait for "running")
aws lightsail get-instance \
    --instance-name phiai-backend \
    --region eu-west-2 \
    --query 'instance.state.name' \
    --output text

# Run this command every 30 seconds until it shows: running
# Takes 2-3 minutes
```

#### **Step 6: Allocate Static IP**

```bash
# Allocate static IP
aws lightsail allocate-static-ip \
    --static-ip-name phiai-static-ip \
    --region eu-west-2

# Attach to instance
aws lightsail attach-static-ip \
    --static-ip-name phiai-static-ip \
    --instance-name phiai-backend \
    --region eu-west-2

# Get IP address
export LIGHTSAIL_IP=$(aws lightsail get-static-ip \
    --static-ip-name phiai-static-ip \
    --region eu-west-2 \
    --query 'staticIp.ipAddress' \
    --output text)

echo "Lightsail IP: $LIGHTSAIL_IP"

# Save to file
echo "$LIGHTSAIL_IP" > lightsail-ip.txt
```

#### **Step 7: Configure Firewall**

```bash
# Open SSH (22)
aws lightsail open-instance-public-ports \
    --instance-name phiai-backend \
    --port-info fromPort=22,toPort=22,protocol=TCP \
    --region eu-west-2

# Open HTTP (80)
aws lightsail open-instance-public-ports \
    --instance-name phiai-backend \
    --port-info fromPort=80,toPort=80,protocol=TCP \
    --region eu-west-2

# Open HTTPS (443)
aws lightsail open-instance-public-ports \
    --instance-name phiai-backend \
    --port-info fromPort=443,toPort=443,protocol=TCP \
    --region eu-west-2
```

#### **Step 8: Download SSH Key**

```bash
# Download SSH key
aws lightsail download-default-key-pair \
    --region eu-west-2 \
    --output text \
    --query 'privateKeyBase64' | base64 --decode > lightsail-key.pem

# Set permissions
chmod 600 lightsail-key.pem

# Test SSH
ssh -i lightsail-key.pem ubuntu@$LIGHTSAIL_IP "echo 'SSH works!'"
```

---

### **PHASE 5: SETUP LIGHTSAIL** (30 minutes)

#### **Step 9: Install Docker & Tools**

```bash
# SSH into Lightsail
ssh -i lightsail-key.pem ubuntu@$LIGHTSAIL_IP

# Now you're ON Lightsail, run these:

# Update system
sudo apt-get update
echo "intelcore" | sudo -S apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
rm get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Install utilities
sudo apt-get install -y git jq htop

# Logout to apply docker group
exit
```

#### **Step 10: Reconnect and Verify**

```bash
# Reconnect
ssh -i lightsail-key.pem ubuntu@$LIGHTSAIL_IP

# Verify
docker --version
docker-compose --version
aws --version

# All should work without sudo
```

#### **Step 11: Configure AWS CLI on Lightsail**

**Still on Lightsail:**

```bash
# Configure AWS (same credentials as local)
aws configure

# Enter:
# AWS Access Key ID: YOUR_AWS_ACCESS_KEY_ID
# AWS Secret Access Key: YOUR_AWS_SECRET_ACCESS_KEY
# Default region name: eu-west-2
# Default output format: json

# Test
aws secretsmanager list-secrets --region eu-west-2 | grep phiai

# Should see your secrets!
```

---

### **PHASE 6: DEPLOY BACKEND** (45 minutes)

#### **Step 12: Upload Code to Lightsail**

**On LOCAL machine** (new terminal):

```bash
cd /home/phi/Desktop/Phi-Intelligence/PHIAI

# Get IP
export LIGHTSAIL_IP=$(cat lightsail-ip.txt)

# Upload code (takes 5-10 minutes)
rsync -avz --progress \
    -e "ssh -i lightsail-key.pem -o StrictHostKeyChecking=no" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='venv' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    ./ ubuntu@$LIGHTSAIL_IP:/home/ubuntu/phiai/

echo "✅ Upload complete!"
```

#### **Step 13: Update .env.aws with Amplify URL**

**On LOCAL machine:**

```bash
# Get Amplify URL
export AMPLIFY_URL=$(cat amplify-url.txt)

# Update .env.aws
sed -i "s|REPLACE_WITH_YOUR_AMPLIFY_URL|https://$AMPLIFY_URL|g" .env.aws

# Verify
grep VITE_ALLOWED_ORIGINS .env.aws

# Re-upload .env.aws
scp -i lightsail-key.pem .env.aws ubuntu@$LIGHTSAIL_IP:/home/ubuntu/phiai/
```

#### **Step 14: Deploy with Docker Compose**

**On LIGHTSAIL** (SSH session):

```bash
cd /home/ubuntu/phiai

# Load secrets into environment
source ./load-aws-secrets.sh

# Should show: ✅ All secrets loaded successfully!

# Generate SSL certificates
chmod +x nginx/setup-ssl.sh
./nginx/setup-ssl.sh

# Deploy!
chmod +x deploy-aws.sh
./deploy-aws.sh

# This will:
# 1. Build all Docker images (10-15 mins)
# 2. Start all services
# 3. Run health checks
# 4. Show status

# WAIT for it to complete...
```

#### **Step 15: Verify Deployment**

**On LIGHTSAIL:**

```bash
# Check services
docker compose -f docker-compose.aws.yml ps

# Should show 8 services running:
# ✓ phi_intelligence
# ✓ phi_token_server
# ✓ company_token_server
# ✓ hotel_token_server
# ✓ restaurant_token_server
# ✓ hospital_token_server
# ✓ redis
# ✓ nginx

# Test locally
curl http://localhost/health

# View logs
docker compose -f docker-compose.aws.yml logs --tail=50
```

**On LOCAL machine:**

```bash
# Test from outside
export LIGHTSAIL_IP=$(cat lightsail-ip.txt)

curl http://$LIGHTSAIL_IP/health
curl http://$LIGHTSAIL_IP/voice/phi/health
curl http://$LIGHTSAIL_IP/voice/company/health

# Open in browser
xdg-open http://$LIGHTSAIL_IP/
```

---

### **PHASE 7: CONFIGURE DNS** (20 minutes)

#### **Step 16: Create Route 53 Hosted Zone**

```bash
# Create hosted zone
aws route53 create-hosted-zone \
    --name phiintelligence.com \
    --caller-reference "phiai-$(date +%s)"

# Get zone ID
export HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
    --query "HostedZones[?Name=='phiintelligence.com.'].Id" \
    --output text | cut -d'/' -f3)

echo "Hosted Zone ID: $HOSTED_ZONE_ID"

# Get nameservers
aws route53 get-hosted-zone \
    --id $HOSTED_ZONE_ID \
    --query 'DelegationSet.NameServers'

# Copy these 4 nameservers - update your domain registrar
```

#### **Step 17: Add DNS Records**

```bash
# Get IPs
export LIGHTSAIL_IP=$(cat lightsail-ip.txt)

# Create DNS record for api subdomain
cat > api-dns.json << EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "api.phiintelligence.com",
      "Type": "A",
      "TTL": 300,
      "ResourceRecords": [{"Value": "$LIGHTSAIL_IP"}]
    }
  }]
}
EOF

# Apply
aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch file://api-dns.json
```

#### **Step 18: Add Domain to Amplify**

```bash
# Get Amplify app ID
export AMPLIFY_APP_ID=$(aws amplify list-apps --region eu-west-2 \
    --query "apps[?name=='phiai-frontend'].appId" \
    --output text)

# Add custom domain
aws amplify create-domain-association \
    --app-id $AMPLIFY_APP_ID \
    --domain-name phiintelligence.com \
    --enable-auto-sub-domain \
    --sub-domain-settings '[
        {"prefix":"","branchName":"main"},
        {"prefix":"www","branchName":"main"}
    ]' \
    --region eu-west-2

# Amplify will create DNS records automatically
# Check status in console
```

---

### **PHASE 8: FINAL CONFIGURATION** (10 minutes)

#### **Step 19: Update Amplify Environment Variables**

**Via AWS Console:**
1. Go to Amplify → Your app → **Environment variables**
2. Add:
   ```
   VITE_API_URL = https://api.phiintelligence.com
   VITE_PHI_TOKEN_SERVER_URL = https://api.phiintelligence.com/voice/phi
   VITE_COMPANY_TOKEN_SERVER_URL = https://api.phiintelligence.com/voice/company
   ```
3. **Save** → **Redeploy**

#### **Step 20: Test Everything**

```bash
# Test frontend
curl -I https://phiintelligence.com

# Test API
curl https://api.phiintelligence.com/api/health

# Test voice
curl https://api.phiintelligence.com/voice/phi/health

# Open in browser
xdg-open https://phiintelligence.com
```

---

## 📊 **FILES SUMMARY**

### **Created Files:**

1. ✅ **docker-compose.aws.yml** - AWS-compatible Docker Compose
2. ✅ **load-aws-secrets.sh** - Secrets loader script
3. ✅ **deploy-aws.sh** - Deployment automation
4. ✅ **.env.aws** - Environment template
5. ✅ **amplify.yml** - Amplify build config
6. ✅ **AWS-DEPLOYMENT-GUIDE.md** - This complete guide

### **Quick Command Reference:**

```bash
# On Lightsail:
source ./load-aws-secrets.sh           # Load secrets
./deploy-aws.sh                        # Deploy
docker compose -f docker-compose.aws.yml logs -f    # View logs
docker compose -f docker-compose.aws.yml restart    # Restart

# On Local:
git push origin main                   # Frontend auto-deploys
rsync -avz -e "ssh -i lightsail-key.pem" ./ ubuntu@$LIGHTSAIL_IP:/home/ubuntu/phiai/  # Upload code
```

---

## 💰 **TOTAL COST**

```
AWS Services (London):
├─ Amplify ........... £10-12/mo
├─ Lightsail ......... £32/mo
├─ Route 53 .......... £0.40/mo
├─ Secrets Manager ... £9.50/mo
└─ TOTAL AWS ......... £51-54/mo (~$64-67)

External (No Change):
├─ Neon PostgreSQL ... Free
├─ Pinecone .......... Free
├─ Cloudflare R2 ..... Free
├─ LiveKit Cloud ..... £40-80/mo
└─ TOTAL EXTERNAL .... £40-80/mo

GRAND TOTAL: £91-134/mo ($114-168/mo)
```

---

## ✅ **READY TO START?**

All files are created and ready. When you're ready, we'll start with:

**First command:**
```bash
aws configure
```

Let me know when you want to begin! 🚀

