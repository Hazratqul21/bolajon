# Render Deploy Qo'llanmasi (FastAPI Backend)

## 1. Oldindan tayyorgarlik
- Render account: https://render.com
- GitHub repo: `Hazratqul21/bolajon`
- Render'dagi `render.yaml` fayli avtomatik sozlash uchun yangilangan (`env: python`)

## 2. Web Service yaratish
1. Render dashboard → “New +” → “Web Service”
2. Repository sifatida `Hazratqul21/bolajon` (branch `main`) ni tanlang
3. Sozlamalar:
   - **Name**: `bolajon-backend` (yoki istagan nom)
   - **Environment**: `Python`
   - **Region**: Frankfurt / yaqin data-center
   - **Plan**: Free (test uchun)
4. `Auto Deploy` → “Yes” qoldiring

Render `render.yaml` dagi quyidagi komandalarni ishlatadi:
```yaml
buildCommand: pip install -r backend/requirements.txt
startCommand: cd backend && uvicorn app.main:app --host 0.0.0.0 --port 10000
```

## 3. PostgreSQL database
1. Render dashboard → “New +” → “PostgreSQL”
2. Nom: `bolajon-db`
3. Region: backend bilan bir xil
4. Plan: Free
5. Yaratilgach, `render.yaml` avtomatik ravishda `DATABASE_URL` ni ushbu database bilan bog‘laydi

## 4. Environment variables
Render service ichida quyidagilarni to‘ldiring:

| Key | Value | Izoh |
| --- | --- | --- |
| `OPENAI_API_KEY` | `<your-openai-key>` | Pronunsiyatsiya feedback |
| `MUXLISA_API_KEY` | `<your-muxlisa-key>` | STT/TTS kaliti |
| `ADMIN_API_TOKEN` | `<random-secret>` | Admin kontent importi |
| `ALLOWED_ORIGINS` | `https://bolajon-frontend.onrender.com` yoki lokatsiya | CORS uchun |

Qolganlari (`DATABASE_URL`, `OPENAI_MODEL`, `MUXLISA_API_URL`) `render.yaml` orqali to‘ldirilgan.

## 5. Migratsiya va seed
Deploy tugaganda Render o‘z-o‘zidan migratsiya qilmaydi. Shell orqali quyidagilarni bajarish kifoya:

```bash
cd backend
alembic upgrade head
python -m backend.scripts.seed  # 100 000 ta avto darsni ham qo‘shadi
```

## 6. Test va monitoring
- Swagger: `https://<your-service>.onrender.com/docs`
- Healthcheck: `https://<your-service>.onrender.com/api/health/ping`
- Render Logs → real-time kuzatuv
- Agar servis “Sleep” holatiga o‘tsa, birinchi request sekin bo‘lishi mumkin (free plan cheklovi)

## 7. Frontendni ulash (ixtiyoriy)
- Next.js klientini alohida Render Web Service sifatida deploy qiling
- `NEXT_PUBLIC_API_URL` ni backend URL’iga yo‘naltiring
- `ALLOWED_ORIGINS` environment qiymatini frontend domeniga moslang

## 8. Muammolar va yechimlar
- **Build xatosi**: Logs → Python versiyasini tekshiring (`render.yaml` default 3.11 bilan mos), requirements to‘liqmi.
- **DB ulanish xatosi**: Database yaratilib, `DATABASE_URL` bog‘langanini tekshiring.
- **CORS xatosi**: `ALLOWED_ORIGINS` da to‘g‘ri domen borligiga ishonch hosil qiling.
- **Cold start**: Free rejimda normal holat, 1-daqiqalik kechikish bo‘lishi mumkin.

## 9. Deploy flow qisqacha
1. ✅ GitHub’ga push
2. ✅ Render auto-build → pip install
3. ✅ Uvicorn bilan backend ishga tushadi
4. ✅ Shell orqali `alembic upgrade head`
5. ✅ `python -m backend.scripts.seed`
6. ✅ Swagger / Postman’da test

