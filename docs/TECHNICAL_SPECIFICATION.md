# 📋 Bolajon Platform - To'liq Texnik Topshiriq (TZ)

## 🎯 Loyiha Maqsadi

**Bolajon** - 4-7 yoshli bolalarga lotin alifbosida o'zbek tili va boshlang'ich matematika fanlarini o'rgatish uchun yaratilgan AI-asosida gamifikatsiya platformasi.

### Asosiy Vazifalar:
1. **Alifbo o'rganish** - Har bir harfni ovozli talaffuz qilish, misol so'zlar, rasmlar
2. **Real-time AI suhbat** - Bola mikrofon orqali gapirib, AI talaffuzni tahlil qiladi
3. **Gamifikatsiya** - XP, level, streak, achievements
4. **Progress tracking** - Har bir harf va so'z uchun progress kuzatish
5. **Matematika moduli** - Alifbo tugagach, qo'shish/ayirish o'rganish

---

## 🏗️ Arxitektura

### 1. Frontend (Next.js 16 + TypeScript)

**Texnologiyalar:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand (state management)
- React Query (data fetching)
- Canvas Confetti (animatsiyalar)

**Asosiy Komponentlar:**

#### `src/app/page.tsx` - Bosh sahifa
- Onboarding form (bola ismi, yoshi, qiziqishlar)
- Guardian ro'yxatdan o'tish
- Demo rejim (backend ulanmasa ham ishlaydi)

#### `src/app/(dashboard)/learn-realtime/page.tsx` - Real-time o'rganish
- **Asosiy funksiya:** Bola mikrofon orqali gapirib, AI bilan real-time suhbat qiladi
- **Funksiyalar:**
  - Har bir harfni ko'rsatish va ovozli talaffuz qilish (Muxlisa TTS)
  - Misol so'zlar va rasmlar ko'rsatish
  - Mikrofon orqali gapirish (Web Speech API + Muxlisa STT)
  - AI talaffuzni tahlil qilish va feedback berish
  - Progress tracking (har bir harf uchun 0-100%)
  - Alphabet library (sidebar) - istalgan harfni tanlash
  - Keyboard shortcuts (← → harflar orasida, Esc kutubxonani yopish)
  - Confetti animatsiyasi (to'g'ri javob uchun)

#### `src/app/(dashboard)/learn/page.tsx` - Demo o'rganish
- Harflarni ko'rsatish
- So'zlarni ovozli aytish
- Voice recording va AI feedback

**Komponentlar:**
- `RealtimeMicButton` - Mikrofon tugmasi (real-time STT)
- `LetterCard` - Harf kartasi
- `WordPractice` - So'z mashq qilish
- `AIFeedback` - AI feedback ko'rsatish
- `ProgressBar` - Progress ko'rsatkich
- `StarsDisplay` - Yulduzlar ko'rsatish

**State Management:**
- `useUserStore` - Foydalanuvchi ma'lumotlari
- `useLearningStore` - O'rganish holati (currentLetterIndex, currentWordIndex, feedback)

### 2. Backend (FastAPI + Python)

**Texnologiyalar:**
- FastAPI 0.115.0
- SQLAlchemy 2.0 (async)
- Alembic (migrations)
- PostgreSQL (asyncpg)
- OpenAI API (talaffuz baholash)
- Muxlisa AI (STT/TTS)
- Pydantic (validation)

**Struktura:**

