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
    // Fallback: Web Speech API ishlatish
    return await webSpeechToText(audioBlob);
  }

  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');

  try {
    const response = await fetch(`${MUXLISA_API_URL}/v2/stt`, {
      method: 'POST',
      headers: {
        'x-api-key': MUXLISA_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn('Muxlisa STT API error, using fallback:', error);
      return await webSpeechToText(audioBlob);
    }

    const data = await response.json();
    return {
      transcript: data.transcript || data.text || '',
      confidence: data.confidence,
      duration: data.duration,
    };
  } catch (error) {
    console.warn('Muxlisa STT error, using fallback:', error);
    return await webSpeechToText(audioBlob);
  }
}

/**
 * Text-to-Speech: Matnni ovozga aylantirish
 */
export async function textToSpeech(text: string, voice: string = 'child_female'): Promise<TTSResponse> {
  if (!MUXLISA_API_KEY) {
    // Fallback: Web Speech API ishlatish
    return await webTextToSpeech(text);
  }

  try {
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

    if (!response.ok) {
      const error = await response.text();
      console.warn('Muxlisa TTS API error, using fallback:', error);
      return await webTextToSpeech(text);
    }

    const data = await response.json();
    return {
      audio_url: data.audio_url,
      audio_base64: data.audio_base64,
    };
  } catch (error) {
    console.warn('Muxlisa TTS error, using fallback:', error);
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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

