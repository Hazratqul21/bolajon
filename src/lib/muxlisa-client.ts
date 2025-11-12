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
}

export interface TTSResponse {
  audio_url?: string;
  audio_base64?: string;
  error?: string;
}

/**
 * Speech-to-Text: Ovozni matnga aylantirish
 */
export async function speechToText(audioBlob: Blob): Promise<STTResponse> {
  if (!MUXLISA_API_KEY) {
    console.warn('MUXLISA_API_KEY not found, using Web Speech API fallback');
    return await webSpeechToText(audioBlob);
  }

  // Audio fayl formatini aniqlash
  const mimeType = audioBlob.type || 'audio/webm';
  const extension = mimeType.includes('webm') ? 'webm' : mimeType.includes('wav') ? 'wav' : 'mp3';
  const fileName = `audio.${extension}`;

  const formData = new FormData();
  formData.append('audio', audioBlob, fileName);

  try {
    console.log('🎤 Muxlisa STT Request:', {
      url: `${MUXLISA_API_URL}/v2/stt`,
      fileName,
      mimeType,
      size: audioBlob.size,
    });

    const response = await fetch(`${MUXLISA_API_URL}/v2/stt`, {
      method: 'POST',
      headers: {
        'x-api-key': MUXLISA_API_KEY,
        // FormData uchun Content-Type ni o'chirish (browser o'zi qo'shadi)
      },
      body: formData,
    });

    console.log('🎤 Muxlisa STT Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎤 Muxlisa STT API error:', errorText);
      return await webSpeechToText(audioBlob);
    }

    const data = await response.json();
    console.log('🎤 Muxlisa STT Response Data:', data);
    
    // Turli formatlarni qo'llab-quvvatlash
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
    console.error('🎤 Muxlisa STT error:', error);
    return await webSpeechToText(audioBlob);
  }
}

/**
 * Text-to-Speech: Matnni ovozga aylantirish
 */
// Maftuna - qiz bola ovozida gapirish
// Muxlisa AI dan "Maftuna" nomli qiz bola ovozini olish
export async function textToSpeech(text: string, voice: string = 'maftuna'): Promise<TTSResponse> {
  if (!MUXLISA_API_KEY) {
    console.warn('MUXLISA_API_KEY not found, using Web Speech API fallback');
    return await webTextToSpeech(text);
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
    console.log('🔊 Muxlisa TTS Response Headers:', Object.fromEntries(response.headers.entries()));

    // Agar response audio fayl bo'lsa (content-type: audio/*)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('audio')) {
      console.log('🔊 Muxlisa TTS: Audio file response detected');
      const audioBlob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // data:audio/...;base64, ni olib tashlash
          console.log('🔊 Muxlisa TTS: Base64 audio received, length:', base64Data.length);
          resolve({
            audio_base64: base64Data,
            text: text,
          });
        };
        reader.onerror = () => {
          console.error('🔊 Muxlisa TTS: FileReader error');
          resolve({ error: 'FileReader error' });
        };
        reader.readAsDataURL(audioBlob);
      });
    }

    // Agar response JSON bo'lsa
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔊 Muxlisa TTS API error:', errorText);
      return await webTextToSpeech(text);
    }

    const data = await response.json();
    console.log('🔊 Muxlisa TTS Response Data:', data);
    
    // Turli formatlarni qo'llab-quvvatlash
    let audioUrl = data.audio_url || data.url || data.result?.audio_url || data.data?.audio_url;
    let audioBase64 = data.audio_base64 || data.audio || data.result?.audio_base64 || data.data?.audio_base64;
    
    // Agar hech qanday audio topilmasa
    if (!audioUrl && !audioBase64) {
      console.warn('🔊 Muxlisa TTS: No audio found in response, using fallback');
      return await webTextToSpeech(text);
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
      text: data.text || text,
    };
  } catch (error) {
    console.error('🔊 Muxlisa TTS error:', error);
    return await webTextToSpeech(text);
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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      resolve({ transcript: '', error: 'Speech recognition not available' });
      return;
    }

    const recognition = new SpeechRecognition();
    
    recognition.lang = 'uz-UZ';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      resolve({ transcript, confidence: event.results[0][0].confidence });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      resolve({ transcript: '', error: event.error });
    };

    recognition.start();
    
    // 5 sekunddan keyin to'xtatish
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
    if (!('speechSynthesis' in window)) {
      resolve({ error: 'Speech synthesis not supported' });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uz-UZ';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onend = () => {
      resolve({ audio_url: 'web-speech-api' });
    };

    utterance.onerror = (event) => {
      resolve({ error: 'Speech synthesis error' });
    };

    window.speechSynthesis.speak(utterance);
    
    // Fallback response
    resolve({ audio_url: 'web-speech-api' });
  });
}

