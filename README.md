## Bolajon Platform

AI yordamida bolalarga lotin alifbosida o‘zbek tili va boshlang‘ich matematika fanlarini o‘rgatish uchun yaratilgan gamifikatsiya platformasi.

### Monorepo tarkibi

- `src/` – Next.js (App Router) frontend
- `backend/` – FastAPI, SQLAlchemy, Alembic, bizning API
- `docs/` – Talablar va arxitektura xujjatlari
- `docker-compose.yml` – Lokal rivojlantirish muhiti (Postgres, Redis, Backend, Frontend)

### Tez start

```bash
docker compose up --build
```

Backend: http://localhost:8000  
Frontend: http://localhost:3000  
Swagger: http://localhost:8000/docs

### Qo‘lda ishga tushirish

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m backend.scripts.seed  # mavjud darslar 100 000 tagacha to‘ldiriladi
uvicorn app.main:app --reload
```

**Frontend**

```bash
npm install
npm run dev
```

### Muhim fayllar

- `docs/requirements.md` – asosiy funksional talablar
- `docs/architecture.md` – komponentlar va oqimlar sxemasi
- `docs/customization-guide.md` – backend/frontendni qo‘lda sozlash bo‘yicha qo‘llanma
- `RENDER_DEPLOY.md` – Render’da FastAPI backend deploy qadamlar
- `backend/alembic/` – migratsiyalar
- `backend/app/db/seed.py` – boshlang‘ich kontent (harflar, matematika)

### Envlarga misol

`.env` (backend):

```
DATABASE_URL=postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
MUXLISA_API_URL=https://muxlisa.uz/api
MUXLISA_API_KEY=your-muxlisa-key
ADMIN_API_TOKEN=super-secret-token
ALLOWED_ORIGINS=http://localhost:3000
```

### Test kontent

Seed skripti quyidagi modulni yaratadi:

- Harflar: `A`, `O`, `L`, `B` – 3–4 ta so‘z va rasm URL
- Metrik: talaffuzni baholash va XP
- Matematika: qo‘shish asoslari (`math-addition-basics`)
- Achievements: `alphabet_master`, `math_explorer`

### Keyingi qadamlar

- Guardian/mentor kabineti
- WebSocket asosida real-time feedback
- Mini o‘yinlar va haftalik challenge’lar
- CMS yoki admin panel
