import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const { name, age } = await request.json();

    if (!name || !age) {
      return NextResponse.json<ApiResponse<User>>(
        {
          success: false,
          error: 'Name and age are required',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        age: parseInt(age),
        email: `${name.toLowerCase().replace(/\s+/g, '')}@demo.com`,
      },
    });

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json<ApiResponse<User>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

