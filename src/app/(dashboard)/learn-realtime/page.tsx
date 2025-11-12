'use client';

import { useState, useEffect } from 'react';
import { RealtimeMicButton } from '@/components/realtime/RealtimeMicButton';
import { Card, CardContent } from '@/components/ui/card';

export default function LearnRealtimePage() {
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<Array<{ text: string; type: 'ai' | 'user' }>>([]);
  const [exampleWords, setExampleWords] = useState<string[]>([]);
  const [exampleImages, setExampleImages] = useState<string[]>([]);
  const [childName, setChildName] = useState<string>('');

  useEffect(() => {
    // localStorage dan ma'lumotlarni olish
    const name = localStorage.getItem('bolajon_child_name') || 'Bola';
    setChildName(name);
    
    // Boshlang'ich AI xabari
    setAiMessages([
      {
        text: `Salom ${name}! Men sizga harflarni o'rgatishga yordam beraman. Keling, boshlaymiz!`,
        type: 'ai',
      },
    ]);
    setCurrentLetter('A');
    setExampleWords(['Anor', 'Olma', 'Archa']);
  }, []);

  const handleTranscript = (text: string) => {
    setAiMessages((prev) => [...prev, { text, type: 'user' }]);
    // AI javobini simulyatsiya qilish
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          text: `Ajoyib! Siz "${text}" dedingiz. Bu ${currentLetter || 'A'} harfi bilan boshlanadi.`,
          type: 'ai',
        },
      ]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Harf ko'rinishi */}
      {currentLetter && (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="text-9xl font-bold text-blue-600 mb-4">{currentLetter}</div>
            <p className="text-2xl text-gray-700">Bu {currentLetter} harfi</p>
          </div>

          {/* So'zlar va rasmlar */}
          {exampleWords.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {exampleWords.map((word, idx) => (
                <Card key={idx} className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-2">{word}</div>
                    {exampleImages[idx] && (
                      <img
                        src={exampleImages[idx]}
                        alt={word}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* AI suhbat xabarlari */}
          {aiMessages.length > 0 && (
            <div className="max-w-2xl mx-auto mb-8 space-y-2">
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    msg.type === 'ai'
                      ? 'bg-blue-100 text-blue-900 ml-auto'
                      : 'bg-gray-100 text-gray-900 mr-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Markazda dumaloq mikrofonga tugma */}
      <RealtimeMicButton
        onTranscript={handleTranscript}
        onStart={() => {
          setCurrentLetter('A');
          setExampleWords(['Anor', 'Olma', 'Archa']);
          setExampleImages([
            'https://cdn.example.com/images/alphabet/anor.png',
            'https://cdn.example.com/images/alphabet/olma.png',
            'https://cdn.example.com/images/alphabet/archa.png',
          ]);
        }}
      />
    </div>
  );
}

