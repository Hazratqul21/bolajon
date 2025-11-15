# Database Permissions Muammosi - Yechim

## Muammo
```
permission denied for schema public
```

## Yechim

PostgreSQL da `bolajon` user `public` schema ga yozish huquqiga ega emas.

### Qadam 1: PostgreSQL ga ulanish

```bash
sudo -u postgres psql
```

### Qadam 2: Database va user yaratish/yangilash

```sql
-- Database yaratish (agar mavjud bo'lmasa)
CREATE DATABASE bolajon;

-- User yaratish (agar mavjud bo'lmasa)
CREATE USER bolajon WITH PASSWORD 'bolajon';

-- Barcha huquqlarni berish
GRANT ALL PRIVILEGES ON DATABASE bolajon TO bolajon;

-- Schema ga huquq berish
\c bolajon
GRANT ALL ON SCHEMA public TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bolajon;

-- Agar user allaqachon mavjud bo'lsa, owner qilish
ALTER DATABASE bolajon OWNER TO bolajon;

\q
```

### Qadam 3: Test qilish

```bash
cd backend
source .venv/bin/activate
export DATABASE_URL="postgresql+asyncpg://bolajon:bolajon@localhost:5432/bolajon"
alembic upgrade head
```

## Alternativ yechim: postgres user ishlatish

Agar muammo davom etsa, `postgres` superuser ishlatish mumkin:

```bash
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/bolajon"
```

Lekin bu production uchun tavsiya etilmaydi.

