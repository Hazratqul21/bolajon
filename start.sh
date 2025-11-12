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

# Database yaratish va sozlash
echo "🗄️  Database yaratish va sozlash..."
if [ -f "./setup_database.sh" ]; then
    ./setup_database.sh
else
    echo "⚠️  setup_database.sh topilmadi. Qo'lda sozlash..."
    sudo -u postgres psql <<EOF
SELECT 'CREATE DATABASE bolajon' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bolajon')\gexec
DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'bolajon') THEN CREATE USER bolajon WITH PASSWORD 'bolajon'; END IF; END \$\$;
\c bolajon
GRANT ALL PRIVILEGES ON DATABASE bolajon TO bolajon;
GRANT ALL ON SCHEMA public TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bolajon;
ALTER DATABASE bolajon OWNER TO bolajon;
ALTER SCHEMA public OWNER TO bolajon;
\q
EOF
fi

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

