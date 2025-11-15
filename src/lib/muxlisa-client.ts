/**
 * Muxlisa AI API Client
 * STT (Speech-to-Text) va TTS (Text-to-Speech) uchun
 * Documentation: https://muxlisa.uz
 */

const MUXLISA_API_URL = process.env.NEXT_PUBLIC_MUXLISA_API_URL || 'https://service.muxlisa.uz/api';
const MUXLISA_API_KEY = process.env.NEXT_PUBLIC_MUXLISA_API_KEY;

export interface STTResponse {
  transcript: string;
  confidence?: number;
  duration?: number;
  error?: string;
  text?: string;
}

export interface TTSResponse {
  audio_url?: string;
  audio_base64?: string;
  error?: string;
}

export interface GenerateWordsRequest {
  letter: string;
  interests: string[];
  childAge?: number;
  childName?: string;
}

export interface GenerateWordsResponse {
  words: string[];
  explanation?: string;
}

export interface ChatMessageRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  childName?: string;
  childAge?: number;
  preferences?: string[];
}

export interface ChatMessageResponse {
  response: string;
  suggested_letter?: string;
  example_words?: string[];
}

/**
 * Speech-to-Text: Ovozni matnga aylantirish
 */
export async function speechToText(audioBlob: Blob): Promise<STTResponse> {
  if (!MUXLISA_API_KEY) {
    console.warn('MUXLISA_API_KEY not found, using Web Speech API fallback');
    return await webSpeechToText(audioBlob);
  }

  let mimeType = audioBlob.type || 'audio/webm';
  if (mimeType.includes(';codecs=')) {
    mimeType = mimeType.split(';')[0];
  }
  
  let extension = 'webm';
  if (mimeType.includes('wav')) {
    extension = 'wav';
  } else if (mimeType.includes('ogg')) {
    extension = 'ogg';
  } else if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
    extension = 'mp4';
  } else if (mimeType.includes('flac')) {
    extension = 'flac';
  } else if (mimeType.includes('aac')) {
    extension = 'aac';
  } else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) {
    extension = 'mp3';
  }
  
  const fileName = `audio.${extension}`;

    const formData = new FormData();
    formData.append('audio', audioBlob, fileName);
    formData.append('language', 'uz'); // O'zbek tilini aniq belgilash

    try {
      console.log('🎤 Muxlisa STT Request:', {
        url: `${MUXLISA_API_URL}/v2/stt`,
        fileName,
        mimeType,
        size: audioBlob.size,
        language: 'uz',
      });

      const response = await fetch(`${MUXLISA_API_URL}/v2/stt`, {
        method: 'POST',
        headers: {
          'x-api-key': MUXLISA_API_KEY,
        },
        body: formData,
      });

    console.log('🎤 Muxlisa STT Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Unknown error';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || errorText;
      } catch (e) {
        errorMessage = errorText;
      }
      
      console.warn('⚠️ Muxlisa STT API error:', errorMessage);
      
      // Muxlisa STT ishlamasa, bo'sh transcript qaytaramiz
      // Web Speech API to'g'ridan-to'g'ri mikrofonni ishlatadi, audioBlob'ni emas
      return { 
        transcript: '', 
        error: `Muxlisa STT error: ${errorMessage}` 
      };
    }

    const data = await response.json();
    console.log('🎤 Muxlisa STT Response Data:', data);
    
    const transcript = data.transcript || data.text || data.result || data.data?.transcript || data.data?.text || '';
    const confidence = data.confidence || data.score || data.data?.confidence;
    const duration = data.duration || data.data?.duration;
    
    console.log('🎤 Muxlisa STT Result:', {
      transcript,
      confidence,
      duration,
    });
    
    return {
      transcript,
      confidence,
      duration,
    };
  } catch (error) {
    console.error('❌ Muxlisa STT error:', error);
    // Muxlisa STT xatosi bo'lsa, bo'sh transcript qaytaramiz
    return { 
      transcript: '', 
      error: `Muxlisa STT error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Text-to-Speech: Matnni ovozga aylantirish
 */
export async function textToSpeech(text: string, voice: string = 'maftuna'): Promise<TTSResponse> {
  if (!MUXLISA_API_KEY) {
    console.error('❌ MUXLISA_API_KEY not found');
    return { 
      error: 'MUXLISA_API_KEY not found' 
    };
  }

  try {
    console.log('🔊 Muxlisa TTS Request:', {
      url: `${MUXLISA_API_URL}/v2/tts`,
      text,
      voice,
      language: 'uz',
    });

    const response = await fetch(`${MUXLISA_API_URL}/v2/tts`, {
      method: 'POST',
      headers: {
        'x-api-key': MUXLISA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        language: 'uz',
      }),
    });

    console.log('🔊 Muxlisa TTS Response Status:', response.status, response.statusText);

    const contentType = response.headers.get('content-type') || '';
    console.log('🔊 Muxlisa TTS: Content-Type:', contentType);
    
    if (contentType.includes('audio')) {
      console.log('🔊 Muxlisa TTS: Audio file response detected');
      const audioBlob = await response.blob();
      console.log('🔊 Muxlisa TTS: Audio blob size:', audioBlob.size, 'bytes, type:', audioBlob.type);
      
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          console.log('🔊 Muxlisa TTS: Base64 audio received, length:', base64Data.length);
          resolve({
            audio_base64: base64Data,
          });
        };
        reader.onerror = (err) => {
          console.error('🔊 Muxlisa TTS: FileReader error:', err);
          resolve({ error: 'FileReader error' });
        };
        reader.readAsDataURL(audioBlob);
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Unknown error';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || errorText;
      } catch (e) {
        errorMessage = errorText;
      }
      
      // Faqat Muxlisa TTS ishlatiladi, fallback yo'q
      console.warn('⚠️ Muxlisa TTS API error:', errorMessage);
      return { 
        error: `Muxlisa TTS error: ${errorMessage}` 
      };
    }

    const data = await response.json();
    console.log('🔊 Muxlisa TTS Response Data:', data);
    
    let audioUrl = data.audio_url || data.url || data.result?.audio_url || data.data?.audio_url;
    let audioBase64 = data.audio_base64 || data.audio || data.result?.audio_base64 || data.data?.audio_base64;
    
    if (!audioUrl && !audioBase64) {
      console.warn('🔊 Muxlisa TTS: No audio found in response');
      return { 
        error: 'Muxlisa TTS: No audio found in response' 
      };
    }
    
    console.log('🔊 Muxlisa TTS: Audio found:', {
      hasUrl: !!audioUrl,
      hasBase64: !!audioBase64,
      urlLength: audioUrl?.length,
      base64Length: audioBase64?.length,
    });
    
    return {
      audio_url: audioUrl,
      audio_base64: audioBase64,
    };
  } catch (error) {
    console.error('❌ Muxlisa TTS error:', error);
    // Xatolarni log qilamiz, lekin Web Speech API'ga o'tmaymiz
    return { 
      error: `Muxlisa TTS error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Fallback: Web Speech API - Speech-to-Text
 */
async function webSpeechToText(audioBlob: Blob): Promise<STTResponse> {
  return new Promise((resolve) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      resolve({ transcript: '', error: 'Speech recognition not supported' });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      resolve({ transcript: '', error: 'Speech recognition not available' });
      return;
    }

    const recognition = new SpeechRecognition();
    
    recognition.lang = 'uz-UZ';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve({ transcript, confidence: event.results[0][0].confidence });
    };

    recognition.onerror = (event: any) => {
      resolve({ transcript: '', error: event.error });
    };

    recognition.start();
    
    setTimeout(() => {
      recognition.stop();
      resolve({ transcript: '', error: 'Timeout' });
    }, 5000);
  });
}

