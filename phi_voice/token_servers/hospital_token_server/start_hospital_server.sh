#!/bin/bash

# Hospital Token Server Startup Script
# Port: 8006

echo "🏥 Starting Hospital Token Server..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.11 or later."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables (will be overridden by .env file)
export LIVEKIT_HOSPITAL_URL="wss://hospital-template-d1yx0cjd.livekit.cloud"
export LIVEKIT_HOSPITAL_API_KEY="APIj2mZvGQBNj3R"
export LIVEKIT_HOSPITAL_API_SECRET="Lej1m4ppAnj0INDfnUHkT65tjUifHUYVG4OQ9FNF2RqA"

# Start the server
echo "🚀 Starting Hospital Token Server on port 8006..."
echo "🏥 Hospital: MedCare Hospital, London, UK"
echo "🌐 Server URL: http://localhost:8006"
echo "📋 Health Check: http://localhost:8006/health"
echo "🎯 Token Endpoint: http://localhost:8006/token"
echo ""

python3 server.py
