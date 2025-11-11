'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Word } from '@/data/alphabet';

interface WordPracticeProps {
  word: Word;
  onPlayAudio?: () => void;
  onRecord?: () => void;
  isRecording?: boolean;
}

export function WordPractice({ word, onPlayAudio, onRecord, isRecording = false }: WordPracticeProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl text-center">{word.word}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-gray-600 text-lg">
          {word.translation}
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onPlayAudio}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            🔊 Tinglash
          </Button>
          <Button
            onClick={onRecord}
            size="lg"
            className={`${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isRecording ? '⏹️ To\'xtatish' : '🎤 Yozib olish'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

