'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { textToSpeech } from '@/lib/muxlisa-client';

export default function LearnPage() {
  const [currentLetter, setCurrentLetter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{ letter: string; options: string[]; correct: number } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);
  const [micDemoActive, setMicDemoActive] = useState(false);
  const [micTranscript, setMicTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [progressDemo, setProgressDemo] = useState(0);
  const [starsDemo, setStarsDemo] = useState(0);
  const [levelDemo, setLevelDemo] = useState(1);
  
  const alphabet = [
    { letter: 'A', word: 'Anor', image: '🍎', color: 'from-red-400 to-red-600' },
    { letter: 'B', word: 'Bola', image: '👶', color: 'from-blue-400 to-blue-600' },
    { letter: 'D', word: 'Daraxt', image: '🌳', color: 'from-green-400 to-green-600' },
    { letter: 'E', word: 'Eshak', image: '🫏', color: 'from-gray-400 to-gray-600' },
    { letter: 'F', word: 'Futbol', image: '⚽', color: 'from-yellow-400 to-yellow-600' },
    { letter: 'G', word: 'Gul', image: '🌺', color: 'from-pink-400 to-pink-600' },
    { letter: 'H', word: 'Havo', image: '☁️', color: 'from-sky-400 to-sky-600' },
    { letter: 'I', word: 'It', image: '🐕', color: 'from-amber-400 to-amber-600' },
    { letter: 'J', word: 'Javob', image: '💬', color: 'from-indigo-400 to-indigo-600' },
    { letter: 'K', word: 'Kitob', image: '📖', color: 'from-purple-400 to-purple-600' },
    { letter: 'L', word: 'Lola', image: '🌷', color: 'from-rose-400 to-rose-600' },
    { letter: 'M', word: 'Mashina', image: '🚗', color: 'from-blue-500 to-cyan-500' },
    { letter: 'N', word: 'Non', image: '🍞', color: 'from-yellow-500 to-orange-500' },
    { letter: 'O', word: 'Olma', image: '🍏', color: 'from-green-500 to-emerald-500' },
    { letter: 'P', word: 'Poy', image: '🌲', color: 'from-green-600 to-teal-600' },
    { letter: 'Q', word: 'Qush', image: '🐦', color: 'from-blue-400 to-indigo-400' },
    { letter: 'R', word: 'Rang', image: '🌈', color: 'from-pink-500 via-purple-500 to-blue-500' },
    { letter: 'S', word: 'Suv', image: '💧', color: 'from-cyan-400 to-blue-400' },
    { letter: 'T', word: 'Tosh', image: '🪨', color: 'from-gray-500 to-slate-500' },
    { letter: 'U', word: 'Uy', image: '🏠', color: 'from-orange-400 to-red-400' },
    { letter: 'V', word: 'Vilka', image: '🍴', color: 'from-silver-400 to-gray-400' },
    { letter: 'X', word: 'Xona', image: '🚪', color: 'from-brown-400 to-amber-400' },
    { letter: 'Y', word: 'Yoz', image: '☀️', color: 'from-yellow-400 to-orange-400' },
    { letter: 'Z', word: 'Zar', image: '💎', color: 'from-cyan-500 to-blue-500' },
  ];

  const screenshots = [
    {
      title: 'O\'rganish Sahifasi',
      description: 'Harflarni o\'rganish va mashq qilish',
      emoji: '📚',
      color: 'from-blue-500 to-purple-500',
      features: ['29 ta harf', '100+ so\'z', 'AI yordamchi', 'Progress tracking'],
    },
    {
      title: 'AI Suhbat',
      description: 'AI bilan real-time gaplashish',
      emoji: '🤖',
      color: 'from-green-500 to-teal-500',
      features: ['Real-time chat', 'Ovozli muloqot', 'Kontekstni tushunish', 'O\'zbek tili'],
    },
    {
      title: 'Profil',
      description: 'Progress va statistika',
      emoji: '👤',
      color: 'from-orange-500 to-red-500',
      features: ['O\'rganilgan harflar', 'Yutuqlar', 'Statistika', 'Profil sozlash'],
    },
    {
      title: 'Gamifikatsiya',
      description: 'Yulduzlar, darajalar va yutuqlar',
      emoji: '⭐',
      color: 'from-yellow-500 to-orange-500',
      features: ['Yulduzlar', 'XP va darajalar', 'Yutuqlar', 'Liderboard'],
    },
    {
      title: 'Mikrofon Demo',
      description: 'Ovozli talaffuz mashqlari',
      emoji: '🎤',
      color: 'from-pink-500 to-rose-500',
      features: ['Real-time STT', 'AI feedback', 'Talaffuz tahlili', 'Muxlisa AI'],
    },
  ];

  const gameQuestions = [
    { letter: 'A', options: ['Anor', 'Bola', 'Daraxt'], correct: 0 },
    { letter: 'B', options: ['Anor', 'Bola', 'Eshak'], correct: 1 },
    { letter: 'D', options: ['Bola', 'Daraxt', 'Futbol'], correct: 1 },
    { letter: 'E', options: ['Eshak', 'Anor', 'Bola'], correct: 0 },
    { letter: 'F', options: ['Futbol', 'Daraxt', 'Anor'], correct: 0 },
  ];

  const features = [
    {
      icon: '🎤',
      title: 'Ovozli Muloqot',
      description: 'Mikrofon orqali gapiring, AI sizga javob beradi',
      demo: 'Mikrofonni bosing va gapiring!',
    },
    {
      icon: '🤖',
      title: 'AI Yordamchi',
      description: 'Harflarni o\'rganishda AI sizga yordam beradi',
      demo: 'AI sizga harflarni tushuntirib beradi',
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'O\'rganilgan harflarni kuzatib boring',
      demo: 'Har bir harf uchun progress ko\'rsatiladi',
    },
    {
      icon: '🎨',
      title: 'Qiziqishlarga Mos',
      description: 'Sizning qiziqishlaringizga mos so\'zlar',
      demo: 'Hayvonlar, mashinalar, ranglar va boshqalar',
    },
  ];

  const handlePlayLetter = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const current = alphabet[currentLetter];
    const text = `${current.letter} harfi. ${current.word}. ${current.word} ${current.letter} harfi bilan boshlanadi.`;
    
    try {
      await textToSpeech(text, 'maftuna');
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const startGame = () => {
    setGameActive(true);
    setGameScore(0);
    setSelectedOption(null);
    setShowResult(false);
    generateQuestion();
  };

  const generateQuestion = () => {
    const randomQuestion = gameQuestions[Math.floor(Math.random() * gameQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedOption(index);
    setShowResult(true);
    
    if (index === currentQuestion?.correct) {
      setGameScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (gameScore < 4) {
        generateQuestion();
      } else {
        setGameActive(false);
      }
    }, 2000);
  };

  const startTestMode = () => {
    setIsTestMode(true);
    // Test rejimida localStorage'ga demo ma'lumotlar qo'shamiz
    localStorage.setItem('bolajon_child_name', 'Demo');
    localStorage.setItem('bolajon_child_age', '5');
    localStorage.setItem('bolajon_child_preferences', JSON.stringify(['Hayvonlar', 'Mashinalar']));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLetter((prev) => (prev + 1) % alphabet.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScreenshotIndex((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-pulse">
            🎬 Demo Ko'rish
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Bolajon platformasining imkoniyatlarini ko'rib chiqing
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                ← Orqaga
              </Button>
            </Link>
            {!isTestMode && (
              <Button
                onClick={startTestMode}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
              >
                🧪 Test Rejimi
              </Button>
            )}
            {isTestMode && (
              <div className="flex gap-2 items-center bg-green-100 px-4 py-2 rounded-lg">
                <span className="text-green-600 font-bold">✓ Test Rejimi Faol</span>
                <Link href="/learn-realtime">
                  <Button size="sm" className="bg-green-600 text-white">
                    O'rganishni Boshlash
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Screenshot Carousel */}
        <div className="mb-16">
          <Card className="bg-white shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                📸 Platforma Ko'rinishlari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                {screenshots.map((screenshot, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      idx === screenshotIndex
                        ? 'opacity-100 translate-x-0'
                        : idx < screenshotIndex
                        ? 'opacity-0 -translate-x-full'
                        : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div className={`h-full bg-gradient-to-br ${screenshot.color} flex flex-col items-center justify-center text-white p-8`}>
                      <div className="text-8xl mb-4 animate-bounce">{screenshot.emoji}</div>
                      <h3 className="text-3xl font-bold mb-2">{screenshot.title}</h3>
                      <p className="text-xl opacity-90 mb-4">{screenshot.description}</p>
                      {screenshot.features && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {screenshot.features.map((feature, fIdx) => (
                            <div key={fIdx} className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-sm">
                              ✓ {feature}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {screenshots.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setScreenshotIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === screenshotIndex
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interaktiv Harf Demo */}
        <div className="mb-16">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                📚 Interaktiv Harf Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <div 
                  className={`w-48 h-48 rounded-full bg-gradient-to-br ${alphabet[currentLetter].color} flex items-center justify-center text-8xl mb-6 shadow-2xl transform transition-all duration-500 hover:scale-110 animate-pulse`}
                >
                  {alphabet[currentLetter].letter}
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-4xl font-bold text-gray-800 mb-2 animate-fade-in">
                    {alphabet[currentLetter].word}
                  </h3>
                  <p className="text-2xl mb-4 animate-bounce">
                    {alphabet[currentLetter].image}
                  </p>
                  <p className="text-gray-600 text-lg">
                    {alphabet[currentLetter].letter} harfi bilan boshlanadi
                  </p>
                </div>

                <div className="flex gap-4 mb-6">
                  <Button
                    onClick={() => setCurrentLetter((prev) => (prev - 1 + alphabet.length) % alphabet.length)}
                    variant="outline"
                    size="lg"
                    className="transform hover:scale-110 transition-transform"
                  >
                    ← Oldingi
                  </Button>
                  <Button
                    onClick={handlePlayLetter}
                    disabled={isPlaying}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white transform hover:scale-110 transition-transform"
                    size="lg"
                  >
                    {isPlaying ? '🔊 O\'qilmoqda...' : '🔊 Eshitish'}
                  </Button>
                  <Button
                    onClick={() => setCurrentLetter((prev) => (prev + 1) % alphabet.length)}
                    variant="outline"
                    size="lg"
                    className="transform hover:scale-110 transition-transform"
                  >
                    Keyingi →
                  </Button>
                </div>

                <div className="flex gap-2 mt-4">
                  {alphabet.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentLetter(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === currentLetter
                          ? 'bg-blue-600 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interaktiv O'yin Demo */}
        <div className="mb-16">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                🎮 Mini O'yin Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!gameActive ? (
                <div className="text-center py-8">
                  <p className="text-xl text-gray-600 mb-6">
                    Harfni tanlang va to'g'ri so'zni toping!
                  </p>
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white transform hover:scale-110 transition-transform"
                  >
                    🎮 O'yinni Boshlash
                  </Button>
                  {gameScore > 0 && (
                    <div className="mt-4 text-2xl font-bold text-green-600">
                      Sizning natijangiz: {gameScore} / 5
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8">
                  {currentQuestion && (
                    <>
                      <div className="text-center mb-6">
                        <div className="text-6xl font-bold text-blue-600 mb-4 animate-pulse">
                          {currentQuestion.letter}
                        </div>
                        <p className="text-xl text-gray-600 mb-6">
                          Qaysi so'z {currentQuestion.letter} harfi bilan boshlanadi?
                        </p>
                        <div className="text-2xl font-bold text-green-600 mb-4">
                          Ball: {gameScore} / 5
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentQuestion.options.map((option, idx) => (
                          <Button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={showResult}
                            className={`h-20 text-lg transform transition-all ${
                              showResult && idx === currentQuestion.correct
                                ? 'bg-green-500 text-white scale-110'
                                : showResult && idx === selectedOption && idx !== currentQuestion.correct
                                ? 'bg-red-500 text-white scale-95'
                                : 'bg-blue-100 hover:bg-blue-200 hover:scale-105'
                            }`}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                      {showResult && (
                        <div className="mt-6 text-center">
                          {selectedOption === currentQuestion.correct ? (
                            <p className="text-2xl font-bold text-green-600 animate-bounce">
                              ✅ To'g'ri!
                            </p>
                          ) : (
                            <p className="text-2xl font-bold text-red-600">
                              ❌ Noto'g'ri. To'g'ri javob: {currentQuestion.options[currentQuestion.correct]}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Showcase */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            ✨ Platforma Imkoniyatlari
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
              >
                <CardHeader>
                  <CardTitle className="text-4xl mb-2 animate-bounce">{feature.icon}</CardTitle>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Demo:</strong> {feature.demo}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="py-12">
              <h2 className="text-4xl font-bold mb-4">
                🚀 Boshlashga tayyormisiz?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Ro'yxatdan o'ting va o'rganishni boshlang!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-110 transition-transform"
                  >
                    Boshlash
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-110 transition-transform"
                  >
                    AI Suhbat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            ❓ Tez-tez So'raladigan Savollar
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Bolajon nima?',
                a: 'Bolajon - 4-7 yoshli bolalar uchun AI yordamida o\'zbek alifbosini o\'rgatuvchi interaktiv platforma. Mikrofon, AI yordamchi va qiziqarli o\'yinlar orqali harflarni o\'rganish.',
              },
              {
                q: 'Qanday ishlaydi?',
                a: 'Siz mikrofon orqali gapirasiz, AI sizning talaffuzingizni tahlil qiladi va yaxshilash uchun tavsiyalar beradi. Har bir harf uchun so\'zlar, rasmlar va o\'yinlar mavjud.',
              },
              {
                q: 'Pullikmi?',
                a: 'Hozircha bepul! Barcha funksiyalar - harflarni o\'rganish, AI suhbat, progress tracking - hammasi bepul.',
              },
              {
                q: 'Qaysi yoshdagi bolalar uchun?',
                a: 'Asosan 4-7 yoshdagi bolalar uchun mo\'ljallangan, lekin kattaroq yoki kichikroq bolalar ham foydalanishi mumkin.',
              },
            ].map((faq, idx) => (
              <Card key={idx} className="bg-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            💬 Foydalanuvchilar Fikrlari
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Malika',
                age: 5,
                text: 'Men A harfini o\'rganib oldim! AI juda yaxshi gapiryapti 🎉',
                rating: 5,
              },
              {
                name: 'Jasur',
                age: 6,
                text: 'O\'yinlar juda qiziqarli! Har kuni o\'rganaman ⭐',
                rating: 5,
              },
              {
                name: 'Dilshoda',
                age: 7,
                text: 'Mikrofon orqali gapirish juda qiziq! AI meni tushunadi 🤖',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="bg-white transform hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.age} yosh</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{testimonial.text}</p>
                  <div className="flex">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">⭐</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🎯 Qanday Ishlaydi?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Ro\'yxatdan o\'ting', icon: '📝', desc: 'Ism, yosh va qiziqishlarni kiriting' },
              { step: 2, title: 'Harfni tanlang', icon: '🔤', desc: 'O\'zbek alifbosidagi har bir harfni tanlang' },
              { step: 3, title: 'Gapiring va o\'rganing', icon: '🎤', desc: 'Mikrofon orqali gapiring, AI yordam beradi' },
              { step: 4, title: 'Progress kuzating', icon: '📊', desc: 'O\'rganilgan harflarni va natijalarni ko\'ring' },
            ].map((item, idx) => (
              <Card key={idx} className="bg-white text-center">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          <Card className="bg-white transform hover:scale-105 transition-transform">
            <CardContent className="py-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">29</div>
              <div className="text-gray-600">Harflar</div>
            </CardContent>
          </Card>
          <Card className="bg-white transform hover:scale-105 transition-transform">
            <CardContent className="py-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
              <div className="text-gray-600">So'zlar</div>
            </CardContent>
          </Card>
          <Card className="bg-white transform hover:scale-105 transition-transform">
            <CardContent className="py-6">
              <div className="text-4xl font-bold text-green-600 mb-2">AI</div>
              <div className="text-gray-600">Yordamchi</div>
            </CardContent>
          </Card>
        </div>

        {/* Mikrofon Demo */}
        <div className="mb-16">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                🎤 Mikrofon Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {!micDemoActive ? (
                  <>
                    <div className="text-6xl mb-6">🎙️</div>
                    <p className="text-xl text-gray-600 mb-6">
                      Mikrofon orqali gapiring va AI sizga javob beradi!
                    </p>
                    <Button
                      onClick={() => {
                        setMicDemoActive(true);
                        setTimeout(() => {
                          setMicTranscript('Salom, men A harfini o\'rganmoqchiman');
                          setTimeout(() => {
                            setAiResponse('Ajoyib! A harfi bilan boshlanadigan so\'zlar: Anor, Archa, Avtobus. Keling, ularni birga o\'rganamiz!');
                            setMicDemoActive(false);
                          }, 2000);
                        }, 1500);
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-rose-500 text-white transform hover:scale-110 transition-transform"
                    >
                      🎤 Mikrofoni Boshlash
                    </Button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                        <span className="text-3xl text-white">🎤</span>
                      </div>
                      <div className="text-xl font-bold text-gray-700">
                        Yozib olinmoqda...
                      </div>
                    </div>
                    {micTranscript && (
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-gray-700 text-lg">
                          <strong>👤 Siz:</strong> {micTranscript}
                        </p>
                      </div>
                    )}
                    {aiResponse && (
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <p className="text-gray-700 text-lg">
                          <strong>🤖 AI:</strong> {aiResponse}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracking Demo */}
        <div className="mb-16">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                📊 Progress Tracking Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{progressDemo}%</div>
                    <div className="text-gray-600">Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressDemo}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">⭐ {starsDemo}</div>
                    <div className="text-gray-600">Yulduzlar</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">Level {levelDemo}</div>
                    <div className="text-gray-600">Daraja</div>
                  </div>
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => {
                      if (progressDemo < 100) {
                        setProgressDemo(prev => Math.min(prev + 10, 100));
                        setStarsDemo(prev => prev + 5);
                        if (progressDemo >= 90) {
                          setLevelDemo(prev => prev + 1);
                        }
                      } else {
                        setProgressDemo(0);
                        setStarsDemo(0);
                        setLevelDemo(1);
                      }
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  >
                    {progressDemo < 100 ? '📈 Progressni Oshirish' : '🔄 Qayta Boshlash'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gamification Demo */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                ⭐ Gamifikatsiya Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { id: 'first_letter', title: 'Birinchi Harf', icon: '🎯', unlocked: true },
                  { id: 'five_letters', title: '5 ta Harf', icon: '⭐', unlocked: true },
                  { id: 'ten_letters', title: '10 ta Harf', icon: '🌟', unlocked: false },
                  { id: 'all_letters', title: 'Alifbo Ustasi', icon: '👑', unlocked: false },
                ].map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg text-center transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400 shadow-lg'
                        : 'bg-gray-100 opacity-60'
                    }`}
                  >
                    <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="font-bold text-sm">{achievement.title}</div>
                    {achievement.unlocked ? (
                      <div className="text-green-600 text-xs mt-1">✓ Qo'lga kiritildi</div>
                    ) : (
                      <div className="text-gray-400 text-xs mt-1">🔒 Qulflangan</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Chat Demo */}
        <div className="mb-16">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                💬 AI Chat Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm flex-1">
                    <p className="text-gray-700">
                      Salom! Men sizga harflarni o'rgatishga yordam beraman. Qaysi harfni o'rganmoqchisiz?
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    Siz
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg shadow-sm flex-1">
                    <p className="text-gray-700">
                      A harfini o'rganmoqchiman
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm flex-1">
                    <p className="text-gray-700">
                      Ajoyib! A harfi bilan boshlanadigan so'zlar: <strong>Anor</strong>, <strong>Archa</strong>, <strong>Avtobus</strong>. Keling, ularni birga o'rganamiz! 🎉
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Xabar yozing..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
                <Button disabled className="bg-blue-600 text-white">
                  Yuborish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Counter Demo */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-lg">
                  <strong>{Math.floor(Math.random() * 50) + 20}</strong> foydalanuvchi hozir o'rganmoqda
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
