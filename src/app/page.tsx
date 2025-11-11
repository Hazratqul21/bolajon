import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">
          🇺🇿 O'zbek Alifbosi
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          4-7 yoshli bolalar uchun AI yordamida o'zbek alifbosini o'rganish
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Boshlash
            </Button>
          </Link>
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
            <CardTitle>Ovozli O'qish</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              AI yordamida talaffuzni yaxshilash va real-time feedback olish
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
  );
}

