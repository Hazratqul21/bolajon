import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types/api';
import type { LeaderboardEntry } from '@/types/learning';

export async function GET(request: NextRequest) {
  try {
    // Get top users by score
    const users = await prisma.user.findMany({
      orderBy: {
        totalScore: 'desc',
      },
      take: 100,
      select: {
        id: true,
        name: true,
        totalScore: true,
        totalStars: true,
        avatar: true,
      },
    });

    // Update or create leaderboard entries
    const leaderboardEntries = await Promise.all(
      users.map(async (user, index) => {
        const entry = await prisma.leaderboard.upsert({
          where: { userId: user.id },
          update: {
            score: user.totalScore,
            stars: user.totalStars,
            rank: index + 1,
          },
          create: {
            userId: user.id,
            score: user.totalScore,
            stars: user.totalStars,
            rank: index + 1,
          },
        });
        return {
          ...entry,
          name: user.name,
          avatar: user.avatar,
        };
      })
    );

    return NextResponse.json<ApiResponse<LeaderboardEntry[]>>({
      success: true,
      data: leaderboardEntries,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json<ApiResponse<LeaderboardEntry[]>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

