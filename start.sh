#!/bin/bash

# Bolajon loyihasini ishga tushirish skripti

set -e

echo "🚀 Bolajon loyihasini ishga tushirish..."

# PostgreSQL ni tekshirish va ishga tushirish
echo "📦 PostgreSQL ni tekshirish..."
if ! systemctl is-active --quiet postgresql; then
    echo "⚠️  PostgreSQL ishlamayapti. Quyidagi buyruqni bajarishingiz kerak:"
    echo "   sudo systemctl start postgresql"
    echo "   sudo systemctl enable postgresql"
    read -p "PostgreSQL ni ishga tushirdingizmi? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ PostgreSQL ni ishga tushirish kerak. Skript to'xtatildi."
        exit 1
    fi
fi

# Database yaratish
echo "🗄️  Database yaratish..."
sudo -u postgres psql -c "CREATE DATABASE bolajon;" 2>/dev/null || echo "Database allaqachon mavjud"
sudo -u postgres psql -c "CREATE USER bolajon WITH PASSWORD 'bolajon';" 2>/dev/null || echo "User allaqachon mavjud"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bolajon TO bolajon;" 2>/dev/null || echo "Grant allaqachon berilgan"

# Backend setup
echo "🔧 Backend ni sozlash..."
cd backend

if [ ! -d ".venv" ]; then
    echo "📦 Virtual environment yaratish..."
    python3 -m venv .venv
fi

echo "📦 Dependencies o'rnatish..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Environment variables
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export OPENAI_API_KEY="${OPENAI_API_KEY:-}"
export MUXLISA_API_KEY="${MUXLISA_API_KEY:-}"
export ALLOWED_ORIGINS="http://localhost:3000"

# Migratsiyalar
echo "🔄 Database migratsiyalarni qo'llash..."
alembic upgrade head

# Seed (ixtiyoriy)
read -p "Seed data yuklashni xohlaysizmi? (100 000 ta dars) (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seed data yuklash..."
    python -m backend.scripts.seed
fi

echo "✅ Backend tayyor! Keyingi terminalda quyidagi buyruqni bajaring:"
echo "   cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "Yoki avtomatik ishga tushirishni xohlaysizmi? (y/n)"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Backend ishga tushirilmoqda..."
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    echo "Backend: http://localhost:8000"
    echo "Swagger: http://localhost:8000/docs"
fi

cd ..

# Frontend setup
echo "🎨 Frontend ni sozlash..."
if [ ! -d "node_modules" ]; then
    echo "📦 Frontend dependencies o'rnatish..."
    npm install
fi

echo "✅ Frontend tayyor! Keyingi terminalda quyidagi buyruqni bajaring:"
echo "   npm run dev"
echo ""
echo "Yoki avtomatik ishga tushirishni xohlaysizmi? (y/n)"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Frontend ishga tushirilmoqda..."
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    echo "Frontend: http://localhost:3000"
fi

echo ""
echo "✅ Barcha tayyor!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "To'xtatish uchun: Ctrl+C yoki kill $BACKEND_PID $FRONTEND_PID"

