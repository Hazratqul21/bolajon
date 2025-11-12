'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  const handleOnboardingComplete = async (data: { firstName: string; age: number; preferences?: any }) => {
    // Backend ga child onboarding request yuborish
    try {
      const response = await fetch('http://localhost:8000/api/auth/child/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: data.firstName,
          nickname: data.firstName,
          age: data.age,
          guardian_id: '00000000-0000-0000-0000-000000000000', // Temporary, keyinchalik guardian auth qo'shiladi
          preferences: data.preferences,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Real-time learn page ga o'tish
        router.push('/learn-realtime');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  return (
    <>
      {showOnboarding ? (
        <OnboardingForm onComplete={handleOnboardingComplete} />
      ) : (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-blue-600 mb-4">
              🇺🇿 Bolajon
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              4-7 yoshli bolalar uchun AI yordamida o'zbek alifbosini o'rganish
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowOnboarding(true)}
              >
                Boshlash
              </Button>
              <Link href="/learn">
                <Button size="lg" variant="outline">
                  Demo ko'rish
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl mb-2">🎤</CardTitle>
                <CardTitle>Real-time AI Suhbat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  AI bilan real-time gaplashib harflarni o'rganish, ChatGPT kabi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl mb-2">⭐</CardTitle>
                <CardTitle>Gamifikatsiya</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yulduzlar, darajalar va yutuqlar bilan o'rganishni qiziqarli qilish
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl mb-2">📊</CardTitle>
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Har bir harf va so'z uchun batafsil progress kuzatish
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
