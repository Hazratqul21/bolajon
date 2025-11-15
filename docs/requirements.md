# Bolajon Platform Requirements

## Mission

Bolajon — lotin alifbosida o‘zbek tilini va keyinchalik matematika hamda boshqa fanlarni gamifikatsiya asosida o‘rgatuvchi AI murabbiy platformasi. Dastlabki fokus ✨:

- Har bir harf uchun bolaga 3–4 ta so‘z va rasm bilan taqdimot
- AI talaffuzni eshitib, farqni tushuntiradi va qayta takrorlashni so‘raydi
- Alifbo yakunlangach, qo‘shish/ayirish moduli ochiladi, keyin boshqa fanlar uchun vetkalar tanlanadi

## Platforma komponentlari

- **Frontend (Next.js App Router)** – UI/UX keyinroq to‘liq qayta ishlanadi, hozircha API integratsiyasi uchun tayyorlangan.
- **Backend (FastAPI)** – OpenAI, Muxlisa va gamifikatsiya biznes-logikasi.
- **PostgreSQL** – foydalanuvchi, kontent, progress va mukofot ma’lumotlari.
- **Redis** – sessiyalar, real-vaqtli liderbord yoki navbatdagi bosqichlar uchun (keyingi iteratsiyada).
- **External xizmatlar**
  - OpenAI – fonetik tahlil, izohli feedback
  - Muxlisa AI – nutqni tanish (STT) va ovoz chiqarish (TTS)

## Foydalanuvchi oqimi

1. Bola profil yaratadi yoki mavjud profil bilan kiradi.
2. “Alphabet” learning-path: har bir harf uchun:
   - Tanishuv ekran (harf, talaffuz, rasm)
   - Bolaning talaffuzi yoziladi → Muxlisa STT → OpenAI tahlil
   - AI feedback + TTS motivatsiya
   - XP va badge’lar beriladi, progress yangilanadi
3. Alifbo tugashi bilan matematik modul (“math-addition-basics”) ochiladi.
4. Math modulida qiyinchilikka qarab XP beriladi, keyingi fanlar (logic, storytelling va h.k.) tanlovi ochiladi.

## Gamifikatsiya

- XP → Level tizimi, streak, eng yaxshi rekord
- Badge va achievements (“Alphabet Master”, “Math Explorer”)
- Haftalik challenge va mini-o‘yinlar (keyingi rivojlantirish bosqichi)

## API Endpointlari

| Endpoint | Maqsad |
| --- | --- |
| `POST /api/sessions/start` | Foydalanuvchiga navbatdagi darsni beradi |
| `POST /api/lessons/{lesson_id}/attempt` | Talaffuz audio faylini tahlil qiladi |
| `GET /api/progress/{user_id}` | Gamifikatsiya va progress holati |
| `POST /api/progress/update` | Progress statusini qo‘lda yangilash (admin) |
| `POST /api/math/{skill}/attempt` | Matematika topshirig‘ini tekshiradi |
| `POST /api/admin/content` | Yangi kontent (harflar/so‘zlar/prompts) importi |
| `GET /api/health/ping` | Healthcheck |

## Ma’lumotlar bazasi

Asosiy jadvalar: `users`, `learning_paths`, `modules`, `lessons`, `lesson_prompts`, `lesson_attempts`, `user_progress`, `skills`, `skill_activities`, `achievements`, `user_achievements`. Har biri uchun Alembic migratsiya yozilgan.

## Konfiguratsiya

- `.env` (backend) – `DATABASE_URL`, `OPENAI_API_KEY`, `MUXLISA_API_KEY`, `ADMIN_API_TOKEN`
- Docker Compose – `postgres`, `redis`, `backend`, `frontend`

## Keyingi qadamlar

- Kontentni ko‘paytirish va CMS ulash
- Real vaqtli ovoz yozuvlarini WebSocket orqali yuborish
- Bolalar uchun maxsus UI/UX (accessibility, animations)
- Monitoring va analytics (Sentry, Prometheus)


