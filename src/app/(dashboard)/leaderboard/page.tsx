'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry } from '@/types/learning';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<(LeaderboardEntry & { name?: string; avatar?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard/get')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaderboard(data.data || []);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🏆 Reyting</h1>

        <Card>
          <CardHeader>
            <CardTitle>Eng yaxshi o'quvchilar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index < 3 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold w-12 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{entry.name || 'Foydalanuvchi'}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">⭐ {entry.stars}</Badge>
                        <Badge variant="outline">{entry.score} ball</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">O'rin</p>
                    <p className="text-xl font-bold">{entry.rank}</p>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-center text-gray-600 py-8">
                  Hozircha reytingda hech kim yo'q
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

