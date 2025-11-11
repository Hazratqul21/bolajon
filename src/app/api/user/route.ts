import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json<ApiResponse<User>>(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json<ApiResponse<User>>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse<User>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

