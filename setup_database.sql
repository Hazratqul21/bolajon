-- PostgreSQL database va permissions sozlash SQL skripti
-- Bajarish: sudo -u postgres psql -f setup_database.sql

-- Database yaratish (agar mavjud bo'lmasa)
SELECT 'CREATE DATABASE bolajon' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bolajon')\gexec

-- User yaratish (agar mavjud bo'lmasa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'bolajon') THEN
        CREATE USER bolajon WITH PASSWORD 'bolajon';
    END IF;
END
$$;

-- Database ga ulanish
\c bolajon

-- Barcha huquqlarni berish
GRANT ALL PRIVILEGES ON DATABASE bolajon TO bolajon;
GRANT ALL ON SCHEMA public TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bolajon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO bolajon;

-- Owner qilish
ALTER DATABASE bolajon OWNER TO bolajon;
ALTER SCHEMA public OWNER TO bolajon;

-- Test
SELECT 'Database sozlandi!' AS status;

