# Muxlisa AI Integratsiyasi

## 📋 Umumiy Ma'lumot

Muxlisa AI - O'zbek tilida STT (Speech-to-Text) va TTS (Text-to-Speech) xizmatlari.

## 🏗️ Arxitektura

```
Foydalanuvchi (Bola)
    ↓
🎙️ Mikrofon (Browser)
    ↓
Web Speech API (Fallback) / Muxlisa AI STT
    ↓
🧠 Brain OpenAI (Talaffuz baholash)
    ↓
💾 Database (Progress, XP, Lessons)
    ↓
🧠 Brain OpenAI (Javob yaratish)
    ↓
Muxlisa AI TTS
    ↓
🔊 Ovoz (Bola eshitadi)
```

## 🔧 Integratsiya Qismlari

### 1. Frontend (`src/lib/muxlisa-client.ts`)

**STT (Speech-to-Text):**
```typescript
import { speechToText } from '@/lib/muxlisa-client';

const result = await speechToText(audioBlob);
console.log(result.transcript); // "Anor"
```

**TTS (Text-to-Speech):**
```typescript
import { textToSpeech } from '@/lib/muxlisa-client';

const result = await textToSpeech("Bu A harfi");
// result.audio_url yoki result.audio_base64
```

### 2. Backend (`backend/app/services/muxlisa_service.py`)

**STT:**
```python
from app.services.muxlisa_service import muxlisa_client

result = await muxlisa_client.transcribe(
    audio_base64=base64_audio,
    language="uz"
)
transcript = result["transcript"]
```

**TTS:**
```python
result = await muxlisa_client.synthesize(
    text="Bu A harfi",
    voice="child_female"
)
audio_url = result["audio_url"]
```

## 🔑 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_MUXLISA_API_URL=https://muxlisa.uz/api
NEXT_PUBLIC_MUXLISA_API_KEY=your_api_key_here
```

### Backend (`.env`)
```env
MUXLISA_API_URL=https://muxlisa.uz/api
MUXLISA_API_KEY=your_api_key_here
```

## 🎯 Ishlatish

### Real-time Conversation Flow

1. **Foydalanuvchi gapiradi** 🎙️
2. **Web Speech API** yoki **Muxlisa STT** ovozni matnga aylantiradi
3. **Brain OpenAI** matnni tahlil qiladi:
   - Talaffuz to'g'rimi?
   - Harf to'g'ri talaffuz qilinganmi?
   - Bola xulq-atvori qanday?
4. **Database** dan ma'lumot olinadi (progress, preferences)
5. **Brain OpenAI** javob yaratadi (4-7 yoshli bola kabi)
6. **Muxlisa TTS** javobni ovozga aylantiradi
7. **Bola eshitadi** 🔊

## 📝 API Endpoints

### Muxlisa AI API

**STT:**
```
POST https://muxlisa.uz/api/v1/stt/transcribe
Headers:
  Authorization: Bearer {api_key}
Body:
  {
    "audio_base64": "...",
    "language": "uz"
  }
Response:
  {
    "transcript": "Anor",
    "confidence": 0.95,
    "duration": 1.2
  }
```

**TTS:**
```
POST https://muxlisa.uz/api/v1/tts/synthesize
Headers:
  Authorization: Bearer {api_key}
Body:
  {
    "text": "Bu A harfi",
    "voice": "child_female",
    "language": "uz"
  }
Response:
  {
    "audio_url": "https://...",
    "audio_base64": "..."
  }
```

## 🔄 Fallback Mexanizmi

Agar Muxlisa API ishlamasa:

1. **STT:** Web Speech API ishlatiladi
2. **TTS:** Browser Speech Synthesis ishlatiladi

Bu demo rejimda ham ishlashni ta'minlaydi.

## 🧪 Test Qilish

```bash
# Frontend
npm run dev

# Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload

# Test
curl -X POST http://localhost:8000/api/lessons/{lesson_id}/attempt \
  -H "Content-Type: application/json" \
  -d '{
    "audio_base64": "...",
    "transcript": "Anor"
  }'
```

## 📚 Qo'shimcha Ma'lumot

- [Muxlisa AI Documentation](https://muxlisa.uz)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [OpenAI API](https://platform.openai.com/docs)

