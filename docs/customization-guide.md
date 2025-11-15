# Bolajon Customization Guide

Ushbu qo‘llanma backend va frontend qismlarini qo‘lda tahrirlashni osonlashtirish uchun tayyorlandi. Har bir bo‘limda asosiy fayllar, kengaytirish usullari va mavjud komandalar ko‘rsatilgan.

## Backend (FastAPI)

- **Asosiy kirish nuqtasi**: `backend/app/main.py`
  - Middleware, startup/shutdown hook’lari, API router shu yerda.
  - Yangi global sozlamalar qo‘shmoqchi bo‘lsangiz shu faylga murojaat qiling.
- **Routerlar**: `backend/app/api/routes/`
  - Har bir mavzu alohida fayl (`lessons.py`, `progress.py`, `math.py`, `admin.py`).
  - Yangi endpoint → shu papkada yangi fayl oching va `backend/app/api/__init__.py` ichiga routerni include qiling.
- **Servislar**: `backend/app/services/`
  - Biznes qoidalar shu yerda modulga ajratilgan (`learning_service`, `gamification_service`, `math_service`, `muxlisa_service`, `openai_service`).
  - Yangi logika qo‘shishda mavjud servisdan meros olish yoki yangi fayl yaratish oson.
- **Ma’lumotlar bazasi modeli**: `backend/app/models/__init__.py`
  - SQLAlchemy ORM modellari va enumlar shu faylda.
  - Yangi jadval istasangiz shu faylga model qo‘shing, so‘ng migratsiya yarating.
- **Pydantic sxemalar**: `backend/app/schemas/__init__.py`
  - API request/response formatlari shu yerda.
- **Migratsiyalar**: Alembic
  - Yangi migratsiya:  
    ```bash
    cd backend
    alembic revision -m "describe change"
    alembic upgrade head
    ```
  - `alembic/env.py` avtomatik sozlangan; `Base.metadata` avtomatik ravishda ulashadi.
- **Seed script**: `backend/scripts/seed.py`
  - `python -m backend.scripts.seed` orqali boshlang‘ich kontent va 100 000 ta avtomatik dars yoziladi (agar mavjud darslar 10 000 tadan kam bo‘lsa).

## Frontend (Next.js)

- **Asosiy sahifalar**: `src/app/`
  - Dashboard, profil va o‘rganish sahifalari App Router strukturasida.
  - API chaqiriqlari uchun `src/app/api/*` (Next.js route handlers).
- **UI komponentlari**: `src/components/`
  - `gamification`, `learn`, va `ui` bo‘limlari bo‘yicha ajratilgan.
- **Holat boshqaruvi**: `src/store/`
  - Zustand store (`learning-store.ts`, `user-store.ts`).
- **Ma’lumotlar**: `src/data/alphabet.ts`
  - Frontend tarafidan ishlatiladigan lokal arraylar.
- **Utilitlar**: `src/lib/`
  - OpenAI yoki Muxlisa bilan ishlash uchun client adapterlari, helperlar.
- Yangi sahifa qo‘shish:
  1. `src/app` ichida kerakli papkada `page.tsx` yarating.
  2. UI komponentlarini `src/components` dan import qiling Yoki yangi komponent yozing.
  3. Agar endpoint kerak bo‘lsa, backendda router yarating va frontenddagi fetch’ni moslang.

## Lokal rivojlantirish

```bash
docker compose up --build
```

- Backend: http://localhost:8000  
- Swagger: http://localhost:8000/docs  
- Frontend: http://localhost:3000

`.env` faylini to‘ldiring (`backend/app/core/config.py` ichida default qiymatlar ko‘rsatilgan).

## Qo‘lda deploy yoki test

- Backendni alohida ishga tushirish:
  ```bash
  cd backend
  uvicorn app.main:app --reload
  ```
- Frontendni alohida:
  ```bash
  npm run dev
  ```
- Testlarga tayyor turish uchun `pytest` yoki `npm test` skriptlarini keyingi bosqichda ulash mumkin.

## Keraksiz fayllarni aniqlash

- Monorepoda ishlatilmayotgan fayl/papkalarni `git status` orqali kuzating.
- Docker bilan ishlamayotgan bo‘lsangiz, `docker-compose.yml` va ildizdagi `Dockerfile`ni vaqtincha olib tashlashingiz mumkin (lekin deployment rejasida kerak bo‘ladi).
- Frontendning default `app.backup/` katalogi hozircha faqat namuna sifatida saqlangan; real UI tayyor bo‘lgach bu papkani o‘chirishingiz mumkin.

## Git bilan ishlash

- Yangi feature ustida:
  ```bash
  git checkout -b feature/new-module
  # o'zgarishlar...
  git commit -am "feat: add new module"
  git push origin feature/new-module
  ```
- Kod ko‘p bo‘lsa commitlarni kichik-kichik bo‘lib qiling, sharhlarda o‘zgarishlarni qisqacha yozing.

## Muammolar va yordam

- Backend error loglari: terminaldagi `uvicorn` chiqishi.
- DB migratsiya xatolari: `alembic history` va `alembic downgrade -1`.
- Frontend build xatolari: `npm run lint` yoki `npm run build` orqali ko‘rish mumkin.
- AI integratsiyalarida API kalitlari to‘g‘ri joylashganini tekshiring.

Bu yo‘riqnoma orqali loyihadagi asosiy nuqtalarni tez topish va o‘zgarish kiritish osonlashadi.


