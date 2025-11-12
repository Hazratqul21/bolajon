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
    if (!text.trim()) return;
    
    setAiMessages((prev) => [...prev, { text, type: 'user' }]);
    
    // AI javobini simulyatsiya qilish (backend ishlamasa)
    setTimeout(() => {
      const letter = currentLetter || 'A';
      const response = text.toLowerCase().includes(letter.toLowerCase())
        ? `Ajoyib! Siz "${text}" dedingiz. Bu ${letter} harfi bilan boshlanadi!`
        : `Yaxshi! Siz "${text}" dedingiz. Keling, ${letter} harfini takrorlaymiz.`;
      
      setAiMessages((prev) => [
        ...prev,
        {
          text: response,
          type: 'ai',
        },
      ]);
    }, 500);
  };
  
  const handleNextLetter = () => {
    const letters = ['A', 'O', 'L', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'];
    const currentIndex = letters.indexOf(currentLetter || 'A');
    const nextIndex = (currentIndex + 1) % letters.length;
    const nextLetter = letters[nextIndex];
    
    setCurrentLetter(nextLetter);
    setExampleWords(getExampleWords(nextLetter));
    setAiMessages((prev) => [
      ...prev,
      {
        text: `Endi ${nextLetter} harfini o'rganamiz!`,
        type: 'ai',
      },
    ]);
  };
  
  const getExampleWords = (letter: string): string[] => {
    const examples: Record<string, string[]> = {
      'A': ['Anor', 'Olma', 'Archa'],
      'O': ['Olma', 'O\'q', 'O\'t'],
      'L': ['Lola', 'Limon', 'Lak'],
      'B': ['Bola', 'Bosh', 'Bog\''],
      'D': ['Daraxt', 'Dost', 'Dars'],
    };
    return examples[letter] || [`${letter} so'z 1`, `${letter} so'z 2`, `${letter} so'z 3`];
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
            <div className="max-w-2xl mx-auto mb-8 space-y-2 max-h-64 overflow-y-auto">
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

          {/* Keyingi harf tugmasi */}
          <div className="text-center">
            <button
              onClick={handleNextLetter}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
            >
              Keyingi harf →
            </button>
          </div>
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

