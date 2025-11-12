## Arxitektura Overview

### 1. Backend (FastAPI)
- **Tuzilma**: modulga bo‘lingan (`api`, `services`, `models`, `schemas`, `db`)
- **API Router**: `api_router` – sessiya, dars, progress, matematika va admin yo‘llari
- **Services**:
  - `LearningService` – navbatdagi darsni tanlash va serializatsiya
  - `GamificationEngine` – XP, level, streak, unlock logikasi
  - `OpenAIAdapter` – talaffuz baholash (fallback bilan)
  - `MuxlisaClient` – STT/TTS integratsiyasi (HTTP adapter)
  - `MathService` – misollarni tekshirish, XP hisoblash
- **Lifecycle**: startup paytida gamifikatsiya engine init, shutdown paytida dispose

### 2. Ma’lumotlar bazasi
- **SQLAlchemy + Alembic** (async)
- **Asosiy bog‘lanishlar**:
  - `LearningPath` ↔ `Module` ↔ `Lesson`
  - `Lesson` ↔ `LessonPrompt` ↔ `LessonAttempt`
  - `User` ↔ `UserProgress`, `LessonAttempt`, `UserAchievement`
  - `Skill` ↔ `SkillActivity`
- **Migratsiya**: `alembic/versions/20241112_0001_initial_schema.py`
  - `pgcrypto` extension
  - Enum typelar (role, progress_status, lesson_type, prompt_type, skill_type)

### 3. Gamifikatsiya
- XP thresholds massiv
- Hech bo‘lmaganda 50% to‘g‘ri bo‘lsa XP berish (yarim XP fallback)
- Shart tugagach, keyingi darsni `unlock_next_lessons`
- Snapshot API (`ProgressOverview`) front uchun soddalashtirilgan

### 4. Audio Pipeline
1. Foydalanuvchi audio yuboradi (`audio_url` yoki `audio_base64`)
2. `MuxlisaClient.transcribe()` transcript qaytaradi
3. `OpenAIAdapter.evaluate_pronunciation()` JSON feedback
4. `LessonAttempt` yozuvi yaratiladi, XP yangilanadi
5. Agar natija noto‘g‘ri bo‘lsa, `suggested_repetition=True`

### 5. Matematik modul
- `SkillActivity.content["problems"]` – misollar ro‘yxati
- Har bir javob `MathService` orqali tekshiriladi
- 80%+ to‘g‘ri bo‘lsa, keyingi bo‘limga `unlocked_lessons`

### 6. Admin content sync
- `POST /api/admin/content`
- Header `X-Admin-Token`
- `overwrite=true` bo‘lsa moduldagi darslar qayta yaratiladi
- Prompts JSON ko‘rinishida yuboriladi

### 7. Docker Compose
- `postgres`, `redis`, `backend`, `frontend`
- Backend env’lari `.env` orqali yoki compose orqali
- Frontend `NEXT_PUBLIC_API_URL` – `http://localhost:8000/api`

### 8. Seed ma’lumotlar
- `app/db/seed.py`
- 4 ta harf (`A`, `O`, `L`, `B`) 3–4 ta so‘z va rasm URL bilan
- Math addition skill + activity
- Achievements: `alphabet_master`, `math_explorer`

### 9. Kelajak roadmap
- WebSocket real-time feedback
- Badge va challengelarni kengaytirish
- Guardian dashboard va progress report
- Localization (ru/eng) va accessibility


