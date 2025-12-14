#!/bin/bash

# Can't Stop Game - Mobile Version Launcher
# Just run: ./play-mobile.sh

echo "📱 Starting Can't Stop Game (Mobile Version)..."
echo ""

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Install backend dependencies silently
echo "⚙️  Setting up backend..."
cd "$DIR/backend"
python3 -m pip install --user -q fastapi uvicorn pydantic 2>/dev/null

# Start backend in background
python3 main.py > /tmp/cantstop-backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 2

# Install frontend dependencies if needed
cd "$DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "⚙️  Setting up frontend (first time only)..."
    npm install --silent > /dev/null 2>&1
fi

echo "✓ Frontend starting..."
echo ""
echo "========================================="
echo "  📱 Mobile version opening in browser..."
echo "  📍 URL: http://localhost:5174"
echo "  💡 Use browser DevTools (F12) to"
echo "     toggle device mode for mobile view"
echo "  💡 Press Ctrl+Shift+R to hard refresh"
echo "     and clear cache if needed"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop the game"
echo ""

# Clear any dist-mobile build
echo "🧹 Clearing old build..."
rm -rf "$DIR/frontend/dist-mobile"

# Start frontend mobile version (this will block)
npm run dev:mobile &
FRONTEND_PID=$!

# Wait a moment for frontend to start, then open browser
sleep 3
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:5174 2>/dev/null &
elif command -v open > /dev/null; then
    open http://localhost:5174 2>/dev/null &
elif command -v wslview > /dev/null; then
    wslview http://localhost:5174 2>/dev/null &
fi

# Wait for frontend to finish
wait $FRONTEND_PID

# Cleanup
echo ""
echo "🛑 Stopping game..."
kill $BACKEND_PID 2>/dev/null
echo "✓ Stopped"
