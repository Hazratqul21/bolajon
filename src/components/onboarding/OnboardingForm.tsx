'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OnboardingFormProps {
  onComplete: (data: { firstName: string; age: number; preferences?: any }) => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [preferences, setPreferences] = useState<any>({});

  const handleNext = () => {
    if (step === 1 && firstName && age) {
      setStep(2);
    } else if (step === 2) {
      onComplete({ firstName, age: Number(age), preferences });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1 ? '👋 Salom!' : '🎨 Qiziqishlaringiz'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Ismingiz nima?</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masalan: Alisher"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Yoshingiz nechada?</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Masalan: 5"
                  min="3"
                  max="10"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Qanday narsalar sizga yoqadi? (Ixtiyoriy)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['Hayvonlar', 'Mashinalar', 'Ranglar', 'Musiqa', 'Kitoblar', 'O\'yinlar'].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setPreferences((prev: any) => ({
                        ...prev,
                        [item]: !prev[item],
                      }))
                    }
                    className={`p-3 rounded-lg border-2 transition-all ${
                      preferences[item]
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={step === 1 && (!firstName || !age)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {step === 1 ? 'Keyingi' : 'Boshlash'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

