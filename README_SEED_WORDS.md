# Database ga So'zlar Kiritish

## Seed Scriptni Ishga Tushirish

Har bir harf uchun 100 ta so'z kiritish uchun:

```bash
cd backend
source .venv/bin/activate
python scripts/seed_words.py
```

Yoki `start.sh` orqali:

```bash
SKIP_SEED=false ./start.sh
```

## Qanday Ishlaydi

1. **Database ga so'zlar kiritiladi**: Har bir harf uchun 100 ta so'z `lessons` jadvalidagi `example_words` fieldiga kiritiladi.

2. **Har safar random aylanishi**: `learning_service.py` da `serialize_lesson` funksiyasi har safar random 3 ta so'zni qaytaradi.

3. **Qiziqishlarga mos so'zlar**: User preferences dan `interests` olinadi va shunga mos so'zlar tanlanadi.

## Qiziqishlar

- Hayvonlar
- Mashinalar
- Ranglar
- Musiqa
- Kitoblar
- O'yinlar

Har safar user kirganda, qiziqishlariga mos random so'zlar ko'rsatiladi.