/**
 * Fallback: Web Speech API - Text-to-Speech
 */
async function webTextToSpeech(text: string): Promise<TTSResponse> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('⚠️ Web Speech API not supported');
      resolve({ error: 'Speech synthesis not supported' });
      return;
    }

    // Avval barcha ovozlarni to'xtatish
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uz-UZ';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // O'zbek tilidagi ovozni tanlash
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const uzbekVoice = voices.find(voice => 
        voice.lang.includes('uz') || 
        voice.lang.includes('UZ') ||
        voice.name.toLowerCase().includes('uzbek') ||
        voice.name.toLowerCase().includes('turkish') // Ba'zi browser'larda Turkish voice ishlaydi
      );
      
      if (uzbekVoice) {
        utterance.voice = uzbekVoice;
        console.log('🔊 Web Speech API: Voice found:', uzbekVoice.name, uzbekVoice.lang);
      } else {
        console.log('⚠️ Web Speech API: Uzbek voice not found, using default');
        // Default voice bilan ishlatamiz
      }
    };

    // Ovozlar yuklanishini kutish
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices(); // Darhol sinab ko'rish

    let isResolved = false;

    utterance.onend = () => {
      if (!isResolved) {
        console.log('✅ Web Speech API: Speech completed');
        isResolved = true;
        resolve({ audio_url: 'web-speech-api' });
      }
    };

    utterance.onerror = (event: any) => {
      if (!isResolved) {
        const errorType = event.error || 'Unknown';
        
        // Ba'zi xatolar normal (masalan, 'interrupted' - foydalanuvchi to'xtatgan)
        if (errorType === 'interrupted' || errorType === 'canceled') {
          console.log('ℹ️ Web Speech API interrupted (normal):', errorType);
          isResolved = true;
          resolve({ error: `Speech interrupted: ${errorType}` });
          return;
        }
        
        // Boshqa xatolarni warning sifatida ko'rsatamiz
        console.warn('⚠️ Web Speech API error:', errorType);
        isResolved = true;
        resolve({ error: 'Web Speech API error: ' + errorType });
      }
    };

    // Ovozni boshlash
    window.speechSynthesis.speak(utterance);
    
    // Timeout - agar 15 soniyadan keyin ham tugallanmasa
    setTimeout(() => {
      if (!isResolved) {
        console.warn('⚠️ Web Speech API: Timeout, resolving anyway');
        window.speechSynthesis.cancel();
        isResolved = true;
        resolve({ audio_url: 'web-speech-api' });
      }
    }, 15000);
  });
}

