# Python 3.13 va asyncpg muammosi - Yechim

## Muammo
`asyncpg` paketi Python 3.13 bilan mos kelmayapti. Python 3.13 juda yangi versiya va `asyncpg` hali to'liq qo'llab-quvvatlamaydi.

## Yechimlar

### Variant 1: Python 3.11 o'rnatish (Tavsiya etiladi)

```bash
# Python 3.11 o'rnatish
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev

# Virtual environment Python 3.11 bilan yaratish
cd backend
rm -rf .venv
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Variant 2: asyncpg versiyasini yangilash

```bash
cd backend
source .venv/bin/activate
pip install --upgrade asyncpg
# yoki
pip install asyncpg --no-cache-dir
```

### Variant 3: psycopg (asyncpg o'rniga)

Agar asyncpg ishlamasa, `psycopg` (async) ishlatish mumkin, lekin kod o'zgartirish kerak:

```bash
# requirements.txt da asyncpg o'rniga:
psycopg[binary,pool]>=3.1.0
```

Keyin `backend/app/db/session.py` da:
```python
# asyncpg o'rniga psycopg ishlatish
from psycopg_pool import AsyncConnectionPool
```

### Variant 4: Docker ishlatish (Eng oson)

Docker ishlatilsa, Python 3.11 image ishlatiladi:

```bash
# Docker o'rnatish
sudo apt install docker.io docker-compose

# Docker compose orqali ishga tushirish
docker compose up --build
```

## Tezkor yechim (Python 3.11 o'rnatish)

```bash
# 1. Python 3.11 o'rnatish
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev

# 2. Virtual environment qayta yaratish
cd /home/urinov/launchlab/bolajon/backend
rm -rf .venv
python3.11 -m venv .venv
source .venv/bin/activate

# 3. Dependencies o'rnatish
pip install --upgrade pip
pip install -r requirements.txt

# 4. Test
python -c "import asyncpg; print('asyncpg ishlayapti!')"
```

## Qo'shimcha yordam

Agar muammo davom etsa:
- `pip install asyncpg --no-cache-dir --force-reinstall`
- `pip install asyncpg --pre` (pre-release versiyasini sinab ko'rish)
- GitHub issues: https://github.com/MagicStack/asyncpg/issues