```
backend/app/
├── main.py                 # FastAPI application
├── api/
│   ├── routes/
│   │   ├── auth.py         # Ro'yxatdan o'tish/kirish
│   │   ├── sessions.py     # Dars sessiyalari
│   │   ├── lessons.py      # Darslar va talaffuz tahlili
│   │   ├── progress.py     # Progress va gamifikatsiya
│   │   ├── math.py         # Matematika moduli
│   │   ├── realtime.py     # WebSocket real-time suhbat
│   │   ├── admin.py        # Admin API (kontent import)
│   │   └── health.py       # Health check
│   └── deps.py             # Dependencies (DB, services)
├── services/
│   ├── learning_service.py      # Darslarni tanlash
│   ├── gamification_service.py  # XP, level, streak, unlock
│   ├── openai_service.py        # Talaffuz baholash
│   ├── muxlisa_service.py      # STT/TTS integratsiyasi
│   └── math_service.py          # Matematika tekshirish
├── models/                 # SQLAlchemy modellar
├── schemas/                # Pydantic schemas
└── db/
    ├── base.py            # Base model
    ├── session.py         # DB session
    └── seed.py            # Initial data seeding
```

**Asosiy API Endpointlar:**

| Method | Endpoint | Maqsad |
|--------|----------|--------|
| POST | `/api/sessions/start` | Navbatdagi darsni olish |
| POST | `/api/lessons/{lesson_id}/attempt` | Talaffuz audio faylini tahlil qilish |
| GET | `/api/progress/{user_id}` | Progress va gamifikatsiya holati |
| POST | `/api/progress/update` | Progress yangilash |
| POST | `/api/math/{skill}/attempt` | Matematika topshirig'ini tekshirish |
| POST | `/api/admin/content` | Kontent import (harflar/so'zlar) |
| GET | `/api/health/ping` | Health check |
| WS | `/api/realtime/conversation/{session_id}` | WebSocket real-time suhbat |

### 3. Database (PostgreSQL)

**Asosiy Jadvalar:**

1. **users** - Foydalanuvchilar
   - `id`, `email`, `phone`, `first_name`, `last_name`, `nickname`, `age`
   - `role` (student, mentor, admin, guardian)
   - `xp`, `level`, `current_streak`, `longest_streak`
   - `avatar_url`, `preferences` (JSON)

2. **learning_paths** - O'rganish yo'llari
   - `id`, `key`, `title`, `description`
   - `difficulty`, `order_index`, `is_active`

3. **modules** - Modullar
   - `id`, `learning_path_id`, `key`, `title`
   - `module_type` (alphabet, math, logic)
   - `order_index`, `is_unlocked_by_default`

4. **lessons** - Darslar
   - `id`, `module_id`, `key`, `title`
   - `lesson_type` (letter_practice, word_pronunciation)
   - `target_letter`, `target_sound`
   - `example_words` (ARRAY), `example_image_urls` (ARRAY)
   - `xp_reward`, `media_assets` (JSON)

5. **lesson_attempts** - Dars urinishlari
   - `id`, `user_id`, `lesson_id`
   - `audio_url`, `transcript`
   - `evaluation` (JSON), `feedback`
   - `score`, `is_correct`, `ai_model`

6. **user_progress** - Foydalanuvchi progressi
   - `id`, `user_id`, `learning_path_id`, `module_id`, `lesson_id`
   - `status` (locked, available, in_progress, completed)
   - `xp_earned`, `streak_count`, `last_attempt_at`

7. **achievements** - Yutuqlar
   - `id`, `key`, `title`, `description`
   - `xp_reward`, `badge_icon`, `conditions` (JSON)

8. **user_achievements** - Foydalanuvchi yutuqlari
   - `id`, `user_id`, `achievement_id`, `awarded_at`

**Migratsiyalar:**
- Alembic orqali boshqariladi
- `backend/alembic/versions/` - migratsiya fayllari
- `alembic upgrade head` - migratsiyalarni qo'llash

### 4. External Services

#### OpenAI API
- **Maqsad:** Talaffuz baholash va feedback
- **Model:** `gpt-4o-mini` (default)
- **Funksiya:** `evaluate_pronunciation()`
  - Transcript va target letter qabul qiladi
  - JSON formatida feedback qaytaradi:
    ```json
    {
      "score": 0.85,
      "accuracy": 90,
      "fluency": 80,
      "issues": ["r harfini to'g'ri talaffuz qilmadingiz"],
      "encouragement": "Ajoyib! Davom eting!"
    }
    ```

#### Muxlisa AI
- **Maqsad:** STT (Speech-to-Text) va TTS (Text-to-Speech)
- **API URL:** `https://service.muxlisa.uz/api`
- **Endpoints:**
  - `POST /v2/stt` - Ovozni matnga aylantirish
  - `POST /v2/tts` - Matnni ovozga aylantirish
- **Voice:** `maftuna` (qiz bola ovozida)
- **Headers:** `x-api-key: YOUR_API_KEY`

**Frontend Integration:**
- `src/lib/muxlisa-client.ts` - Muxlisa client
- `speechToText(audioBlob)` - STT
- `textToSpeech(text, voice)` - TTS
- Fallback: Web Speech API (browser built-in)

**Backend Integration:**
- `backend/app/services/muxlisa_service.py` - Muxlisa service
- `MuxlisaClient.transcribe()` - STT
- `MuxlisaClient.synthesize()` - TTS

---

## 🔄 Ishlash Oqimi

### 1. Onboarding
1. Bola ismini, yoshini, qiziqishlarini kiritadi
2. Guardian ro'yxatdan o'tadi (yoki mavjud profil bilan kiradi)
3. Bola profil yaratiladi yoki mavjud profil bilan davom etadi
4. `localStorage` ga saqlanadi: `bolajon_child_name`, `bolajon_child_id`

### 2. Real-time O'rganish

**Boshlanish:**
1. `learn-realtime/page.tsx` yuklanadi
2. `A` harfi ko'rsatiladi
3. AI xabari: "Salom! Men sizga harflarni o'rgatishga yordam beraman"
4. Harf ovozli talaffuz qilinadi (Muxlisa TTS)

**Mikrofon orqali Gapirish:**
1. Bola mikrofon tugmasini bosadi
2. Web Speech API yoki Muxlisa STT ishga tushadi
3. Bola gapirgan so'z transkripsiya qilinadi
4. AI tahlil qiladi:
   - So'z to'g'ri harf bilan boshlanadimi?
   - Talaffuz to'g'rimi?
5. Feedback beriladi:
   - To'g'ri bo'lsa: "Ajoyib! 🎉" + confetti
   - Noto'g'ri bo'lsa: "Hmm, bu harf bilan boshlanmaydi. Keling, takrorlaymiz!"

**Progress:**
- Har bir to'g'ri javob uchun +10% progress
- 100% bo'lganda harf "o'rganildi" deb belgilanadi
- O'rganilgan harflar `learnedLetters` Set da saqlanadi

**Navigatsiya:**
- `←` - Oldingi harf
- `→` - Keyingi harf
- Alphabet library (sidebar) - istalgan harfni tanlash
- Tugmalar: birinchi/oxirgi harfda yashirinadi

### 3. Gamifikatsiya

**XP (Experience Points):**
- Har bir to'g'ri javob: +10 XP
- Har bir dars tugallash: +20 XP
- Achievement: +25 XP

**Level:**
- XP thresholds: [0, 100, 250, 500, 1000, 2000, ...]
- Level = XP ga asoslangan

**Streak:**
- Har kuni o'qish uchun streak
- `current_streak` - joriy streak
- `longest_streak` - eng uzoq streak

**Achievements:**
- "Alphabet Master" - barcha harflarni o'rganish
- "Math Explorer" - matematika modulini boshlash
- "7 kun ketma-ket" - 7 kun streak

**Unlock:**
- Har bir harf tugallanganda keyingi harf ochiladi
- Alifbo tugagach matematika moduli ochiladi

### 4. Audio Pipeline

**TTS (Text-to-Speech):**
1. Frontend: `textToSpeech(text, 'maftuna')` chaqiriladi
2. Muxlisa API ga request:
   ```json
   {
     "text": "A",
     "voice": "maftuna",
     "language": "uz"
   }
   ```
3. Response: `audio_url` yoki `audio_base64`
4. Audio element yaratiladi va ijro etiladi
5. Fallback: Web Speech API (browser built-in)

**STT (Speech-to-Text):**
1. Frontend: Mikrofon orqali audio yoziladi
2. Web Speech API real-time transkripsiya qiladi
3. Yoki Muxlisa STT ga yuboriladi:
   ```
   POST /v2/stt
   FormData: audio file
   Headers: x-api-key
   ```
4. Transcript olinadi va AI ga yuboriladi

### 5. AI Tahlil

**OpenAI Integration:**
1. Transcript va target letter yuboriladi
2. OpenAI prompt:
   ```
   "Siz 4-7 yoshli bolaga o'zbek tilida o'rgatuvchi o'qituvchisiz.
   Bola '{transcript}' dedi, lekin '{target_letter}' harfini o'rganmoqda.
   Talaffuzni baholang va feedback bering."
   ```
3. Response:
   ```json
   {
     "score": 0.85,
     "accuracy": 90,
     "fluency": 80,
     "issues": [],
     "encouragement": "Ajoyib!"
   }
   ```
4. Score 0.75+ bo'lsa `is_correct = true`
5. XP va progress yangilanadi

---

## 📁 Fayl Strukturasi

### Frontend
```
src/
├── app/
│   ├── page.tsx                    # Bosh sahifa (onboarding)
│   ├── layout.tsx                  # Root layout
│   ├── providers.tsx               # React Query provider
│   └── (dashboard)/
│       ├── learn-realtime/
│       │   └── page.tsx            # Real-time o'rganish (ASOSIY)
│       ├── learn/
│       │   └── page.tsx            # Demo o'rganish
│       ├── profile/
│       │   └── page.tsx            # Profil
│       └── leaderboard/
│           └── page.tsx            # Liderboard
├── components/
│   ├── realtime/
│   │   └── RealtimeMicButton.tsx  # Mikrofon tugmasi
│   ├── learn/
│   │   ├── LetterCard.tsx         # Harf kartasi
│   │   ├── WordPractice.tsx       # So'z mashq qilish
│   │   ├── VoiceRecorder.tsx      # Voice recording
│   │   └── AIFeedback.tsx         # AI feedback
│   ├── gamification/
│   │   ├── ProgressBar.tsx        # Progress bar
│   │   ├── StarsDisplay.tsx       # Yulduzlar
│   │   └── LevelBadge.tsx         # Level badge
│   ├── onboarding/
│   │   └── OnboardingForm.tsx     # Onboarding form
│   └── ui/                        # UI komponentlar
├── lib/
│   ├── muxlisa-client.ts          # Muxlisa API client
│   └── utils/                     # Utility funksiyalar
├── store/
│   ├── user-store.ts              # User state (Zustand)
│   └── learning-store.ts           # Learning state
├── types/
│   ├── api.ts                     # API types
│   ├── user.ts                    # User types
│   ├── learning.ts                # Learning types
│   ├── components.ts              # Component props
│   ├── global.d.ts                # Global types (SpeechRecognition)
│   └── index.ts                   # Type exports
└── data/
    └── alphabet.ts                 # O'zbek alifbosi ma'lumotlari
```

### Backend
```
backend/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── api/
│   │   ├── routes/                # API endpoints
│   │   └── deps.py                # Dependencies
│   ├── services/                  # Business logic
│   ├── models/                    # SQLAlchemy models
│   ├── schemas/                   # Pydantic schemas
│   ├── db/                        # Database
│   └── core/
│       ├── config.py              # Settings
│       └── logging.py            # Logging
├── alembic/                       # Migrations
└── requirements.txt               # Python dependencies
```

---

## 🔧 Konfiguratsiya

### Environment Variables

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_MUXLISA_API_URL=https://service.muxlisa.uz/api
NEXT_PUBLIC_MUXLISA_API_KEY=your_api_key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Backend (`.env`):**
```env
DATABASE_URL=postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
MUXLISA_API_URL=https://service.muxlisa.uz/api
MUXLISA_API_KEY=your_api_key
ADMIN_API_TOKEN=super-secret-token
ALLOWED_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

---

## 🚀 Ishga Tushirish

### 1. Avtomatik (start.sh)
```bash
./start.sh
```
Bu skript:
- PostgreSQL ni sozlaydi
- Virtual environment yaratadi
- Dependencies o'rnatadi
- Migrations qo'llaydi
- Backend va Frontend ni ishga tushiradi

### 2. Qo'lda

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
npm install
npm run dev
```

**Database:**
```bash
# PostgreSQL ni ishga tushirish
sudo systemctl start postgresql

# Database yaratish
sudo -u postgres psql
CREATE DATABASE bolajon;
CREATE USER bolajon WITH PASSWORD 'bolajon';
GRANT ALL PRIVILEGES ON DATABASE bolajon TO bolajon;
```

---

## 📊 Ma'lumotlar Oqimi

### Real-time O'rganish:
```
Bola → Mikrofon → Web Speech API / Muxlisa STT → Transcript
                                                      ↓
Frontend → AI Feedback (local) → Progress Update → UI Update
```

### Backend Integration:
```
Frontend → POST /api/lessons/{id}/attempt
              ↓
         Muxlisa STT (audio → transcript)
              ↓
         OpenAI (transcript → evaluation)
              ↓
         Gamification (XP, level, unlock)
              ↓
         Response (feedback, score, xp_awarded)
```

---

## 🎨 UI/UX Xususiyatlari

1. **Child-friendly Design:**
   - Katta, rangli tugmalar
   - Emoji va animatsiyalar
   - Oddiy, tushunarli interfeys

2. **Real-time Feedback:**
   - Mikrofon holati (qizil/yashil)
   - Progress bar
   - Confetti animatsiyasi

3. **Accessibility:**
   - Keyboard shortcuts
   - Screen reader support
   - High contrast

4. **Responsive:**
   - Mobile, tablet, desktop
   - Touch-friendly

---

## 🔒 Xavfsizlik

1. **CORS:** Backend da sozlangan
2. **API Keys:** Environment variables da
3. **Input Validation:** Pydantic schemas
4. **SQL Injection:** SQLAlchemy ORM
5. **XSS:** React automatic escaping

---

## 📈 Performance

1. **Frontend:**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Audio caching

2. **Backend:**
   - Async/await
   - Connection pooling
   - Caching (Redis - keyingi bosqich)

---

## 🧪 Test Qilish

1. **Manual Testing:**
   - Har bir harfni o'rganish
   - Mikrofon ishlashi
   - Progress tracking
   - Gamifikatsiya

2. **API Testing:**
   - Swagger UI: `http://localhost:8000/docs`
   - Postman collection

---

## 📝 Qo'shimcha Ma'lumotlar

- **Documentation:** `docs/` papkasi
- **API Docs:** `http://localhost:8000/docs`
- **GitHub:** `git@github.com:Hazratqul21/bolajon.git`

---

## 🎯 Asosiy Funksiyalar Ro'yxati

✅ **Amalga oshirilgan:**
- Real-time AI suhbat
- Mikrofon orqali gapirish
- Harflarni ovozli talaffuz qilish
- Progress tracking
- Gamifikatsiya (XP, level, streak)
- Alphabet library
- Keyboard shortcuts
- Confetti animatsiyasi
- TypeScript to'liq tiplar
- Muxlisa AI integratsiyasi

🔄 **Keyingi bosqich:**
- WebSocket real-time feedback
- Parent dashboard
- Offline mode
- Mobile app

---

**Yaratilgan:** 2024  
**Versiya:** 0.1.0  
**Status:** MVP (Minimum Viable Product)