/**
 * Muxlisa AI "Miya" - Qiziqishlarga mos random so'zlarni generatsiya qilish
 */
export async function generateWordsByInterest(
  request: GenerateWordsRequest
): Promise<GenerateWordsResponse> {
  if (!MUXLISA_API_KEY) {
    console.warn('⚠️ MUXLISA_API_KEY not found, using fallback');
    return getFallbackWords(request.letter, request.interests);
  }

  console.log('🧠 Muxlisa AI: Generating words for letter:', request.letter, 'interests:', request.interests);

  try {
    const interestsText = request.interests && request.interests.length > 0 
      ? request.interests.join(', ') 
      : 'umumiy qiziqishlar (har qanday mavzu)';
    
    const prompt = `Siz 4-7 yoshli bolalar uchun o'zbek tilida harflarni o'rgatuvchi yordamchi AI'siz. 
Harf: ${request.letter}
Qiziqishlar: ${interestsText}
Bola yoshi: ${request.childAge || 'noma\'lum'}
Bola ismi: ${request.childName || 'Bola'}

Ushbu harf bilan boshlanadigan 3 ta random so'z toping. Qiziqishlar bo'lsa, ularga mos bo'lsin, aks holda umumiy va tushunarli so'zlar bo'lsin.

Javob faqat JSON formatida bo'lsin: {"words": ["so'z1", "so'z2", "so'z3"]}`;

    const response = await fetch(`${MUXLISA_API_URL}/v2/chat`, {
      method: 'POST',
      headers: {
        'x-api-key': MUXLISA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        language: 'uz',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Muxlisa AI response:', data);
      
      const content = data.response || data.message || data.text || data.content || '';
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.words && Array.isArray(parsed.words) && parsed.words.length > 0) {
            console.log('✅ Muxlisa AI generated words:', parsed.words);
            return {
              words: parsed.words.slice(0, 3),
              explanation: parsed.explanation,
            };
          }
        } catch (e) {
          console.warn('⚠️ Muxlisa AI response parse error:', e);
        }
      }
    } else {
      console.warn('⚠️ Muxlisa AI chat API not available, using fallback');
    }
  } catch (error) {
    console.warn('⚠️ Muxlisa AI chat API error:', error);
  }

  return getFallbackWords(request.letter, request.interests);
}

/**
 * Fallback: Preferences bo'yicha mos so'zlarni qaytarish
 * Har safar random so'zlar qaytaradi
 */
