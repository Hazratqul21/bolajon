# Tez Ishga Tushirish Qo'llanmasi

## Muammo: Docker o'rnatilmagan

Agar Docker o'rnatilmagan bo'lsa, quyidagi qadam-baqadam yo'riqnoma orqali loyihani ishga tushirishingiz mumkin.

## 1. PostgreSQL o'rnatish va ishga tushirish

```bash
# PostgreSQL o'rnatish (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL ni ishga tushirish
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database yaratish
sudo -u postgres psql
CREATE DATABASE bolajon;
CREATE USER bolajon WITH PASSWORD 'bolajon';
GRANT ALL PRIVILEGES ON DATABASE bolajon TO bolajon;
\q
```

## 2. Backend ni ishga tushirish

```bash
# Backend papkasiga o'tish
cd backend

# Virtual environment yaratish
python3 -m venv .venv

# Virtual environment ni faollashtirish
source .venv/bin/activate  # Linux/Mac
# yoki
.venv\Scripts\activate  # Windows

# Dependencies o'rnatish
pip install -r requirements.txt

# Environment variables sozlash
# .env fayl yaratish yoki export qilish
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export OPENAI_API_KEY="sk-..."  # Ixtiyoriy, lekin tavsiya etiladi
export MUXLISA_API_KEY="..."   # Ixtiyoriy
export ALLOWED_ORIGINS="http://localhost:3000"

# Database migratsiyalarni qo'llash
alembic upgrade head

# Seed data (100 000 ta dars)
python -m backend.scripts.seed

# Backend ni ishga tushirish
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend ishga tushgandan keyin:
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

## 3. Frontend ni ishga tushirish

Yangi terminal oching:

```bash
# Root papkaga qaytish
cd /home/urinov/launchlab/bolajon

# Dependencies o'rnatish
npm install

# Frontend ni ishga tushirish
npm run dev
```

Frontend ishga tushgandan keyin:
- Frontend: http://localhost:3000

## 4. Muammolarni hal qilish

### PostgreSQL ulanish xatosi

```bash
# PostgreSQL ishlayotganini tekshirish
sudo systemctl status postgresql

# Agar ishlamasa, qayta ishga tushirish
sudo systemctl restart postgresql

# Database mavjudligini tekshirish
sudo -u postgres psql -l | grep bolajon
```

### Backend xatolari

```bash
# Python versiyasini tekshirish (3.11+ kerak)
python3 --version

# Virtual environment faollashtirilganini tekshirish
which python  # .venv/bin/python ko'rsatishi kerak

# Dependencies to'liq o'rnatilganini tekshirish
pip list | grep fastapi
```

### Frontend xatolari

```bash
# Node.js versiyasini tekshirish (18+ kerak)
node --version

# Dependencies to'liq o'rnatilganini tekshirish
npm list next

# Build xatolarini tekshirish
npm run build
```

### Port band bo'lgan xatolar

```bash
# 8000 port band bo'lsa
lsof -i :8000
kill -9 <PID>

# 3000 port band bo'lsa
lsof -i :3000
kill -9 <PID>
```

## 5. Test qilish

1. Backend health check:
   ```bash
   curl http://localhost:8000/api/health/ping
   ```

2. Frontend ochish:
   - Browser da: http://localhost:3000
   - "Boshlash" tugmasini bosing
   - Onboarding formani to'ldiring
   - Real-time learn page ga o'ting

## 6. Docker o'rnatish (ixtiyoriy)

Agar keyinchalik Docker ishlatmoqchi bo'lsangiz:

```bash
# Docker o'rnatish
sudo apt update
sudo apt install docker.io docker-compose

# Docker ni ishga tushirish
sudo systemctl start docker
sudo systemctl enable docker

# Docker compose orqali ishga tushirish
docker compose up --build
```

## Qo'shimcha yordam

- Backend loglari: terminaldagi `uvicorn` chiqishi
- Frontend loglari: terminaldagi `next dev` chiqishi
- Database loglari: `sudo tail -f /var/log/postgresql/postgresql-*.log`

