# 🚀 Bolajon - Qanday Ishlatish

## 📋 Tarkib

1. [Birinchi marta sozlash](#birinchi-marta-sozlash)
2. [Backend ishga tushirish](#backend-ishga-tushirish)
3. [Frontend ishga tushirish](#frontend-ishga-tushirish)
4. [Loyihani ishlatish](#loyihani-ishlatish)
5. [Muammolar va yechimlar](#muammolar-va-yechimlar)

---

## 🔧 Birinchi marta sozlash

### 1. Database sozlash

```bash
# PostgreSQL ga ulanish
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
ALTER DATABASE bolajon OWNER TO bolajon;
ALTER SCHEMA public OWNER TO bolajon;

-- Chiqish
\q
```

**Yoki avtomatik:**

```bash
sudo -u postgres psql -f setup_database.sql
```

### 2. Backend sozlash

```bash
cd backend

# Virtual environment yaratish
python3 -m venv .venv
source .venv/bin/activate

# Dependencies o'rnatish
pip install --upgrade pip
pip install -r requirements.txt

# Environment variables
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export ALLOWED_ORIGINS="http://localhost:3000"

# Database migratsiyalarni qo'llash
alembic upgrade head
```

### 3. Frontend sozlash

```bash
# Root directory da
npm install
```

---

## 🖥️ Backend ishga tushirish

### Terminal 1: Backend

```bash
cd backend
source .venv/bin/activate
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
export ALLOWED_ORIGINS="http://localhost:3000"
uvicorn app.main:app --reload
```

**Natija:**
- ✅ Backend: http://localhost:8000
- ✅ Swagger API: http://localhost:8000/docs
- ✅ ReDoc: http://localhost:8000/redoc

---

## 🎨 Frontend ishga tushirish

### Terminal 2: Frontend

```bash
npm run dev
```

**Natija:**
- ✅ Frontend: http://localhost:3000

---

## 🎮 Loyihani ishlatish

### 1. Boshlash

1. Browser da oching: http://localhost:3000
2. **"Boshlash"** tugmasini bosing

### 2. Onboarding (Birinchi marta)

1. **Ismingizni kiriting** (masalan: Alisher)
2. **Yoshingizni kiriting** (4-7 yosh)
3. **"Keyingi"** tugmasini bosing
4. **Qiziqishlaringizni tanlang** (ixtiyoriy):
   - Hayvonlar
   - Mashinalar
   - Ranglar
   - Musiqa
   - Kitoblar
   - O'yinlar
5. **"Boshlash"** tugmasini bosing

### 3. O'rganish

1. **Markazdagi mikrofon tugmasini bosing** 🎙️
2. Browser mikrofon ruxsatini so'rasa, **"Ruxsat berish"** ni bosing
3. **Gapiring** - AI sizni eshitadi
4. **Harf ko'rinishi** - Ekranda katta harf ko'rsatiladi
5. **Misol so'zlar** - Har bir harf uchun 3 ta so'z ko'rsatiladi
6. **AI xabarlar** - AI sizga yordam beradi

### 4. Keyingi harf

1. **"Keyingi harf →"** tugmasini bosing
2. Keyingi harfga o'tadi
3. Yangi misol so'zlar ko'rsatiladi

### 5. Mikrofon to'xtatish

1. **Mikrofon tugmasini qayta bosing** 🎤
2. Yozish to'xtaydi

---

## 🔍 API Endpoints

### Health Check

```bash
curl http://localhost:8000/api/health/ping
```

### Guardian Ro'yxatdan O'tish

```bash
curl -X POST http://localhost:8000/api/auth/guardian/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "first_name": "Ota",
    "phone": "+998901234567"
  }'
```

### Child Onboarding

```bash
curl -X POST http://localhost:8000/api/auth/child/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alisher",
    "nickname": "Ali",
    "age": 5,
    "guardian_id": "guardian-uuid-here",
    "preferences": {"Hayvonlar": true}
  }'
```

### Swagger UI

Browser da oching: http://localhost:8000/docs

---

## 🐛 Muammolar va yechimlar

### 1. PostgreSQL ishlamayapti

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Database permissions xatosi

```bash
sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO bolajon;" bolajon
```

### 3. Backend ulanmayapti

- Backend ishga tushirilganligini tekshiring
- `http://localhost:8000/api/health/ping` ni browser da oching
- Port 8000 band bo'lmasligi kerak

### 4. Mikrofon ishlamayapti

- Browser sozlamalaridan mikrofon ruxsatini bering
- HTTPS kerak bo'lishi mumkin (production da)
- Mikrofon ulanganligini tekshiring

### 5. WebSocket xatosi

- Backend ishga tushirilganligini tekshiring
- Demo rejimda ham ishlaydi (3 sekunddan keyin)

### 6. Frontend build xatosi

```bash
rm -rf node_modules .next
npm install
npm run dev
```

---

## 📚 Qo'shimcha Ma'lumot

### Fayllar

- `README_SETUP.md` - Tezkor ishga tushirish
- `SETUP_COMPLETE.md` - Batafsil qo'llanma
- `FIX_PYTHON313.md` - Python muammolari
- `FIX_DATABASE.md` - Database muammolari

### Skriptlar

- `setup_database.sh` - Database avtomatik sozlash
- `quick_fix.sh` - Barcha muammolarni hal qilish
- `start.sh` - To'liq ishga tushirish

---

## 🎯 Keyingi Qadamlar

1. **Backend ishga tushirish** - Terminal 1
2. **Frontend ishga tushirish** - Terminal 2
3. **Browser da ochish** - http://localhost:3000
4. **"Boshlash" tugmasini bosing**
5. **Onboarding formani to'ldiring**
6. **Mikrofon tugmasini bosing va gapiring!**

---

## 💡 Maslahatlar

- **Backend va Frontend alohida terminalda ishga tushiring**
- **Browser console ni ochib qo'ying** (F12) - xatolarni ko'rish uchun
- **Swagger UI dan API ni test qiling** - http://localhost:8000/docs
- **Demo rejimda ham ishlaydi** - Backend ishlamasa ham frontend ishlaydi

---

**Muvaffaqiyatlar! 🎉**