function getFallbackWords(letter: string, interests: string[]): GenerateWordsResponse {
  console.log('🔄 Using fallback words for letter:', letter, 'interests:', interests);
  
  // Random shuffle funksiyasi
  const shuffle = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const wordsByInterest: Record<string, Record<string, string[]>> = {
    'Hayvonlar': {
      'A': ['Ari', 'Anor', 'Archa'],
      'B': ['Bola', 'Bosh', 'Bog\''],
      'D': ['Daraxt', 'Dost', 'Dars'],
      'E': ['Eshik', 'Elak', 'Eshak'],
      'F': ['Futbol', 'Fayl', 'Fen'],
      'G': ['Gul', 'Gap', 'G\'isht'],
      'H': ['Havo', 'Hona', 'Hovli'],
      'I': ['Ish', 'It', 'Ikki'],
      'J': ['Javob', 'Juda', 'Juma'],
      'K': ['Kitob', 'Kuch', 'Kun'],
      'L': ['Lola', 'Limon', 'Lak'],
      'M': ['Mashina', 'Maktab', 'Mushuk'],
      'N': ['Non', 'Nar', 'Nima'],
      'O': ['Olma', 'O\'q', 'O\'t'],
      'P': ['Poy', 'Pul', 'Pichoq'],
      'Q': ['Qalam', 'Qiz', 'Qush'],
      'R': ['Rang', 'Rasm', 'Ruchka'],
      'S': ['Suv', 'Sichqon', 'Sut'],
      'T': ['Tosh', 'Tovuq', 'Tuz'],
      'U': ['Uy', 'Uch', 'Uzum'],
      'V': ['Voy', 'Vazifa', 'Vilka'],
      'X': ['Xona', 'Xat', 'Xalq'],
      'Y': ['Yoz', 'Yil', 'Yuz'],
      'Z': ['Zar', 'Zamin', 'Zarb'],
      'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
      'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
      'Sh': ['Shahar', 'Shamol', 'Shox'],
      'Ch': ['Choy', 'Chiroq', 'Chiqish'],
      'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
    },
    'Mashinalar': {
      'A': ['Avtobus', 'Avtomobil', 'Aeroplane'],
      'B': ['Bola', 'Bosh', 'Bog\''],
      'D': ['Daraxt', 'Dost', 'Dars'],
      'E': ['Eshik', 'Elak', 'Eshak'],
      'F': ['Futbol', 'Fayl', 'Fen'],
      'G': ['Gul', 'Gap', 'G\'isht'],
      'H': ['Havo', 'Hona', 'Hovli'],
      'I': ['Ish', 'It', 'Ikki'],
      'J': ['Javob', 'Juda', 'Juma'],
      'K': ['Kitob', 'Kuch', 'Kun'],
      'L': ['Lola', 'Limon', 'Lak'],
      'M': ['Mashina', 'Maktab', 'Mushuk'],
      'N': ['Non', 'Nar', 'Nima'],
      'O': ['Olma', 'O\'q', 'O\'t'],
      'P': ['Poy', 'Pul', 'Pichoq'],
      'Q': ['Qalam', 'Qiz', 'Qush'],
      'R': ['Rang', 'Rasm', 'Ruchka'],
      'S': ['Suv', 'Sichqon', 'Sut'],
      'T': ['Tosh', 'Tovuq', 'Tuz'],
      'U': ['Uy', 'Uch', 'Uzum'],
      'V': ['Voy', 'Vazifa', 'Vilka'],
      'X': ['Xona', 'Xat', 'Xalq'],
      'Y': ['Yoz', 'Yil', 'Yuz'],
      'Z': ['Zar', 'Zamin', 'Zarb'],
      'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
      'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
      'Sh': ['Shahar', 'Shamol', 'Shox'],
      'Ch': ['Choy', 'Chiroq', 'Chiqish'],
      'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
    },
    'Ranglar': {
      'A': ['Apelsin', 'Anor', 'Archa'],
      'B': ['Binafsha', 'Bosh', 'Bog\''],
      'D': ['Daraxt', 'Dost', 'Dars'],
      'E': ['Eshik', 'Elak', 'Eshak'],
      'F': ['Futbol', 'Fayl', 'Fen'],
      'G': ['Gul', 'Gap', 'G\'isht'],
      'H': ['Havo', 'Hona', 'Hovli'],
      'I': ['Ish', 'It', 'Ikki'],
      'J': ['Javob', 'Juda', 'Juma'],
      'K': ['Kitob', 'Kuch', 'Kun'],
      'L': ['Lola', 'Limon', 'Lak'],
      'M': ['Mashina', 'Maktab', 'Mushuk'],
      'N': ['Non', 'Nar', 'Nima'],
      'O': ['Olma', 'O\'q', 'O\'t'],
      'P': ['Poy', 'Pul', 'Pichoq'],
      'Q': ['Qalam', 'Qizil', 'Qush'],
      'R': ['Rang', 'Rasm', 'Ruchka'],
      'S': ['Suv', 'Sichqon', 'Sut'],
      'T': ['Tosh', 'Tovuq', 'Tuz'],
      'U': ['Uy', 'Uch', 'Uzum'],
      'V': ['Voy', 'Vazifa', 'Vilka'],
      'X': ['Xona', 'Xat', 'Xalq'],
      'Y': ['Yoz', 'Yil', 'Yuz'],
      'Z': ['Zar', 'Zamin', 'Zarb'],
      'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
      'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
      'Sh': ['Shahar', 'Shamol', 'Shox'],
      'Ch': ['Choy', 'Chiroq', 'Chiqish'],
      'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
    },
    'Musiqa': {
      'A': ['Anor', 'Archa', 'Avtobus'],
      'B': ['Bola', 'Bosh', 'Bog\''],
      'D': ['Daraxt', 'Dost', 'Dars'],
      'E': ['Eshik', 'Elak', 'Eshak'],
      'F': ['Futbol', 'Fayl', 'Fen'],
      'G': ['Gul', 'Gap', 'G\'isht'],
      'H': ['Havo', 'Hona', 'Hovli'],
      'I': ['Ish', 'It', 'Ikki'],
      'J': ['Javob', 'Juda', 'Juma'],
      'K': ['Kitob', 'Kuch', 'Kun'],
      'L': ['Lola', 'Limon', 'Lak'],
      'M': ['Mashina', 'Maktab', 'Mushuk'],
      'N': ['Non', 'Nar', 'Nima'],
      'O': ['Olma', 'O\'q', 'O\'t'],
      'P': ['Poy', 'Pul', 'Pichoq'],
      'Q': ['Qalam', 'Qiz', 'Qush'],
      'R': ['Rang', 'Rasm', 'Ruchka'],
      'S': ['Suv', 'Sichqon', 'Sut'],
      'T': ['Tosh', 'Tovuq', 'Tuz'],
      'U': ['Uy', 'Uch', 'Uzum'],
      'V': ['Voy', 'Vazifa', 'Vilka'],
      'X': ['Xona', 'Xat', 'Xalq'],
      'Y': ['Yoz', 'Yil', 'Yuz'],
      'Z': ['Zar', 'Zamin', 'Zarb'],
      'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
      'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
      'Sh': ['Shahar', 'Shamol', 'Shox'],
      'Ch': ['Choy', 'Chiroq', 'Chiqish'],
      'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
    },
    'Kitoblar': {
      'A': ['Anor', 'Archa', 'Avtobus'],
      'B': ['Bola', 'Bosh', 'Bog\''],
      'D': ['Daraxt', 'Dost', 'Dars'],
      'E': ['Eshik', 'Elak', 'Eshak'],
      'F': ['Futbol', 'Fayl', 'Fen'],
      'G': ['Gul', 'Gap', 'G\'isht'],
      'H': ['Havo', 'Hona', 'Hovli'],
      'I': ['Ish', 'It', 'Ikki'],
      'J': ['Javob', 'Juda', 'Juma'],
      'K': ['Kitob', 'Kuch', 'Kun'],
      'L': ['Lola', 'Limon', 'Lak'],
      'M': ['Mashina', 'Maktab', 'Mushuk'],
      'N': ['Non', 'Nar', 'Nima'],
      'O': ['Olma', 'O\'q', 'O\'t'],
      'P': ['Poy', 'Pul', 'Pichoq'],
      'Q': ['Qalam', 'Qiz', 'Qush'],
      'R': ['Rang', 'Rasm', 'Ruchka'],
      'S': ['Suv', 'Sichqon', 'Sut'],
      'T': ['Tosh', 'Tovuq', 'Tuz'],
      'U': ['Uy', 'Uch', 'Uzum'],
      'V': ['Voy', 'Vazifa', 'Vilka'],
      'X': ['Xona', 'Xat', 'Xalq'],
      'Y': ['Yoz', 'Yil', 'Yuz'],
      'Z': ['Zar', 'Zamin', 'Zarb'],
      'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
      'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
      'Sh': ['Shahar', 'Shamol', 'Shox'],
      'Ch': ['Choy', 'Chiroq', 'Chiqish'],
      'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
    },
    'O\'yinlar': {
      'A': ['Anor', 'Archa', 'Avtobus'],
      'B': ['Bola', 'Bosh', 'Bog\''],
      'D': ['Daraxt', 'Dost', 'Dars'],
      'E': ['Eshik', 'Elak', 'Eshak'],
      'F': ['Futbol', 'Fayl', 'Fen'],
      'G': ['Gul', 'Gap', 'G\'isht'],
      'H': ['Havo', 'Hona', 'Hovli'],
      'I': ['Ish', 'It', 'Ikki'],
      'J': ['Javob', 'Juda', 'Juma'],
      'K': ['Kitob', 'Kuch', 'Kun'],
      'L': ['Lola', 'Limon', 'Lak'],
      'M': ['Mashina', 'Maktab', 'Mushuk'],
      'N': ['Non', 'Nar', 'Nima'],
      'O': ['Olma', 'O\'q', 'O\'t'],
      'P': ['Poy', 'Pul', 'Pichoq'],
      'Q': ['Qalam', 'Qiz', 'Qush'],
      'R': ['Rang', 'Rasm', 'Ruchka'],
      'S': ['Suv', 'Sichqon', 'Sut'],
      'T': ['Tosh', 'Tovuq', 'Tuz'],
      'U': ['Uy', 'Uch', 'Uzum'],
      'V': ['Voy', 'Vazifa', 'Vilka'],
      'X': ['Xona', 'Xat', 'Xalq'],
      'Y': ['Yoz', 'Yil', 'Yuz'],
      'Z': ['Zar', 'Zamin', 'Zarb'],
      'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
      'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
      'Sh': ['Shahar', 'Shamol', 'Shox'],
      'Ch': ['Choy', 'Chiroq', 'Chiqish'],
      'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
    },
  };

  const defaultWords: Record<string, string[]> = {
    'A': ['Anor', 'Archa', 'Avtobus'],
    'B': ['Bola', 'Bosh', 'Bog\''],
    'D': ['Daraxt', 'Dost', 'Dars'],
    'E': ['Eshik', 'Elak', 'Eshak'],
    'F': ['Futbol', 'Fayl', 'Fen'],
    'G': ['Gul', 'Gap', 'G\'isht'],
    'H': ['Havo', 'Hona', 'Hovli'],
    'I': ['Ish', 'It', 'Ikki'],
    'J': ['Javob', 'Juda', 'Juma'],
    'K': ['Kitob', 'Kuch', 'Kun'],
    'L': ['Lola', 'Limon', 'Lak'],
    'M': ['Mashina', 'Maktab', 'Mushuk'],
    'N': ['Non', 'Nar', 'Nima'],
    'O': ['Olma', 'O\'q', 'O\'t'],
    'P': ['Poy', 'Pul', 'Pichoq'],
    'Q': ['Qalam', 'Qiz', 'Qush'],
    'R': ['Rang', 'Rasm', 'Ruchka'],
    'S': ['Suv', 'Sichqon', 'Sut'],
    'T': ['Tosh', 'Tovuq', 'Tuz'],
    'U': ['Uy', 'Uch', 'Uzum'],
    'V': ['Voy', 'Vazifa', 'Vilka'],
    'X': ['Xona', 'Xat', 'Xalq'],
    'Y': ['Yoz', 'Yil', 'Yuz'],
    'Z': ['Zar', 'Zamin', 'Zarb'],
    'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
    'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
    'Sh': ['Shahar', 'Shamol', 'Shox'],
    'Ch': ['Choy', 'Chiroq', 'Chiqish'],
    'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
  };

  if (interests && interests.length > 0) {
    // Barcha qiziqishlardan so'zlarni yig'ish (har safar barcha qiziqishlardan so'zlar chiqishi uchun)
    const availableInterests = interests.filter(interest => 
      wordsByInterest[interest] && wordsByInterest[interest][letter] && wordsByInterest[interest][letter].length > 0
    );
    
    if (availableInterests.length > 0) {
      // Barcha qiziqishlardan so'zlarni yig'ish
      const allWordsForLetter: string[] = [];
      for (const interest of availableInterests) {
        const words = wordsByInterest[interest][letter];
        console.log(`📝 Muxlisa AI: ${interest} qiziqishidan ${words.length} ta so'z qo'shildi`);
        allWordsForLetter.push(...words);
      }
      
      console.log(`✅ Muxlisa AI: Jami ${allWordsForLetter.length} ta so'z yig'ildi (${availableInterests.length} ta qiziqishdan)`);
      
      // Random aylantirish va 3 tasini tanlash (har safar barcha qiziqishlardan random so'zlar)
      const shuffled = shuffle(allWordsForLetter);
      const selectedWords = shuffled.slice(0, 3);
      
      console.log('✅ Muxlisa AI: Selected words by interests (random):', selectedWords);
      return {
        words: selectedWords,
      };
    }
  }

  // Default so'zlarni random qilish
  const defaultWordsForLetter = defaultWords[letter] || ['So\'z 1', 'So\'z 2', 'So\'z 3'];
  const shuffledDefault = shuffle(defaultWordsForLetter);
  const selectedDefault = shuffledDefault.slice(0, 3);
  console.log('✅ Muxlisa AI: Using default words (random):', selectedDefault);
  return {
    words: selectedDefault,
  };
}

