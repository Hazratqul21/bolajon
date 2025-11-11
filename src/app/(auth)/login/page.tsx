'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/user-store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        name,
        age,
        redirect: false,
      });

      if (result?.ok) {
        // Fetch user data and set in store
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
        router.push('/learn');
      } else {
        alert('Kirishda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Kirish</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Ism
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Ismingizni kiriting"
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-2">
                Yosh
              </label>
              <input
                id="age"
                type="number"
                min="4"
                max="7"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Yoshingizni kiriting"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Kutilmoqda...' : 'Kirish'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

