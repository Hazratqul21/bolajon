# Render'ga Deploy Qilish Qo'llanmasi

## 1. Render Account Yaratish

1. https://render.com ga kiring
2. "Get Started for Free" bosib account yarating
3. GitHub account bilan bog'lashingiz mumkin

## 2. GitHub Repository'ni Bog'lash

1. Render dashboard'da "New +" tugmasini bosing
2. "Web Service" ni tanlang
3. GitHub repository'ni tanlang: `Hazratqul21/bolajon`
4. "Connect" bosib bog'lang

## 3. Web Service Sozlash

### Asosiy Sozlamalar:

- **Name**: `uzbek-alphabet-ai` (yoki istagan nomingiz)
- **Environment**: `Node`
- **Region**: `Frankfurt` (yoki yaqinroq)
- **Branch**: `main`
- **Root Directory**: (bo'sh qoldiring)

### Build & Start Commands:

- **Build Command**: 
  ```bash
  npm install && npm run db:generate && npm run build
  ```

- **Start Command**:
  ```bash
  npm start
  ```

## 4. Environment Variables

Render dashboard'da "Environment" tab'ga o'ting va quyidagilarni qo'shing:

### Majburiy:

```
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=<random-secret-key>
DATABASE_URL=<render-postgres-connection-string>
```

### Ixtiyoriy (API bo'lmasa ham ishlaydi):

```
MUXLISA_API_KEY=your-key-here
MUXLISA_API_URL=https://muxlisa.uz/api
ANTHROPIC_API_KEY=your-key-here
```

### NEXTAUTH_SECRET yaratish:

```bash
openssl rand -base64 32
```

Yoki online generator: https://generate-secret.vercel.app/32

## 5. PostgreSQL Database Yaratish

1. Render dashboard'da "New +" → "PostgreSQL"
2. Sozlamalar:
   - **Name**: `uzbek-alphabet-db`
   - **Database**: `uzbek_alphabet`
   - **User**: `uzbek_alphabet_user`
   - **Region**: Web service bilan bir xil
   - **Plan**: `Free` (test uchun)
3. "Create Database" bosib yarating
4. Database yaratilgandan keyin, "Connections" tab'dan `Internal Database URL` ni oling
5. Bu URL'ni `DATABASE_URL` environment variable sifatida qo'shing

## 6. Database Migration

Database yaratilgandan keyin, migration qilish kerak:

### Variant 1: Render Shell orqali

1. Render dashboard'da Web Service'ga kiring
2. "Shell" tab'ga o'ting
3. Quyidagi buyruqlarni bajarish:

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
```

### Variant 2: Build Command'ga qo'shish

`render.yaml` faylida build command'ga qo'shilgan:
```bash
npm install && npm run db:generate && npm run build
```

Migration'ni alohida qilish kerak (build command'da `prisma migrate deploy` qo'shish mumkin).

## 7. Deploy Qilish

1. Barcha sozlamalar to'g'ri bo'lsa, "Create Web Service" bosib deploy qiling
2. Birinchi deploy 5-10 daqiqa davom etadi
3. Deploy tugagach, URL ko'rinadi: `https://your-app-name.onrender.com`

## 8. Post-Deploy Sozlamalar

### Database Migration:

Deploy tugagach, Shell orqali migration qiling:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### NEXTAUTH_URL yangilash:

Deploy tugagach, haqiqiy URL'ni `NEXTAUTH_URL` ga qo'ying:
```
NEXTAUTH_URL=https://your-actual-app-url.onrender.com
```

## 9. Test Qilish

Deploy tugagach:

1. Home page: `https://your-app-name.onrender.com`
2. Login page: `https://your-app-name.onrender.com/login`
3. Learn page: `https://your-app-name.onrender.com/learn`

## 10. Muammolar va Yechimlar

### Build xatolik:

- Logs'ni tekshiring
- Environment variables to'g'ri sozlanganligini tekshiring
- `package.json` da barcha dependencies borligini tekshiring

### Database connection xatolik:

- `DATABASE_URL` to'g'ri sozlanganligini tekshiring
- Database service ishga tushganligini tekshiring
- Internal connection URL ishlatilganligini tekshiring

### 404 xatolik:

- Routes to'g'ri sozlanganligini tekshiring
- Next.js build muvaffaqiyatli bo'lganligini tekshiring

### Slow first load:

- Render free plan'da birinchi yuklanish sekin bo'lishi mumkin (cold start)
- Bu normal, keyingi yuklanishlar tezroq bo'ladi

## 11. Auto-Deploy

Render avtomatik ravishda GitHub'dagi o'zgarishlarni deploy qiladi:
- `main` branch'ga push qilsangiz, avtomatik deploy bo'ladi
- Har bir commit yangi deploy'ni trigger qiladi

## 12. Monitoring

- **Logs**: Real-time logs ko'rish mumkin
- **Metrics**: CPU, Memory, Request metrics
- **Events**: Deploy events va xatoliklar

## 13. Custom Domain (Ixtiyoriy)

1. Render dashboard'da Web Service'ga kiring
2. "Settings" → "Custom Domain"
3. Domain'ingizni qo'shing va DNS sozlang

## 14. Environment Variables Template

Deploy qilishdan oldin, quyidagi template'dan foydalaning:

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=<generate-random-32-char-string>
DATABASE_URL=<from-render-postgres-connection>
MUXLISA_API_KEY=<optional>
MUXLISA_API_URL=https://muxlisa.uz/api
ANTHROPIC_API_KEY=<optional>
```

## 15. Tez Deploy Qadamlar

1. ✅ Render account yarating
2. ✅ GitHub repository'ni bog'lang
3. ✅ PostgreSQL database yarating
4. ✅ Web Service yarating va sozlang
5. ✅ Environment variables qo'shing
6. ✅ Deploy qiling
7. ✅ Database migration qiling
8. ✅ Test qiling

---

**Eslatma**: Render free plan'da:
- 750 soat/oy (oyiga ~31 kun)
- Sleep mode (15 daqiqa inactivity'dan keyin)
- Birinchi yuklanish sekin bo'lishi mumkin

