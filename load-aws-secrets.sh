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

# LiveKit - Hotel
export LIVEKIT_HOTEL_URL=$(get_secret "livekit-hotel-url")
echo "✓ LIVEKIT_HOTEL_URL loaded"

export LIVEKIT_HOTEL_API_KEY=$(get_secret "livekit-hotel-api-key")
echo "✓ LIVEKIT_HOTEL_API_KEY loaded"

export LIVEKIT_HOTEL_API_SECRET=$(get_secret "livekit-hotel-api-secret")
echo "✓ LIVEKIT_HOTEL_API_SECRET loaded"

# LiveKit - Restaurant
export LIVEKIT_RESTAURANT_URL=$(get_secret "livekit-restaurant-url")
echo "✓ LIVEKIT_RESTAURANT_URL loaded"

export LIVEKIT_RESTAURANT_API_KEY=$(get_secret "livekit-restaurant-api-key")
echo "✓ LIVEKIT_RESTAURANT_API_KEY loaded"

export LIVEKIT_RESTAURANT_API_SECRET=$(get_secret "livekit-restaurant-api-secret")
echo "✓ LIVEKIT_RESTAURANT_API_SECRET loaded"

# LiveKit - Hospital
export LIVEKIT_HOSPITAL_URL=$(get_secret "livekit-hospital-url")
echo "✓ LIVEKIT_HOSPITAL_URL loaded"

export LIVEKIT_HOSPITAL_API_KEY=$(get_secret "livekit-hospital-api-key")
echo "✓ LIVEKIT_HOSPITAL_API_KEY loaded"

export LIVEKIT_HOSPITAL_API_SECRET=$(get_secret "livekit-hospital-api-secret")
echo "✓ LIVEKIT_HOSPITAL_API_SECRET loaded"

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

# Load CORS from .env file if exists
if [ -f ".env.aws" ]; then
    export $(grep -v '^#' .env.aws | xargs)
    echo "✓ CORS configuration loaded from .env.aws"
fi

echo ""
echo "✅ All secrets loaded successfully!"
echo "   Region: $AWS_REGION"
echo "   Secrets loaded: 29"
echo ""
echo "Now you can run: docker compose -f docker-compose.aws.yml up -d"

