# Test Qilish Qo'llanmasi

## ✅ Server Ishga Tushirildi!

Development server ishga tushirildi. Endi quyidagilarni qiling:

## 1. Brauzerda Ochish

Brauzeringizda quyidagi URL'ni oching:
```
http://localhost:3000
```

## 2. Test Qilish

### Asosiy Sahifalar:

1. **Home Page** (http://localhost:3000)
   - ✅ "O'zbek Alifbosi" sarlavhasi ko'rinishi kerak
   - ✅ "Boshlash" va "Demo ko'rish" tugmalari
   - ✅ 3 ta Card komponentlar (Ovozli O'qish, Gamifikatsiya, Progress Tracking)

2. **Login Page** (http://localhost:3000/login)
   - ✅ Form ishlashini tekshiring
   - ✅ Ism va yosh inputlari
   - ✅ "Kirish" tugmasi

3. **Register Page** (http://localhost:3000/register)
   - ✅ Ro'yxatdan o'tish formasi
   - ✅ Validation

4. **Learn Page** (http://localhost:3000/learn)
   - ✅ Harflar ko'rinishi
   - ✅ UI komponentlar
   - ⚠️ Database bo'lmasa, ba'zi funksiyalar ishlamaydi

## 3. Database Bo'lmasa Ham Test Qilish

Frontend qismini to'liq test qilish mumkin:
- ✅ UI komponentlar (Button, Card, Badge, Progress)
- ✅ Navigation
- ✅ Styling (TailwindCSS)
- ✅ Responsive design
- ✅ Form validation

## 4. Server Restart Qilish

Agar o'zgarishlar ko'rinmasa:

```bash
# Terminalda Ctrl+C bosib serverni to'xtating
# Keyin qayta ishga tushiring:
cd /home/ali/launch_lab/uzbek-alphabet-ai
npm run dev
```

## 5. Xatoliklarni Tekshirish

### Browser Console:
- F12 bosib Developer Tools oching
- Console tab'da xatoliklarni ko'ring

### Server Logs:
- Terminalda server loglarini ko'ring
- Qizil xatoliklar bo'lsa, ularni tekshiring

## 6. To'liq Test Qilish Uchun Database Sozlash

### SQLite bilan (eng oson):

1. `.env.local` yarating:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-123"
MUXLISA_API_KEY=""
ANTHROPIC_API_KEY=""
```

2. `prisma/schema.prisma` faylida:
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

4. Server restart:
```bash
npm run dev
```

## 7. Test Checklist

- [ ] Home page ochiladi va to'g'ri ko'rinadi
- [ ] Login sahifasi ishlaydi
- [ ] Register sahifasi ishlaydi
- [ ] UI komponentlar to'g'ri ko'rinadi
- [ ] Navigation ishlaydi
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Database connection (agar sozlangan bo'lsa)
- [ ] User yaratish (agar database bo'lsa)
- [ ] Authentication (agar database bo'lsa)

## 8. API Test

Postman yoki curl bilan:

```bash
# Health check
curl http://localhost:3000/api/user

# User yaratish (database bo'lsa)
curl -X POST http://localhost:3000/api/user/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","age":5}'
```

## 9. Muammolar va Yechimlar

### Server ishlamayapti:
- Port 3000 band bo'lishi mumkin
- `npm run dev` qayta ishga tushiring

### Sahifa ko'rinmayapti:
- Browser cache'ni tozalang (Ctrl+Shift+R)
- Server restart qiling

### Database xatoliklari:
- `.env.local` faylini tekshiring
- `DATABASE_URL` to'g'ri sozlanganligini tekshiring

### UI komponentlar ko'rinmayapti:
- Browser console'da xatoliklarni tekshiring
- `npm run build` bilan build qilib ko'ring

