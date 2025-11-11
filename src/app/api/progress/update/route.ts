import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse, ProgressUpdateRequest } from '@/types/api';
import type { Progress } from '@/types/learning';

export async function POST(request: NextRequest) {
  try {
    const body: ProgressUpdateRequest & { userId: string } = await request.json();
    const { userId, letter, letterIndex, word, isCorrect, score, accuracy, userSpeech, aiFeedback, duration } = body;

    if (!userId || !letter || letterIndex === undefined) {
      return NextResponse.json<ApiResponse<Progress>>(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Find or create progress
    let progress = await prisma.progress.findUnique({
      where: {
        userId_letterIndex: {
          userId,
          letterIndex,
        },
      },
    });

    const wordsCompleted = isCorrect
      ? Math.min((progress?.wordsCompleted || 0) + 1, 3)
      : progress?.wordsCompleted || 0;

    const newAccuracy = progress
      ? (progress.accuracy * progress.attemptsCount + accuracy) / (progress.attemptsCount + 1)
      : accuracy;

    if (progress) {
      progress = await prisma.progress.update({
        where: { id: progress.id },
        data: {
          wordsCompleted,
          accuracy: newAccuracy,
          attemptsCount: progress.attemptsCount + 1,
          completedAt: wordsCompleted >= 3 ? new Date() : null,
        },
      });
    } else {
      progress = await prisma.progress.create({
        data: {
          userId,
          letter,
          letterIndex,
          wordsCompleted,
          totalWords: 3,
          accuracy: newAccuracy,
          attemptsCount: 1,
          completedAt: wordsCompleted >= 3 ? new Date() : null,
        },
      });
    }

    // Create learning session
    const userSpeech = body.userSpeech || word;
    const aiFeedback = body.aiFeedback || '';
    const duration = body.duration || 0;
    
    await prisma.learningSession.create({
      data: {
        userId,
        letter,
        word,
        userSpeech,
        isCorrect,
        aiFeedback,
        score,
        duration,
      },
    });

    // Update user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { progress: true },
    });

    if (user) {
      const totalStars = isCorrect ? user.totalStars + Math.floor(score / 10) : user.totalStars;
      const totalScore = user.totalScore + score;
      const completedLetters = user.progress.filter((p) => p.completedAt !== null).length;
      const currentLevel = Math.min(completedLetters, 33);

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalStars,
          totalScore,
          currentLevel,
        },
      });
    }

    return NextResponse.json<ApiResponse<Progress>>({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json<ApiResponse<Progress>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

