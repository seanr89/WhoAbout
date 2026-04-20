#!/bin/bash
# Start backend
cd /app/src/bookings-api
dotnet run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Start frontend
cd /app/src/booking-client
npm run dev -- --port 3000 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "Waiting for services to start..."
sleep 5
