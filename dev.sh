#!/bin/bash
# Start backend and frontend together. Ctrl+C stops both.

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

echo "Starting backend..."
cd "$ROOT/backend"
source "$ROOT/.venv/bin/activate"
uvicorn app:app --reload --port 8000 &
BACKEND_PID=$!

echo "Starting frontend..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

wait
