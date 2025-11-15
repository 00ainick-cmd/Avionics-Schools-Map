#!/bin/bash

# Avionics Schools Map - Startup Script
# This script helps you get the map running quickly

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🗺️  Avionics Schools Map - Startup Guide            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   cd /home/user/Avionics-Schools-Map"
    exit 1
fi

echo "📋 What would you like to do?"
echo ""
echo "1) Load sample data (first time setup)"
echo "2) Start backend server"
echo "3) Start frontend (in new terminal)"
echo "4) Start BOTH (backend + frontend)"
echo "5) Check if everything is installed"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📊 Loading sample data into database..."
        echo "⏱️  This will take about 45-60 seconds (geocoding addresses)"
        echo ""
        cd backend
        npm run load-sample-data
        echo ""
        echo "✅ Done! Now start the servers (option 4)"
        ;;
    2)
        echo ""
        echo "🚀 Starting backend server on http://localhost:3001"
        echo "   Press Ctrl+C to stop"
        echo ""
        cd backend
        npm run dev
        ;;
    3)
        echo ""
        echo "🚀 Starting frontend on http://localhost:5173"
        echo "   Make sure backend is running in another terminal!"
        echo "   Press Ctrl+C to stop"
        echo ""
        cd frontend
        npm run dev
        ;;
    4)
        echo ""
        echo "🚀 Starting both backend and frontend..."
        echo "   Backend: http://localhost:3001"
        echo "   Frontend: http://localhost:5173"
        echo ""
        echo "   Press Ctrl+C to stop both servers"
        echo ""

        # Start backend in background
        cd backend
        npm run dev &
        BACKEND_PID=$!

        # Wait a bit for backend to start
        sleep 3

        # Start frontend
        cd ../frontend
        npm run dev &
        FRONTEND_PID=$!

        echo ""
        echo "✅ Both servers started!"
        echo "   Open your browser to: http://localhost:5173"
        echo ""

        # Wait for user to press Ctrl+C
        trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
        wait
        ;;
    5)
        echo ""
        echo "🔍 Checking installation..."
        echo ""

        # Check Node.js
        if command -v node &> /dev/null; then
            echo "✅ Node.js installed: $(node --version)"
        else
            echo "❌ Node.js not found"
        fi

        # Check npm
        if command -v npm &> /dev/null; then
            echo "✅ npm installed: $(npm --version)"
        else
            echo "❌ npm not found"
        fi

        # Check backend dependencies
        if [ -d "backend/node_modules" ]; then
            echo "✅ Backend dependencies installed"
        else
            echo "❌ Backend dependencies missing - run: cd backend && npm install"
        fi

        # Check frontend dependencies
        if [ -d "frontend/node_modules" ]; then
            echo "✅ Frontend dependencies installed"
        else
            echo "❌ Frontend dependencies missing - run: cd frontend && npm install"
        fi

        # Check database
        if [ -f "backend/data/avionics-map.db" ]; then
            echo "✅ Database exists (data loaded)"
        else
            echo "⚠️  Database not found - run option 1 to load sample data"
        fi

        echo ""
        ;;
    *)
        echo "Invalid choice. Please run again and choose 1-5"
        exit 1
        ;;
esac
