# Test Qilish Qo'llanmasi

## 1. Environment Variables Sozlash

`.env.local` faylini yarating va quyidagilarni qo'shing:

```env
# Database (test uchun SQLite ishlatishingiz mumkin)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key-change-in-production"

# Muxlisa AI (test uchun bo'sh qoldirishingiz mumkin)
MUXLISA_API_KEY=""
MUXLISA_API_URL="https://muxlisa.uz/api"

# Anthropic Claude (test uchun bo'sh qoldirishingiz mumkin)
ANTHROPIC_API_KEY=""
```

## 2. Database Setup

### SQLite bilan test qilish (eng oson):

1. `prisma/schema.prisma` faylida datasource provider'ni o'zgartiring:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Database yaratish:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 3. Development Serverni Ishga Tushirish

```bash
npm run dev
```

Brauzerda oching: http://localhost:3000

## 4. Test Qilish

### Frontend Test:
- ✅ Home page ochilishini tekshiring
- ✅ Login/Register sahifalarini tekshiring
- ✅ UI komponentlar ishlashini tekshiring
- ✅ Navigation ishlashini tekshiring

### Backend Test (Database bo'lsa):
- ✅ User yaratish
- ✅ Authentication
- ✅ Learning page
- ✅ Progress tracking

### API Test (Postman yoki curl):
```bash
# User yaratish
curl -X POST http://localhost:3000/api/user/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","age":5}'
```

## 5. Database bo'lmasa ham test qilish

Frontend qismini ko'rish uchun database kerak emas. Faqat UI va komponentlarni test qilish mumkin.

