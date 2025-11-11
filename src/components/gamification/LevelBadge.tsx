'use client';

import { Badge } from '@/components/ui/badge';

interface LevelBadgeProps {
  level: number;
  maxLevel?: number;
}

export function LevelBadge({ level, maxLevel = 33 }: LevelBadgeProps) {
  return (
    <Badge className="bg-purple-500 text-white px-4 py-2 text-lg">
      🏆 Daraja {level} / {maxLevel}
    </Badge>
  );
}

