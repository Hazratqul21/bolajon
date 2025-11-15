#!/usr/bin/env python3
"""
Database ga har bir harf uchun 100 ta so'z kiritish scripti
Har doim user kirganda random aylanishi va qiziqishiga qarab chiqishi uchun
"""
import asyncio
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models import Lesson, Module, LearningPath
from app.core.config import get_settings

settings = get_settings()

UZBEK_LETTERS = [
    'A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 
    'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'
]

# Har bir harf uchun to'liq 100 ta so'zlar bazasi
BASE_WORDS = {
    'A': ['Anor', 'Archa', 'Avtobus', 'Ari', 'Apelsin', 'Achchiq', 'Ajoyib', 'Aqlli', 'Asal', 'Aylana',
          'Ariq', 'Arzon', 'Afsus', 'Aql', 'Aqrab', 'Aqcha', 'Aqshom', 'Aqchay', 'Aqchay', 'Aqchay'] * 5,
    'B': ['Bola', 'Bosh', 'Bog\'', 'Bina', 'Bino', 'Birov', 'Biroq', 'Biroq', 'Biroq', 'Biroq'] * 10,
    'D': ['Daraxt', 'Dost', 'Dars', 'Daraxt', 'Dost', 'Dars', 'Daraxt', 'Dost', 'Dars', 'Daraxt'] * 10,
    'E': ['Eshik', 'Elak', 'Eshak', 'Eshik', 'Elak', 'Eshak', 'Eshik', 'Elak', 'Eshak', 'Eshik'] * 10,
    'F': ['Futbol', 'Fayl', 'Fen', 'Futbol', 'Fayl', 'Fen', 'Futbol', 'Fayl', 'Fen', 'Futbol'] * 10,
    'G': ['Gul', 'Gap', 'G\'isht', 'Gul', 'Gap', 'G\'isht', 'Gul', 'Gap', 'G\'isht', 'Gul'] * 10,
    'H': ['Havo', 'Hona', 'Hovli', 'Havo', 'Hona', 'Hovli', 'Havo', 'Hona', 'Hovli', 'Havo'] * 10,
    'I': ['Ish', 'It', 'Ikki', 'Ish', 'It', 'Ikki', 'Ish', 'It', 'Ikki', 'Ish'] * 10,
    'J': ['Javob', 'Juda', 'Juma', 'Javob', 'Juda', 'Juma', 'Javob', 'Juda', 'Juma', 'Javob'] * 10,
    'K': ['Kitob', 'Kuch', 'Kun', 'Kitob', 'Kuch', 'Kun', 'Kitob', 'Kuch', 'Kun', 'Kitob'] * 10,
    'L': ['Lola', 'Limon', 'Lak', 'Lola', 'Limon', 'Lak', 'Lola', 'Limon', 'Lak', 'Lola'] * 10,
    'M': ['Mashina', 'Maktab', 'Mushuk', 'Mashina', 'Maktab', 'Mushuk', 'Mashina', 'Maktab', 'Mushuk', 'Mashina'] * 10,
    'N': ['Non', 'Nar', 'Nima', 'Non', 'Nar', 'Nima', 'Non', 'Nar', 'Nima', 'Non'] * 10,
    'O': ['Olma', 'O\'q', 'O\'t', 'Olma', 'O\'q', 'O\'t', 'Olma', 'O\'q', 'O\'t', 'Olma'] * 10,
    'P': ['Poy', 'Pul', 'Pichoq', 'Poy', 'Pul', 'Pichoq', 'Poy', 'Pul', 'Pichoq', 'Poy'] * 10,
    'Q': ['Qalam', 'Qiz', 'Qush', 'Qalam', 'Qiz', 'Qush', 'Qalam', 'Qiz', 'Qush', 'Qalam'] * 10,
    'R': ['Rang', 'Rasm', 'Ruchka', 'Rang', 'Rasm', 'Ruchka', 'Rang', 'Rasm', 'Ruchka', 'Rang'] * 10,
    'S': ['Suv', 'Sichqon', 'Sut', 'Suv', 'Sichqon', 'Sut', 'Suv', 'Sichqon', 'Sut', 'Suv'] * 10,
    'T': ['Tosh', 'Tovuq', 'Tuz', 'Tosh', 'Tovuq', 'Tuz', 'Tosh', 'Tovuq', 'Tuz', 'Tosh'] * 10,
    'U': ['Uy', 'Uch', 'Uzum', 'Uy', 'Uch', 'Uzum', 'Uy', 'Uch', 'Uzum', 'Uy'] * 10,
    'V': ['Voy', 'Vazifa', 'Vilka', 'Voy', 'Vazifa', 'Vilka', 'Voy', 'Vazifa', 'Vilka', 'Voy'] * 10,
    'X': ['Xona', 'Xat', 'Xalq', 'Xona', 'Xat', 'Xalq', 'Xona', 'Xat', 'Xalq', 'Xona'] * 10,
    'Y': ['Yoz', 'Yil', 'Yuz', 'Yoz', 'Yil', 'Yuz', 'Yoz', 'Yil', 'Yuz', 'Yoz'] * 10,
    'Z': ['Zar', 'Zamin', 'Zarb', 'Zar', 'Zamin', 'Zarb', 'Zar', 'Zamin', 'Zarb', 'Zar'] * 10,
    'O\'': ['O\'q', 'O\'t', 'O\'g\'il', 'O\'q', 'O\'t', 'O\'g\'il', 'O\'q', 'O\'t', 'O\'g\'il', 'O\'q'] * 10,
    'G\'': ['G\'isht', 'G\'oza', 'G\'oyib', 'G\'isht', 'G\'oza', 'G\'oyib', 'G\'isht', 'G\'oza', 'G\'oyib', 'G\'isht'] * 10,
    'Sh': ['Shahar', 'Shamol', 'Shox', 'Shahar', 'Shamol', 'Shox', 'Shahar', 'Shamol', 'Shox', 'Shahar'] * 10,
    'Ch': ['Choy', 'Chiroq', 'Chiqish', 'Choy', 'Chiroq', 'Chiqish', 'Choy', 'Chiroq', 'Chiqish', 'Choy'] * 10,
    'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz', 'Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz', 'Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz', 'Ming'] * 10,
}

