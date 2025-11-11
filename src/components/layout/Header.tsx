'use client';

import Link from 'next/link';
import { useUserStore } from '@/store/user-store';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import { StarsDisplay } from '@/components/gamification/StarsDisplay';

export function Header() {
  const { user } = useUserStore();

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            🇺🇿 O'zbek Alifbosi
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <StarsDisplay stars={user.totalStars} size="sm" />
                <LevelBadge level={user.currentLevel} />
                <Link
                  href="/profile"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  {user.name}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

