# 🚀 Tezkor Ishga Tushirish

## Birinchi marta sozlash (5 daqiqa)

### 1. Database sozlash

```bash
sudo -u postgres psql -f setup_database.sql
```

Yoki qo'lda:

```bash
sudo -u postgres psql
```

Keyin SQL ni copy-paste qiling:

```sql
CREATE DATABASE bolajon;
CREATE USER bolajon WITH PASSWORD 'bolajon';
\c bolajon
GRANT ALL PRIVILEGES ON DATABASE bolajon TO bolajon;
GRANT ALL ON SCHEMA public TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bolajon;
ALTER DATABASE bolajon OWNER TO bolajon;
ALTER SCHEMA public OWNER TO bolajon;
\q
```

### 2. Backend sozlash

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export ALLOWED_ORIGINS="http://localhost:3000"
alembic upgrade head
```

### 3. Backend ishga tushirish

```bash
cd backend
source .venv/bin/activate
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export ALLOWED_ORIGINS="http://localhost:3000"
uvicorn app.main:app --reload
```

### 4. Frontend ishga tushirish (yangi terminal)

```bash
npm install
npm run dev
```

## Test

- Backend: http://localhost:8000/docs
- Frontend: http://localhost:3000

## Qo'shimcha

- `SETUP_COMPLETE.md` - Batafsil qo'llanma
- `FIX_PYTHON313.md` - Python muammolari
- `FIX_DATABASE.md` - Database muammolari

