# Tez Test Qilish

## 1. Development Serverni Ishga Tushirish

```bash
cd /home/ali/launch_lab/uzbek-alphabet-ai
npm run dev
```

Server http://localhost:3000 da ishga tushadi.

## 2. Brauzerda Test Qilish

### Asosiy Sahifalar:

1. **Home Page**: http://localhost:3000
   - UI komponentlar ishlashini tekshiring
   - Navigation tugmalarini tekshiring

2. **Login Page**: http://localhost:3000/login
   - Form ishlashini tekshiring
   - UI dizaynini ko'ring

3. **Register Page**: http://localhost:3000/register
   - Form validation tekshiring

4. **Learn Page**: http://localhost:3000/learn
   - Harflar ko'rinishini tekshiring
   - UI komponentlar ishlashini tekshiring
   - (Database bo'lmasa, ba'zi funksiyalar ishlamaydi)

## 3. Database Bo'lmasa Ham Test Qilish

Frontend qismini to'liq test qilish mumkin:
- ✅ UI komponentlar
- ✅ Navigation
- ✅ Styling (TailwindCSS)
- ✅ Responsive design
- ✅ Form validation

Database kerak bo'lgan qismlar:
- ❌ User authentication
- ❌ Progress saving
- ❌ Speech analysis
- ❌ Leaderboard

## 4. To'liq Test Qilish Uchun

### SQLite bilan (eng oson):

1. `.env.local` yarating:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-123"
MUXLISA_API_KEY=""
ANTHROPIC_API_KEY=""
```

2. Schema'ni SQLite uchun o'zgartiring:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

3. Database yaratish:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Serverni qayta ishga tushiring:
```bash
npm run dev
```

## 5. Test Checklist

- [ ] Home page ochiladi
- [ ] Login sahifasi ishlaydi
- [ ] Register sahifasi ishlaydi
- [ ] UI komponentlar to'g'ri ko'rinadi
- [ ] Navigation ishlaydi
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Database connection (agar sozlangan bo'lsa)
- [ ] User yaratish (agar database bo'lsa)
- [ ] Authentication (agar database bo'lsa)

## 6. Xatoliklarni Tekshirish

Server loglarini ko'ring:
```bash
# Terminalda server loglarini ko'ring
# Yoki browser console'da xatoliklarni tekshiring (F12)
```

## 7. API Test (Postman/Curl)

```bash
# Health check
curl http://localhost:3000/api/user

# User yaratish (database bo'lsa)
curl -X POST http://localhost:3000/api/user/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","age":5}'
```

