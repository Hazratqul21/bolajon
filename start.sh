#!/bin/bash

# Bolajon loyihasini to'liq avtomatik ishga tushirish skripti

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# PID fayllar
BACKEND_PID_FILE="/tmp/bolajon3_backend.pid"
FRONTEND_PID_FILE="/tmp/bolajon3_frontend.pid"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 To'xtatilmoqda...${NC}"
    
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "Backend to'xtatilmoqda (PID: $BACKEND_PID)..."
            kill $BACKEND_PID 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo "Frontend to'xtatilmoqda (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    echo -e "${GREEN}✅ To'xtatildi${NC}"
    exit 0
}

# Signal handlers
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}🚀 Bolajon loyihasini ishga tushirish...${NC}"

# PostgreSQL ni tekshirish va ishga tushirish
echo -e "${YELLOW}📦 PostgreSQL ni tekshirish...${NC}"
if ! systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "⚠️  PostgreSQL ishlamayapti. Docker Compose orqali ishga tushirilmoqda..."
    if command -v docker-compose > /dev/null || command -v docker > /dev/null; then
        echo "Docker Compose orqali PostgreSQL ishga tushirilmoqda..."
    else
        echo "⚠️  Docker topilmadi. PostgreSQL ni qo'lda ishga tushiring"
    fi
    sleep 2
fi

# Docker Compose orqali ishga tushirish (tavsiya etiladi)
if command -v docker-compose > /dev/null || command -v docker > /dev/null; then
    echo -e "${YELLOW}🐳 Docker Compose orqali ishga tushirish...${NC}"
    if command -v docker-compose > /dev/null; then
        docker-compose up -d postgres redis 2>/dev/null || true
    else
        docker compose up -d postgres redis 2>/dev/null || true
    fi
    echo "PostgreSQL va Redis Docker orqali ishga tushirildi"
    sleep 3
fi

# Backend setup
echo -e "${YELLOW}🔧 Backend ni sozlash...${NC}"
cd backend

if [ ! -d ".venv" ]; then
    echo "📦 Virtual environment yaratish..."
    python3 -m venv .venv || {
        echo -e "${RED}❌ Python3 virtual environment yaratib bo'lmadi${NC}"
        exit 1
    }
fi

echo "📦 Dependencies o'rnatish..."
source .venv/bin/activate
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

# Environment variables
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export OPENAI_API_KEY="${OPENAI_API_KEY:-}"
export MUXLISA_API_KEY="${MUXLISA_API_KEY:-}"
export ALLOWED_ORIGINS="http://localhost:3000"

# Migratsiyalar
echo "🔄 Database migratsiyalarni qo'llash..."
alembic upgrade head || {
    echo -e "${YELLOW}⚠️  Migration xatosi. Database sozlangani tekshiring.${NC}"
}

# Seed (ixtiyoriy - skip by default)
SKIP_SEED="${SKIP_SEED:-true}"
if [ "$SKIP_SEED" != "true" ]; then
    echo "🌱 Seed data yuklash..."
    python -m app.db.seed 2>/dev/null || echo "⚠️  Seed xatosi"
    
    # Har bir harf uchun 100 ta so'z kiritish
    echo "📝 Har bir harf uchun 100 ta so'z kiritilmoqda..."
    python scripts/seed_words.py 2>/dev/null || echo "⚠️  So'zlar kiritishda xatolik"
fi

# Backend ni ishga tushirish
echo -e "${GREEN}🚀 Backend ishga tushirilmoqda...${NC}"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/bolajon3_backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$BACKEND_PID_FILE"

# Backend ishga tushganini kutish
echo "Backend ishga tushishini kutmoqda..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/health/ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend ishga tushdi!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Backend ishga tushmadi. Log: /tmp/bolajon3_backend.log${NC}"
    fi
    sleep 1
done

cd ..

# Frontend setup
echo -e "${YELLOW}🎨 Frontend ni sozlash...${NC}"
if [ ! -d "node_modules" ]; then
    echo "📦 Frontend dependencies o'rnatish..."
    npm install --silent
fi

# Frontend ni ishga tushirish
echo -e "${GREEN}🚀 Frontend ishga tushirilmoqda...${NC}"
npm run dev > /tmp/bolajon3_frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"

# Frontend ishga tushganini kutish
echo "Frontend ishga tushishini kutmoqda..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend ishga tushdi!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Frontend ishga tushmadi. Log: /tmp/bolajon3_frontend.log${NC}"
    fi
    sleep 1
done

# Success message
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Barcha tayyor va ishlamoqda!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📡 Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "📚 Swagger:  ${GREEN}http://localhost:8000/docs${NC}"
echo -e "🎨 Frontend: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "📋 Log fayllar:"
echo -e "   Backend:  /tmp/bolajon3_backend.log"
echo -e "   Frontend: /tmp/bolajon3_frontend.log"
echo ""
echo -e "🛑 To'xtatish uchun: ${YELLOW}Ctrl+C${NC} yoki ${YELLOW}./stop.sh${NC}"
echo ""

# Keep script running
wait
