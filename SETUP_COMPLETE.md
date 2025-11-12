# To'liq Sozlash Qo'llanmasi

## 1. Database Sozlash (Bir marta)

Quyidagi buyruqlarni bajarishingiz kerak:

```bash
sudo -u postgres psql
```

Keyin SQL buyruqlarini kiriting:

```sql
-- Database yaratish
CREATE DATABASE bolajon;

-- User yaratish
CREATE USER bolajon WITH PASSWORD 'bolajon';

-- Database ga ulanish
\c bolajon

-- Barcha huquqlarni berish
GRANT ALL PRIVILEGES ON DATABASE bolajon TO bolajon;
GRANT ALL ON SCHEMA public TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO bolajon;
ALTER DATABASE bolajon OWNER TO bolajon;
ALTER SCHEMA public OWNER TO bolajon;

-- Chiqish
\q
```

## 2. Backend Sozlash

```bash
cd backend

# Virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Environment variables
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export ALLOWED_ORIGINS="http://localhost:3000"

# Migration
alembic upgrade head

# Test
python -c "from app.core.config import settings; print('✅ Config OK')"
```

## 3. Backend Ishga Tushirish

```bash
cd backend
source .venv/bin/activate
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export ALLOWED_ORIGINS="http://localhost:3000"
uvicorn app.main:app --reload
```

Backend: http://localhost:8000
Swagger: http://localhost:8000/docs

## 4. Frontend Sozlash

Yangi terminal:

```bash
npm install
npm run dev
```

Frontend: http://localhost:3000

## 5. Test Qilish

1. Backend health check:
   ```bash
   curl http://localhost:8000/api/health/ping
   ```

2. Browser da: http://localhost:3000
3. "Boshlash" tugmasini bosing
4. Onboarding formani to'ldiring

## Muammolar

Agar muammo bo'lsa:
- `FIX_PYTHON313.md` - Python 3.13 muammolari
- `FIX_DATABASE.md` - Database permissions
- `QUICK_START.md` - Umumiy qo'llanma

