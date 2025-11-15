'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Letter } from '@/data/alphabet';

interface LetterCardProps {
  letter: Letter;
  isActive?: boolean;
  onClick?: () => void;
}

export function LetterCard({ letter, isActive = false, onClick }: LetterCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-300 ${
        isActive
          ? 'bg-blue-500 text-white scale-110 shadow-lg'
          : 'bg-white hover:bg-blue-50 hover:scale-105'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-8 text-center">
        <div className="text-6xl font-bold mb-2">{letter.letter}</div>
        <div className={`text-lg ${isActive ? 'text-blue-100' : 'text-gray-600'}`}>
          {letter.name}
        </div>
      </CardContent>
    </Card>
  );
}

