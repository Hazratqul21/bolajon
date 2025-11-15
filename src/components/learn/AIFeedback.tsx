'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AIFeedback } from '@/types/api';

interface AIFeedbackProps {
  feedback: AIFeedback;
}

export function AIFeedbackComponent({ feedback }: AIFeedbackProps) {
  return (
    <Card className={`w-full max-w-md mx-auto ${
      feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {feedback.isCorrect ? '✅' : '⚠️'}
          <span>{feedback.isCorrect ? 'Ajoyib!' : 'Yana bir bor urinib ko\'ring'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Aniqlik:</span>
          <Badge variant={feedback.accuracy >= 80 ? 'default' : 'secondary'}>
            {feedback.accuracy}%
          </Badge>
        </div>
        <div className="text-gray-700">
          <p className="font-medium mb-2">Tavsiya:</p>
          <p>{feedback.feedback}</p>
        </div>
        {feedback.mistakes && feedback.mistakes.length > 0 && (
          <div className="text-gray-700">
            <p className="font-medium mb-2">Xatolar:</p>
            <ul className="list-disc list-inside space-y-1">
              {feedback.mistakes.map((mistake, index) => (
                <li key={index}>{mistake}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-blue-800 font-medium">💪 {feedback.encouragement}</p>
        </div>
      </CardContent>
    </Card>
  );
}