/**
 * Muxlisa AI Chat - Real-time suhbat uchun
 * NOTE: Endi Grok AI ishlatiladi, bu funksiya fallback sifatida qoldirilgan
 * @deprecated Grok AI ishlatiladi
 */
export async function generateChatResponse(
  request: ChatMessageRequest
): Promise<ChatMessageResponse> {
  console.log('🔍 Muxlisa AI generateChatResponse chaqirildi', {
    hasApiKey: !!MUXLISA_API_KEY,
    apiUrl: MUXLISA_API_URL,
    message: request.message,
  });

  if (!MUXLISA_API_KEY) {
    console.warn('⚠️ MUXLISA_API_KEY not found, using fallback');
    return getFallbackChatResponse(request);
  }

  try {
    const childName = request.childName || 'Bola';
    const childAge = request.childAge || 5;
    const preferences = request.preferences || [];
    const interestsText = preferences.length > 0 ? preferences.join(', ') : 'umumiy qiziqishlar';
    
    // Conversation history yaratish
    let conversationContext = '';
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      conversationContext = request.conversationHistory
        .slice(-5) // Oxirgi 5 ta xabar
        .map(msg => `${msg.role === 'user' ? 'Foydalanuvchi' : 'AI'}: ${msg.content}`)
        .join('\n');
    }
    
    const systemPrompt = `Siz 4-7 yoshli bolalar uchun o'zbek tilida harflarni o'rgatuvchi do'stona va qiziqarli yordamchi AI'siz.

Bola ismi: ${childName}
Bola yoshi: ${childAge}
Qiziqishlar: ${interestsText}

Sizning vazifangiz:
1. Bolaga do'stona va qiziqarli javob berish
2. Agar bola harfni o'rganmoqchi bo'lsa (masalan: "A harfini", "a harifini"), o'sha harfni o'rgatish
3. Agar bola faqat harf nomini aytgan bo'lsa (masalan: "a", "b"), o'sha harfni o'rgatish
4. Agar bola aniq so'z aytgan bo'lsa (masalan: "anor", "bola"), o'sha so'zni tahlil qilish va harfni ko'rsatish
5. Qiziqishlarga mos misollar berish
6. Qisqa va tushunarli javoblar (2-3 jumla)
7. NOTO'G'RI YOZILGAN SO'ZLARNI HAM TUSHUNISH (masalan: "harifini" = "harfini", "organ" = "o'rgan")`;

    const fullPrompt = conversationContext 
      ? `${systemPrompt}\n\nSuhbat tarixi:\n${conversationContext}\n\nFoydalanuvchi: ${request.message}\nAI:`
      : `${systemPrompt}\n\nFoydalanuvchi: ${request.message}\nAI:`;

    console.log('🚀 Muxlisa AI API chaqirilmoqda...', {
      url: `${MUXLISA_API_URL}/v2/chat`,
      hasKey: !!MUXLISA_API_KEY,
      keyLength: MUXLISA_API_KEY?.length || 0,
    });

    const response = await fetch(`${MUXLISA_API_URL}/v2/chat`, {
      method: 'POST',
      headers: {
        'x-api-key': MUXLISA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: fullPrompt,
        language: 'uz',
      }),
    });

    console.log('📡 Muxlisa AI API response status:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('📦 Muxlisa AI API response data:', JSON.stringify(data, null, 2));
      
      // Muxlisa AI javobini olish
      const content = data.response || data.text || data.message || data.content || '';
      
      if (content.trim()) {
        console.log('✅ Muxlisa AI response content:', content);
        
        // Harfni topish (agar mavjud bo'lsa)
        const letterMatch = content.match(/\b([A-ZO'G'ShChNg])\b/);
        const suggestedLetter = letterMatch ? letterMatch[1] : undefined;
        
        return {
          response: content.trim(),
          suggested_letter: suggestedLetter,
        };
      } else {
        console.warn('⚠️ Muxlisa AI response content bo\'sh', data);
      }
    } else {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Error text o\'qib bo\'lmadi: ' + (e instanceof Error ? e.message : String(e));
      }
      
      console.warn('⚠️ Muxlisa AI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
    }
  } catch (error) {
    console.error('❌ Muxlisa AI chat error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }

  console.warn('⚠️ Muxlisa AI ishlamadi, fallback javob qaytarilmoqda');
  return getFallbackChatResponse(request);
}

/**
 * Fallback chat response - kontekstni hisobga olgan
 */
function getFallbackChatResponse(request: ChatMessageRequest): ChatMessageResponse {
  const message = request.message.toLowerCase().trim();
  const childName = request.childName || 'Bola';
  
  // "A harfini o'rganmoqchiman" kabi so'rovlar (noto'g'ri yozilgan: "harifini", "harfini", "harfi")
  const learnLetterMatch = message.match(/([a-z]|o'|g'|sh|ch|ng)\s*har[if]*ini?\s*(o['']rgan|organ|o'rgan)?/i);
  if (learnLetterMatch) {
    const letter = learnLetterMatch[1].toUpperCase();
    const exampleWords = getExampleWordsForLetter(letter);
    return {
      response: `Ajoyib ${childName}! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.\n\nKeling, birinchi so'zni aytamiz: "${exampleWords[0]}".`,
      suggested_letter: letter,
      example_words: exampleWords,
    };
  }
  
  // "A harfi" yoki "A harfini" yoki "A harifini" kabi so'rovlar
  const letterMatch = message.match(/([a-z]|o'|g'|sh|ch|ng)\s*har[if]*/i);
  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase();
    const exampleWords = getExampleWordsForLetter(letter);
    return {
      response: `Ha, ${letter} harfi! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.`,
      suggested_letter: letter,
      example_words: exampleWords,
    };
  }
  
  // Faqat harf nomi (masalan: "A", "B", "O'")
  const singleLetterMatch = message.match(/^([a-z]|o'|g'|sh|ch|ng)$/i);
  if (singleLetterMatch) {
    const letter = singleLetterMatch[1].toUpperCase();
    const exampleWords = getExampleWordsForLetter(letter);
    return {
      response: `Ha, ${letter} harfi! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.`,
      suggested_letter: letter,
      example_words: exampleWords,
    };
  }
  
  // Salom xabari
  if (message.includes('salom') || message.includes('hello') || message.includes('hi')) {
    return {
      response: `Salom ${childName}! 🎉 Men sizga harflarni o'rgatishga yordam beraman. Qaysi harfni o'rganmoqchisiz? Masalan: "A harfini o'rganmoqchiman" yoki "B harfi".`,
    };
  }
  
  // Maxsus so'zlar - harf so'rovi emas
  const specialWords = ['o\'rgat', 'orgat', 'o\'rgan', 'organ', 'o\'rgatish', 'orgatish', 'o\'rganish', 'organish', 'o\'rgatmoq', 'orgatmoq', 'o\'rganmoq', 'organmoq'];
  const messageLower = message.toLowerCase();
  if (specialWords.some(word => messageLower.includes(word))) {
    return {
      response: `Tushundim ${childName}! Keling, harflarni o'rganamiz. Qaysi harfni o'rganmoqchisiz? Masalan: "A harfini o'rganmoqchiman" yoki faqat "A" deb yozing.`,
    };
  }
  
  // So'z aytilgan bo'lsa, harfni topish (faqat agar "harf" so'zi bo'lmasa)
  // Agar "harf" so'zi bo'lsa, yuqoridagi pattern matching ishlaydi
  if (!message.includes('harf') && !message.includes('harif')) {
    const words = message.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 0) {
      const firstWord = words[0];
      
      // Agar faqat bir harf bo'lsa (masalan: "a", "b")
      if (firstWord.length === 1) {
        const letter = firstWord.toUpperCase();
        const exampleWords = getExampleWordsForLetter(letter);
        return {
          response: `Ha, ${letter} harfi! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.`,
          suggested_letter: letter,
          example_words: exampleWords,
        };
      }
      
      // Qisqa so'zlar (2-3 harf) - ehtimol harf nomi yoki noto'g'ri yozilgan so'z
      if (firstWord.length <= 3) {
        // Agar so'z harf nomiga o'xshasa
        const letterMatch = firstWord.match(/^([a-z]|o'|g'|sh|ch|ng)$/i);
        if (letterMatch) {
          const letter = letterMatch[1].toUpperCase();
          const exampleWords = getExampleWordsForLetter(letter);
          return {
            response: `Ha, ${letter} harfi! Keling, ${letter} harfini o'rganamiz! 🎉\n\n${letter} harfi bilan boshlanadigan so'zlar: ${exampleWords.join(', ')}.`,
            suggested_letter: letter,
            example_words: exampleWords,
          };
        }
      }
      
      const firstLetter = firstWord.charAt(0).toUpperCase();
      
      // Maxsus harflar
      let detectedLetter = firstLetter;
      if (firstWord.toLowerCase().startsWith("o'")) {
        detectedLetter = "O'";
      } else if (firstWord.toLowerCase().startsWith("g'")) {
        detectedLetter = "G'";
      } else if (firstWord.toLowerCase().startsWith("sh")) {
        detectedLetter = "Sh";
      } else if (firstWord.toLowerCase().startsWith("ch")) {
        detectedLetter = "Ch";
      }
      
      // Agar so'z aniq bo'lsa (masalan: "anor", "bola"), harfni ko'rsatish
      // Lekin agar so'z noto'g'ri yozilgan bo'lsa (masalan: "orgat"), umumiy javob berish
      const isCommonWord = ['anor', 'bola', 'daraxt', 'eshik', 'gul', 'havo', 'ish', 'kitob', 'lola', 'mashina', 'non', 'olma', 'poy', 'qalam', 'rang', 'suv', 'tosh', 'uy', 'xona', 'yoz', 'zar'].includes(firstWord.toLowerCase());
      
      if (isCommonWord) {
        return {
          response: `Ajoyib! Siz "${firstWord}" dedingiz. Bu ${detectedLetter} harfi bilan boshlanadi! 🎉\n\nKeling, ${detectedLetter} harfini o'rganamiz!`,
          suggested_letter: detectedLetter,
        };
      } else {
        // Noto'g'ri yozilgan yoki noma'lum so'z
        return {
          response: `Tushundim ${childName}! Keling, harflarni o'rganamiz. Qaysi harfni o'rganmoqchisiz? Masalan: "A harfini o'rganmoqchiman" yoki faqat "A" deb yozing.`,
        };
      }
    }
  }
  
  // Umumiy javob
  return {
    response: `Tushundim ${childName}! Keling, harflarni o'rganamiz. Qaysi harfni o'rganmoqchisiz? Masalan: "A harfini o'rganmoqchiman" yoki faqat "A" deb yozing.`,
  };
}

/**
 * Harf uchun misol so'zlar olish
 */
function getExampleWordsForLetter(letter: string): string[] {
  const wordsByLetter: Record<string, string[]> = {
    'A': ['Anor', 'Archa', 'Avtobus'],
    'B': ['Bola', 'Bosh', 'Bog\''],
    'D': ['Daraxt', 'Dost', 'Dars'],
    'E': ['Eshik', 'Elak', 'Eshak'],
    'F': ['Futbol', 'Fayl', 'Fen'],
    'G': ['Gul', 'Gap', 'G\'isht'],
    'H': ['Havo', 'Hona', 'Hovli'],
    'I': ['Ish', 'It', 'Ikki'],
    'J': ['Javob', 'Juda', 'Juma'],
    'K': ['Kitob', 'Kuch', 'Kun'],
    'L': ['Lola', 'Limon', 'Lak'],
    'M': ['Mashina', 'Maktab', 'Mushuk'],
    'N': ['Non', 'Nar', 'Nima'],
    'O': ['Olma', 'O\'q', 'O\'t'],
    'P': ['Poy', 'Pul', 'Pichoq'],
    'Q': ['Qalam', 'Qiz', 'Qush'],
    'R': ['Rang', 'Rasm', 'Ruchka'],
    'S': ['Suv', 'Sichqon', 'Sut'],
    'T': ['Tosh', 'Tovuq', 'Tuz'],
    'U': ['Uy', 'Uch', 'Uzum'],
    'V': ['Voy', 'Vazifa', 'Vilka'],
    'X': ['Xona', 'Xat', 'Xalq'],
    'Y': ['Yoz', 'Yil', 'Yuz'],
    'Z': ['Zar', 'Zamin', 'Zarb'],
    'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
    'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
    'Sh': ['Shahar', 'Shamol', 'Shox'],
    'Ch': ['Choy', 'Chiroq', 'Chiqish'],
    'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
  };
  
  return wordsByLetter[letter] || ['So\'z 1', 'So\'z 2', 'So\'z 3'];
}

