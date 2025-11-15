# Bolajon Platform

AI yordamida bolalarga lotin alifbosida o'zbek tili va boshlang'ich matematika fanlarini o'rgatish uchun yaratilgan gamifikatsiya platformasi.

## Loyiha Strukturasi

```
bolajon3/
├── backend/          # FastAPI backend
│   ├── app/          # Asosiy ilova kodi
│   │   ├── api/      # API route'lar
│   │   ├── core/     # Konfiguratsiya va logging
│   │   ├── db/       # Database session va base
│   │   ├── models/   # SQLAlchemy modellar
│   │   ├── schemas/  # Pydantic schemalar
│   │   └── services/ # Business logic
│   ├── alembic/      # Database migratsiyalar
│   └── requirements.txt
├── src/              # Next.js frontend
│   ├── app/          # Next.js App Router
│   ├── components/   # React komponentlar
│   ├── lib/          # Utility funksiyalar
│   ├── store/        # Zustand store'lar
│   └── types/        # TypeScript tiplar
├── docker-compose.yml # Docker orquestratsiya
└── README.md
```

## Tez Start

### Docker orqali (Tavsiya etiladi)

```bash
docker compose up --build
```

Backend: http://localhost:8000  
Frontend: http://localhost:3000  
Swagger: http://localhost:8000/docs

### Qo'lda ishga tushirish

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**

```bash
npm install
npm run dev
```

## Environment Variables

`.env` fayl yaratish (backend papkasida):

```
DATABASE_URL=postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
MUXLISA_API_URL=https://muxlisa.uz/api
MUXLISA_API_KEY=your-muxlisa-key
ADMIN_API_TOKEN=super-secret-token
ALLOWED_ORIGINS=http://localhost:3000
```

## Database Migratsiyalar

```bash
cd backend
alembic upgrade head
```

Yangi migratsiya yaratish:

```bash
alembic revision --autogenerate -m "migration description"
```

## API Endpoints

- `GET /api/health/ping` - Health check
- `POST /api/auth/guardian/register` - Guardian ro'yxatdan o'tish
- `POST /api/auth/child/onboard` - Bola onboarding
- `POST /api/sessions/start` - Dars sessiyasini boshlash
- `POST /api/lessons/{lesson_id}/attempt` - Dars urinishini yuborish
- `GET /api/progress/{user_id}` - Foydalanuvchi progress'i
- `WS /api/realtime/conversation/{session_id}` - Real-time WebSocket

Batafsil: http://localhost:8000/docs

## Texnologiyalar

**Backend:**
- FastAPI
- SQLAlchemy (async)
- Alembic
- PostgreSQL
- Redis
- OpenAI API
- Muxlisa AI

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query

## Rivojlantirish

1. Fork qiling yoki clone qiling
2. `.env` fayl yaratib, kerakli o'zgaruvchilarni to'ldiring
3. Database yaratib, migratsiyalarni ishga tushiring
4. `docker compose up` yoki qo'lda ishga tushiring

## Muammolar

Agar muammo yuzaga kelsa, GitHub Issues bo'limida yozing.

