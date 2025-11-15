#!/bin/bash

# Bolajon loyihasini to'xtatish skripti

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_PID_FILE="/tmp/bolajon3_backend.pid"
FRONTEND_PID_FILE="/tmp/bolajon3_frontend.pid"

echo -e "${YELLOW}🛑 Bolajon loyihasini to'xtatish...${NC}"

# Backend to'xtatish
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Backend to'xtatilmoqda (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        sleep 1
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ Backend to'xtatildi${NC}"
    else
        echo "Backend allaqachon to'xtatilgan"
    fi
    rm -f "$BACKEND_PID_FILE"
else
    echo "Backend PID fayli topilmadi"
fi

# Frontend to'xtatish
if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Frontend to'xtatilmoqda (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 1
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ Frontend to'xtatildi${NC}"
    else
        echo "Frontend allaqachon to'xtatilgan"
    fi
    rm -f "$FRONTEND_PID_FILE"
else
    echo "Frontend PID fayli topilmadi"
fi

# Port larni tozalash (agar process to'xtatilmagan bo'lsa)
echo "Port larni tekshirish..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Docker Compose to'xtatish (ixtiyoriy)
if command -v docker-compose > /dev/null || command -v docker > /dev/null; then
    echo "Docker servislarni to'xtatish..."
    if command -v docker-compose > /dev/null; then
        docker-compose stop 2>/dev/null || true
    else
        docker compose stop 2>/dev/null || true
    fi
fi

echo -e "${GREEN}✅ Barcha process lar to'xtatildi${NC}"

