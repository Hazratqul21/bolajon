/**
 * Anthropic Claude API Client for speech analysis
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIFeedback } from '@/types/api';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeSpeech(params: {
  expectedWord: string;
  spokenWord: string;
  letter: string;
}): Promise<AIFeedback> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const { expectedWord, spokenWord, letter } = params;

  const prompt = `You are a friendly teacher helping a 4-7 year old child learn the Uzbek alphabet. 
Analyze the child's pronunciation attempt.

Expected word: "${expectedWord}"
Child said: "${spokenWord}"
Letter being learned: "${letter}"

Provide feedback in Uzbek language (child-friendly):
1. Determine if the pronunciation is correct (considering child's age and common mistakes)
2. Calculate accuracy (0-100%)
3. Identify specific mistakes if any
4. Give encouraging, positive feedback
5. Suggest how to improve

Respond in JSON format:
{
  "isCorrect": boolean,
  "accuracy": number (0-100),
  "feedback": string (brief explanation in Uzbek),
  "mistakes": string[] (optional, list of mistakes),
  "encouragement": string (positive, encouraging message in Uzbek)
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    const responseText = content.text.trim();
    // Remove markdown code blocks if present
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(jsonText) as AIFeedback;

    return {
      isCorrect: analysis.isCorrect ?? false,
      accuracy: analysis.accuracy ?? 0,
      feedback: analysis.feedback || 'Yaxshi urinish!',
      mistakes: analysis.mistakes,
      encouragement: analysis.encouragement || 'Davom eting!',
    };
  } catch (error) {
    console.error('Claude analysis error:', error);
    
    // Fallback response
    const isSimilar = spokenWord.toLowerCase().trim() === expectedWord.toLowerCase().trim();
    return {
      isCorrect: isSimilar,
      accuracy: isSimilar ? 100 : 50,
      feedback: isSimilar 
        ? 'Ajoyib! To\'g\'ri talaffuz qildingiz!' 
        : 'Yana bir bor urinib ko\'ring.',
      mistakes: isSimilar ? undefined : ['Talaffuzni yaxshilash kerak'],
      encouragement: 'Davom eting, siz yaxshi qilyapsiz!',
    };
  }
}

