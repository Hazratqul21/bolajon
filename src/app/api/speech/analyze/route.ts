import { NextRequest, NextResponse } from 'next/server';
import { speechToText } from '@/lib/ai/muxlisa-client';
import { analyzeSpeech } from '@/lib/ai/claude-client';
import type { ApiResponse, SpeechAnalysisResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const expectedWord = formData.get('expectedWord') as string;
    const letter = formData.get('letter') as string;

    if (!audioFile || !expectedWord || !letter) {
      return NextResponse.json<ApiResponse<SpeechAnalysisResponse>>(
        {
          success: false,
          error: 'Missing required fields: audio, expectedWord, letter',
        },
        { status: 400 }
      );
    }

    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type || 'audio/webm',
    });

    // Speech to text
    const transcribedText = await speechToText(audioBlob);

    // Analyze with Claude
    const feedback = await analyzeSpeech({
      expectedWord,
      spokenWord: transcribedText,
      letter,
    });

    return NextResponse.json<ApiResponse<SpeechAnalysisResponse>>({
      success: true,
      data: {
        transcribedText,
        feedback,
      },
    });
  } catch (error) {
    console.error('Speech analysis error:', error);
    return NextResponse.json<ApiResponse<SpeechAnalysisResponse>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

