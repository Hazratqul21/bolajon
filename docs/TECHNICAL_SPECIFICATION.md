# 📋 Bolajon Platform - Texnik Topshiriq

## 🎯 Loyiha Maqsadi

**Bolajon** - 4-7 yoshli bolalarga lotin alifbosida o'zbek tili va boshlang'ich matematika fanlarini o'rgatish uchun AI-asosida gamifikatsiya platformasi.

## 📌 Nima Qiladi?

1. **Alifbo o'rganish** - Har bir harfni ovozli talaffuz qilish, misol so'zlar, rasmlar
2. **Real-time AI suhbat** - Bola mikrofon orqali gapirib, AI talaffuzni tahlil qiladi va feedback beradi
3. **Gamifikatsiya** - XP, level, streak, achievements (yutuqlar)
4. **Progress tracking** - Har bir harf va so'z uchun progress kuzatish
5. **Matematika moduli** - Alifbo tugagach, qo'shish/ayirish o'rganish

## 🎮 Nima Bo'ladi?

- **Bola** mikrofon orqali gapirib, harflarni o'rganadi
- **AI** talaffuzni tahlil qiladi va to'g'ri/noto'g'ri deb baholaydi
- **Muxlisa AI** harflarni va so'zlarni ovozli aytadi (qiz bola ovozida - Maftuna)
- **Progress** har bir harf uchun 0-100% ko'rsatiladi
- **XP va Level** to'g'ri javoblar uchun beriladi
- **Achievements** barcha harflarni o'rganish, streak va boshqalar uchun

---

## 🏗️ Texnologiyalar

### Frontend
- **Next.js 16** (App Router) + **TypeScript**
- **React 19**, **Tailwind CSS 4**
- **Zustand** (state), **React Query** (data)
- **Muxlisa AI** (STT/TTS)

### Backend
- **FastAPI** (Python)
- **PostgreSQL** (database)
- **SQLAlchemy** (ORM), **Alembic** (migrations)
- **OpenAI API** (talaffuz baholash)
- **Muxlisa AI** (STT/TTS)

---

## 🔄 Ishlash Oqimi

1. **Onboarding** - Bola ismi, yoshi, qiziqishlar
2. **Real-time o'rganish:**
   - Harf ko'rsatiladi → Muxlisa TTS ovozli aytadi
   - Bola mikrofon orqali gapirib, so'z aytadi
   - Web Speech API / Muxlisa STT transkripsiya qiladi
   - AI tahlil qiladi: to'g'ri/noto'g'ri
   - Feedback beriladi + Progress yangilanadi
3. **Gamifikatsiya:**
   - To'g'ri javob → +10 XP, +10% progress
   - 100% progress → Harf "o'rganildi"
   - XP → Level oshadi
   - Streak → Har kuni o'qish

---

## 📁 Asosiy Fayllar

### Frontend
- `src/app/(dashboard)/learn-realtime/page.tsx` - **ASOSIY** real-time o'rganish
- `src/components/realtime/RealtimeMicButton.tsx` - Mikrofon tugmasi
- `src/lib/muxlisa-client.ts` - Muxlisa AI integratsiyasi

### Backend
- `backend/app/main.py` - FastAPI application
- `backend/app/api/routes/lessons.py` - Darslar va talaffuz tahlili
- `backend/app/services/muxlisa_service.py` - Muxlisa STT/TTS
- `backend/app/services/openai_service.py` - Talaffuz baholash
- `backend/app/services/gamification_service.py` - XP, level, unlock

---

## 🔧 Konfiguratsiya

### Environment Variables

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_MUXLISA_API_URL=https://service.muxlisa.uz/api
NEXT_PUBLIC_MUXLISA_API_KEY=your_api_key
```

**Backend (`.env`):**
```env
DATABASE_URL=postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon
OPENAI_API_KEY=sk-...
MUXLISA_API_KEY=your_api_key
```

---

## 🚀 Ishga Tushirish

```bash
# Avtomatik
./start.sh

# Yoki qo'lda
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
npm install && npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📊 Database

**Asosiy Jadvalar:**
- `users` - Foydalanuvchilar (XP, level, streak)
- `lessons` - Darslar (harflar, so'zlar)
- `lesson_attempts` - Urinishlar (audio, transcript, score)
- `user_progress` - Progress (status, xp_earned)
- `achievements` - Yutuqlar

---

## ✅ Asosiy Funksiyalar

- ✅ Real-time AI suhbat (mikrofon orqali)
- ✅ Harflarni ovozli talaffuz qilish (Muxlisa TTS - Maftuna ovozida)
- ✅ Talaffuzni tahlil qilish (OpenAI)
- ✅ Progress tracking (har bir harf uchun)
- ✅ Gamifikatsiya (XP, level, streak, achievements)
- ✅ Alphabet library (istalgan harfni tanlash)
- ✅ Keyboard shortcuts (← → harflar orasida)
- ✅ Confetti animatsiyasi (to'g'ri javob uchun)

---

**Versiya:** 0.1.0  
**Status:** MVP (Minimum Viable Product)
