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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  interface OnboardingData {
    firstName: string;
    age: number;
    preferences?: string[];
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Avval guardian yaratish yoki olish
      let guardianId = '00000000-0000-0000-0000-000000000000';
      
      // Guardian yaratish (temporary)
      try {
        const guardianResponse = await fetch('http://localhost:8000/api/auth/guardian/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `temp-${Date.now()}@bolajon.local`,
            first_name: 'Temp Guardian',
            phone: null,
          }),
        });

        if (guardianResponse.ok) {
          const guardianResult = await guardianResponse.json();
          guardianId = guardianResult.guardian_id;
        }
      } catch (guardianError) {
        console.warn('Guardian yaratishda xatolik, default ID ishlatilmoqda:', guardianError);
      }

      // Child onboarding
      const response = await fetch('http://localhost:8000/api/auth/child/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: data.firstName,
          nickname: data.firstName,
          age: data.age,
          guardian_id: guardianId,
          preferences: data.preferences || {},
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Ma'lumotlarni localStorage ga saqlash
        localStorage.setItem('bolajon_child_id', result.child_id);
        localStorage.setItem('bolajon_child_name', data.firstName);
        localStorage.setItem('bolajon_child_age', String(data.age));
        
        // Real-time learn page ga o'tish
        router.push('/learn-realtime');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Server xatosi' }));
        setError(errorData.detail || 'Xatolik yuz berdi');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      // Backend ishlamasa ham, to'g'ridan-to'g'ri learn page ga o'tish
      setError('Backend ulanmadi. Demo rejimda davom etamiz...');
      localStorage.setItem('bolajon_child_name', data.firstName);
      localStorage.setItem('bolajon_child_age', String(data.age));
      
      setTimeout(() => {
        router.push('/learn-realtime');
      }, 1500);
    }
  };

  return (
    <>
      {showOnboarding ? (
        <>
          <OnboardingForm onComplete={handleOnboardingComplete} />
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <p className="text-lg">Yuklanmoqda...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
              {error}
            </div>
          )}
        </>
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
