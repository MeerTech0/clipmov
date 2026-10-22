#!/usr/bin/env bash
# CLIP Premium — local test server (macOS / Linux)
cd "$(dirname "$0")" || exit 1

echo ""
echo "  =========================================="
echo "    CLIP PREMIUM  -  local test server"
echo "  =========================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  [X] Node.js is not installed -> https://nodejs.org (LTS)"
  exit 1
fi
echo "  [OK] Node.js $(node -v)"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "  [i] Created .env from .env.example."
  echo "      Open .env and paste your key after TMDB_TOKEN="
  echo "      Get a free key here: https://www.themoviedb.org/settings/api"
  echo "      Then run ./start.sh again."
  exit 0
fi

echo "  [i] Server: http://localhost:8080"
echo "      Press Ctrl+C to stop"
echo ""
( sleep 1.2; (open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null) ) &
exec node server.js
