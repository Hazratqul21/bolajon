import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types/api';
import type { Progress } from '@/types/learning';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse<Progress[]>>(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    const progress = await prisma.progress.findMany({
      where: { userId },
      orderBy: { letterIndex: 'asc' },
    });

    return NextResponse.json<ApiResponse<Progress[]>>({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json<ApiResponse<Progress[]>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

