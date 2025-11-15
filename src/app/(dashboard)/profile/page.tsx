'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/gamification/ProgressBar';
import { StarsDisplay } from '@/components/gamification/StarsDisplay';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import type { Progress } from '@/types/learning';

export default function ProfilePage() {
  const { user } = useUserStore();
  const [progress, setProgress] = useState<Progress[]>([]);

  useEffect(() => {
    if (user) {
      // Fetch user progress
      fetch(`/api/progress?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProgress(data.data || []);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Iltimos, avval tizimga kiring</p>
      </div>
    );
  }

  const completedLetters = progress.filter((p) => p.completedAt !== null).length;
  const totalAccuracy = progress.length > 0
    ? progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">👤 Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">Yosh: {user.age}</p>
            </div>
            <div className="flex items-center gap-4">
              <LevelBadge level={user.currentLevel} />
              <StarsDisplay stars={user.totalStars} size="md" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Umumiy ball</p>
                <p className="text-2xl font-bold">{user.totalScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Yakunlangan harflar</p>
                <p className="text-2xl font-bold">{completedLetters} / 33</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressBar
              current={completedLetters}
              total={33}
              label="Yakunlangan harflar"
            />
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">O'rtacha aniqlik</p>
              <p className="text-2xl font-bold">{totalAccuracy.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

