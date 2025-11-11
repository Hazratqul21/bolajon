/**
 * Muxlisa AI API Client
 * Documentation: https://muxlisa.uz/en
 */

const MUXLISA_API_URL = process.env.MUXLISA_API_URL || 'https://muxlisa.uz/api';
const MUXLISA_API_KEY = process.env.MUXLISA_API_KEY;

export async function speechToText(audioBlob: Blob): Promise<string> {
  if (!MUXLISA_API_KEY) {
    throw new Error('MUXLISA_API_KEY is not configured');
  }

  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  formData.append('language', 'uz');

  try {
    const response = await fetch(`${MUXLISA_API_URL}/stt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MUXLISA_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Muxlisa STT API error: ${error}`);
    }

    const data = await response.json();
    return data.text || data.transcription || '';
  } catch (error) {
    console.error('Speech to text error:', error);
    throw error;
  }
}

export async function textToSpeech(text: string): Promise<Blob> {
  if (!MUXLISA_API_KEY) {
    throw new Error('MUXLISA_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${MUXLISA_API_URL}/tts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MUXLISA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language: 'uz',
        voice: 'female', // or 'male'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Muxlisa TTS API error: ${error}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Text to speech error:', error);
    throw error;
  }
}

