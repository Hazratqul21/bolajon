'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Agar foydalanuvchi allaqachon login qilgan bo'lsa, profilga yuborish
  useEffect(() => {
    setMounted(true);
    
    const childName = localStorage.getItem('bolajon_child_name');
    const childEmail = localStorage.getItem('bolajon_child_email');
    
    // Agar ism va email bo'lsa, to'g'ridan-to'g'ri profilga yuborish
    if (childName && childEmail) {
      router.push('/profile');
    }
  }, [router]);

  const handleGmailLogin = async () => {
    if (!email || !email.includes('@gmail.com')) {
      setError('Iltimos, to\'g\'ri Gmail manzilini kiriting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Gmail orqali kirish (demo)
      // Haqiqiy loyihada Google OAuth ishlatiladi
      console.log('Gmail login:', email);
      
      // localStorage'ga saqlash
      // Email'dan ism olish (masalan: john.doe@gmail.com -> John Doe)
      const emailParts = email.split('@')[0].split('.');
      const name = emailParts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') || email.split('@')[0];
      
      localStorage.setItem('bolajon_child_name', name);
      localStorage.setItem('bolajon_child_email', email);
      
      // Profilga o'tish
      setTimeout(() => {
        router.push('/profile');
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError('Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    // Google OAuth demo (haqiqiy loyihada Google OAuth ishlatiladi)
    window.open('https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=email profile', '_blank');
    
    // Demo uchun
    alert('Google OAuth demo. Haqiqiy loyihada Google OAuth integratsiyasi qo\'shiladi.');
  };

  // Agar hali mount bo'lmagan bo'lsa yoki redirect qilinmoqda bo'lsa, loading ko'rsatish
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-gray-800 mb-2">
              🇺🇿 Bolajon
            </CardTitle>
            <p className="text-gray-600">
              Profilga kirish
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gmail Login */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Gmail Manzili
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleGmailLogin();
                  }
                }}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <Button
              onClick={handleGmailLogin}
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {loading ? '⏳ Kutilmoqda...' : '📧 Gmail orqali kirish'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">yoki</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <Button
              onClick={handleGoogleOAuth}
              variant="outline"
              className="w-full py-3 text-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              <span className="mr-2">🔐</span>
              Google orqali kirish (OAuth)
            </Button>

            {/* Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                💡 <strong>Eslatma:</strong> Hozircha demo rejimda ishlaydi. Haqiqiy loyihada Google OAuth integratsiyasi qo'shiladi.
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                ← Asosiy sahifaga qaytish
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
