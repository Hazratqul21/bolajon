#!/bin/bash

# Tezkor muammolarni hal qilish skripti

set -e

echo "🔧 Barcha muammolarni hal qilish..."

# 1. Database sozlash
echo "1️⃣  Database sozlash..."
./setup_database.sh

# 2. Backend dependencies
echo "2️⃣  Backend dependencies tekshirish..."
cd backend
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

# 3. Environment variables
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export ALLOWED_ORIGINS="http://localhost:3000"

# 4. Migration
echo "3️⃣  Database migratsiyalarni qo'llash..."
alembic upgrade head

# 5. Test
echo "4️⃣  Test qilish..."
python -c "from app.core.config import settings; print('✅ Config OK')"
python -c "from app.models import User; print('✅ Models OK')"

echo ""
echo "✅ Barcha muammolar hal qilindi!"
echo ""
echo "Backend ni ishga tushirish:"
echo "  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "Frontend ni ishga tushirish:"
echo "  npm run dev"

