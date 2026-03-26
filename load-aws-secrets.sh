#!/bin/bash
# ========================================
# Load Secrets from AWS Secrets Manager
# ========================================
# This script fetches all secrets from AWS Secrets Manager
# and exports them as environment variables for Docker Compose
#
# Usage: source ./load-aws-secrets.sh

set -e

AWS_REGION=${AWS_REGION:-eu-west-2}

echo "🔐 Loading secrets from AWS Secrets Manager (Region: $AWS_REGION)..."

# Function to get secret value
get_secret() {
    local secret_name=$1
    aws secretsmanager get-secret-value \
        --secret-id "phiai/$secret_name" \
        --region $AWS_REGION \
        --query 'SecretString' \
        --output text 2>/dev/null
}

# Database
export DATABASE_URL=$(get_secret "database-url")
echo "✓ DATABASE_URL loaded"

# AI API Keys
export OPENAI_API_KEY=$(get_secret "openai-api-key")
echo "✓ OPENAI_API_KEY loaded"

export DEEPGRAM_API_KEY=$(get_secret "deepgram-api-key")
echo "✓ DEEPGRAM_API_KEY loaded"

# Google Gemini (for chat when CHAT_LLM_PROVIDER=gemini)
export GOOGLE_API_KEY=$(get_secret "google-api-key")
[ -n "$GOOGLE_API_KEY" ] && echo "✓ GOOGLE_API_KEY loaded" || echo "⚠ GOOGLE_API_KEY not set (create phiai/google-api-key in AWS Secrets Manager for Gemini chat)"

export CHAT_LLM_PROVIDER="${CHAT_LLM_PROVIDER:-gemini}"
echo "✓ CHAT_LLM_PROVIDER=$CHAT_LLM_PROVIDER"

# Pinecone
export PINECONE_API_KEY=$(get_secret "pinecone-api-key")
echo "✓ PINECONE_API_KEY loaded"

export PINECONE_ENVIRONMENT=$(get_secret "pinecone-environment")
echo "✓ PINECONE_ENVIRONMENT loaded"

export PINECONE_INDEX_NAME=$(get_secret "pinecone-index-name")
echo "✓ PINECONE_INDEX_NAME loaded"

# LiveKit - Phi
export LIVEKIT_PHI_URL=$(get_secret "livekit-phi-url")
echo "✓ LIVEKIT_PHI_URL loaded"

export LIVEKIT_PHI_API_KEY=$(get_secret "livekit-phi-api-key")
echo "✓ LIVEKIT_PHI_API_KEY loaded"

export LIVEKIT_PHI_API_SECRET=$(get_secret "livekit-phi-api-secret")
echo "✓ LIVEKIT_PHI_API_SECRET loaded"

# LiveKit - Company
export LIVEKIT_COMPANY_URL=$(get_secret "livekit-company-url")
echo "✓ LIVEKIT_COMPANY_URL loaded"

export LIVEKIT_COMPANY_API_KEY=$(get_secret "livekit-company-api-key")
echo "✓ LIVEKIT_COMPANY_API_KEY loaded"

export LIVEKIT_COMPANY_API_SECRET=$(get_secret "livekit-company-api-secret")
echo "✓ LIVEKIT_COMPANY_API_SECRET loaded"

# JWT & Session Secrets
export JWT_SECRET=$(get_secret "jwt-access-secret")
echo "✓ JWT_SECRET loaded"

export JWT_REFRESH_SECRET=$(get_secret "jwt-refresh-secret")
echo "✓ JWT_REFRESH_SECRET loaded"

export SESSION_SECRET=$(get_secret "session-secret")
echo "✓ SESSION_SECRET loaded"

# Cloudflare R2
export R2_ACCESS_KEY_ID=$(get_secret "r2-access-key")
echo "✓ R2_ACCESS_KEY_ID loaded"

export R2_SECRET_ACCESS_KEY=$(get_secret "r2-secret-key")
echo "✓ R2_SECRET_ACCESS_KEY loaded"

export R2_BUCKET_NAME=$(get_secret "r2-bucket-name")
echo "✓ R2_BUCKET_NAME loaded"

export R2_ENDPOINT=$(get_secret "r2-endpoint")
echo "✓ R2_ENDPOINT loaded"

export CLOUDFLARE_ACCOUNT_ID=$(get_secret "cloudflare-account-id")
echo "✓ CLOUDFLARE_ACCOUNT_ID loaded"

# CORS Configuration for Custom Domain
export VITE_ALLOWED_ORIGINS="https://www.phiintelligence.com,https://phiintelligence.com,https://main.d3ozd8k0s4za13.amplifyapp.com"
echo "✓ VITE_ALLOWED_ORIGINS set"

# Backend API URL (CRITICAL for frontend-backend communication)
export VITE_API_URL="https://api.phiintelligence.com"
echo "✓ VITE_API_URL set"

# Token Server CORS Configuration (for Python FastAPI services)
export ALLOWED_ORIGINS="https://www.phiintelligence.com,https://phiintelligence.com,https://main.d3ozd8k0s4za13.amplifyapp.com"
echo "✓ ALLOWED_ORIGINS set for token servers"

# Load additional CORS from .env file if exists
if [ -f ".env.aws" ]; then
    export $(grep -v '^#' .env.aws | xargs)
    echo "✓ Additional configuration loaded from .env.aws"
fi

echo ""
echo "✅ All secrets loaded successfully!"
echo "   Region: $AWS_REGION"
echo "   Secrets loaded: 20 (+ CORS overrides)"
echo "   CORS Origins: $VITE_ALLOWED_ORIGINS"
echo "   API URL: $VITE_API_URL"
echo ""
echo "Now you can run: docker compose -f docker-compose.aws.yml up -d"