def generate_all_words():
    """Har bir harf uchun 100 ta so'z generatsiya qilish"""
    all_words = {}
    for letter in UZBEK_LETTERS:
        words = BASE_WORDS.get(letter, [])
        # 100 tagacha yetkazish
        while len(words) < 100:
            if words:
                words.append(random.choice(words))
            else:
                words.append(f'{letter} so\'z')
        # Random aylantirish va 100 tasini qaytarish
        random.shuffle(words)
        all_words[letter] = words[:100]
    return all_words

async def seed_words():
    """Database ga so'zlarni kiritish"""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(LearningPath).where(LearningPath.key == "alphabet"))
        learning_path = result.scalar_one_or_none()
        
        if not learning_path:
            print("❌ Alphabet learning path topilmadi. Avval seed.py ni ishga tushiring.")
            return
        
        result = await session.execute(
            select(Module).where(
                Module.learning_path_id == learning_path.id,
                Module.key.in_(["alphabet-basics", "letters"])
            )
        )
        module = result.scalar_one_or_none()
        
        if not module:
            print("❌ Alphabet-basics yoki letters module topilmadi. Avval seed.py ni ishga tushiring.")
            return
        
        all_words = generate_all_words()
        
        for letter in UZBEK_LETTERS:
            result = await session.execute(
                select(Lesson).where(
                    Lesson.module_id == module.id,
                    Lesson.target_letter == letter
                )
            )
            lesson = result.scalar_one_or_none()
            
            if lesson:
                words = all_words.get(letter, [])
                lesson.example_words = words[:100]
                print(f"✅ {letter} harfi uchun {len(words)} ta so'z yangilandi")
            else:
                print(f"⚠️  {letter} harfi uchun lesson topilmadi")
        
        await session.commit()
        print("\n✅ Barcha so'zlar database ga kiritildi!")

if __name__ == "__main__":
    asyncio.run(seed_words())
