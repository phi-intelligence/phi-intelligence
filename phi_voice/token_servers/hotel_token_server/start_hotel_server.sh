#!/bin/bash

# Hotel Token Server Startup Script
# Port: 8004

echo "🏨 Starting Hotel Token Server..."

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
export LIVEKIT_HOTEL_URL="wss://hotel-template-juiuz1pt.livekit.cloud"
export LIVEKIT_HOTEL_API_KEY="APIx8PeBZgw8hHP"
export LIVEKIT_HOTEL_API_SECRET="grxUsSRQFplOR2hTGy0cJ29xUdGE7fEXwFBmfNvulPq"

# Start the server
echo "🚀 Starting Hotel Token Server on port 8004..."
echo "🏨 Hotel: Grand Plaza Hotel, London, UK"
echo "🌐 Server URL: http://localhost:8004"
echo "📋 Health Check: http://localhost:8004/health"
echo "🎯 Token Endpoint: http://localhost:8004/token"
echo ""

python3 server.py
