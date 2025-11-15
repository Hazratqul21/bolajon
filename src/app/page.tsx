'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // localStorage'ni tekshirish - agar foydalanuvchi allaqachon login qilgan bo'lsa, onboarding ko'rsatilmasin
  useEffect(() => {
    setMounted(true);
    
    // Agar foydalanuvchi allaqachon login qilgan bo'lsa (Gmail orqali)
    const childName = localStorage.getItem('bolajon_child_name');
    const childEmail = localStorage.getItem('bolajon_child_email');
    
    // Agar ism va email bo'lsa, onboarding ko'rsatilmasin
    if (childName && childEmail) {
      setHasLoggedIn(true);
      setShowOnboarding(false);
    }
  }, []);

  interface OnboardingData {
    firstName: string;
    age: number;
    preferences?: string[];
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setIsLoading(true);
    setError(null);

    try {
      let guardianId = '00000000-0000-0000-0000-000000000000';
      
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

      const preferencesDict = data.preferences && data.preferences.length > 0
        ? { interests: data.preferences }
        : {};
      
      const response = await fetch('http://localhost:8000/api/auth/child/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: data.firstName,
          nickname: data.firstName,
          age: data.age,
          guardian_id: guardianId,
          preferences: preferencesDict,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('bolajon_child_id', result.child_id);
        localStorage.setItem('bolajon_child_name', data.firstName);
        localStorage.setItem('bolajon_child_age', String(data.age));
        if (data.preferences && data.preferences.length > 0) {
          localStorage.setItem('bolajon_child_preferences', JSON.stringify(data.preferences));
        }
        router.push('/learn-realtime');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Server xatosi' }));
        let errorMessage = 'Xatolik yuz berdi';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err: any) => {
                if (typeof err === 'object' && err.msg) {
                  return err.msg;
                }
                return String(err);
              })
              .join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = String(errorData.detail);
          }
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setError('Backend ulanmadi. Demo rejimda davom etamiz...');
      localStorage.setItem('bolajon_child_name', data.firstName);
      localStorage.setItem('bolajon_child_age', String(data.age));
      if (data.preferences && data.preferences.length > 0) {
        localStorage.setItem('bolajon_child_preferences', JSON.stringify(data.preferences));
      }
      
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
            <div className="flex gap-4 justify-center items-center">
              {mounted && !hasLoggedIn && (
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowOnboarding(true)}
                >
                  Boshlash
                </Button>
              )}
              <Link href="/learn">
                <Button size="lg" variant="outline">
                  Demo ko'rish
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="relative group"
                >
                  <span className="text-2xl">👤</span>
                  <span className="ml-2 hidden sm:inline">Profil</span>
                  {/* Badge icon */}
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white">
                    ⭐
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Link href="/chat">
              <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
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
            </Link>
            <Link href="/learn-realtime">
              <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-3xl mb-2">📚</CardTitle>
                  <CardTitle>O'rganish</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Harflarni o'rganish va mashq qilish
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/gamification">
              <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-3xl mb-2">⭐</CardTitle>
                  <CardTitle>Gamifikatsiya</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Yulduzlar, darajalar va yutuqlar bilan o'rganishni qiziqarli qilish
                  </p>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <span className="text-2xl">⭐</span>
                    <span className="text-2xl">⭐</span>
                    <span className="text-2xl">⭐</span>
                    <span className="text-sm font-bold">+5 yulduz</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

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

