import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/ai/muxlisa-client';
import type { ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json<ApiResponse<Blob>>(
        {
          success: false,
          error: 'Missing or invalid text parameter',
        },
        { status: 400 }
      );
    }

    const audioBlob = await textToSpeech(text);

    return new NextResponse(audioBlob, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBlob.size.toString(),
      },
    });
  } catch (error) {
    console.error('Text to speech error:', error);
    return NextResponse.json<ApiResponse<Blob>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

