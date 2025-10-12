#!/bin/bash

# Restaurant Token Server Startup Script
# Port: 8005

echo "🍽️ Starting Restaurant Token Server..."

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
export LIVEKIT_RESTAURANT_URL="wss://restuarant-template-p9meuxon.livekit.cloud"
export LIVEKIT_RESTAURANT_API_KEY="APIT2zi2zaUah8D"
export LIVEKIT_RESTAURANT_API_SECRET="0HI083y1xcfXP1i0laDufxClaffuZdb4X83f53Oe5HBA"

# Start the server
echo "🚀 Starting Restaurant Token Server on port 8005..."
echo "🍽️ Restaurant: Bella Vista Restaurant, London, UK"
echo "🌐 Server URL: http://localhost:8005"
echo "📋 Health Check: http://localhost:8005/health"
echo "🎯 Token Endpoint: http://localhost:8005/token"
echo ""

python3 server.py
