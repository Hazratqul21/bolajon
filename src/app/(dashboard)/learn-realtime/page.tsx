'use client';

import { useState, useEffect, useRef } from 'react';
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

  const lastTranscriptRef = useRef<string>('');
  const lastTranscriptTimeRef = useRef<number>(0);

  const handleTranscript = (text: string) => {
    // Bo'sh xabarlarni filter qilish
    if (!text || !text.trim()) return;
    
    // Takrorlanishni oldini olish (bir xil xabar 3 sekund ichida)
    const now = Date.now();
    if (text === lastTranscriptRef.current && (now - lastTranscriptTimeRef.current) < 3000) {
      return;
    }
    
    lastTranscriptRef.current = text;
    lastTranscriptTimeRef.current = now;
    
    // AI xabarlarini filter qilish (backend dan kelgan bo'sh xabarlar)
    if (text.includes("Siz '' dedingiz") || 
        text.includes("Salom! Men sizga") ||
        text.trim().length < 2) {
      return;
    }
    
    // Faqat qisqa va aniq xabarlarni qabul qilish
    if (text.length > 100) {
      return; // Uzun xabarlarni e'tiborsiz qoldirish
    }
    
    setAiMessages((prev) => {
      // Oxirgi 30 ta xabarni saqlash (cheksiz o'sishni oldini olish)
      const newMessages = [...prev, { text, type: 'user' as const }];
      return newMessages.slice(-30);
    });
    
    // AI javobini simulyatsiya qilish (backend ishlamasa)
    setTimeout(() => {
      const letter = currentLetter || 'A';
      const textLower = text.toLowerCase().trim();
      const letterLower = letter.toLowerCase();
      const exampleWords = getExampleWords(letter);
      
      // So'zni tekshirish - harfdan boshlanadigan so'z aytilganmi?
      const words = textLower.split(/\s+/);
      const startsWithLetter = words.some(word => {
        // To'g'ridan-to'g'ri harf bilan boshlanish
        if (word.startsWith(letterLower)) return true;
        
        // Maxsus harflar uchun (O', G', Sh, Ch, Ng)
        if (letter === "O'" && word.startsWith("o'")) return true;
        if (letter === "G'" && word.startsWith("g'")) return true;
        if (letter === "Sh" && word.startsWith("sh")) return true;
        if (letter === "Ch" && word.startsWith("ch")) return true;
        if (letter === "Ng" && word.includes("ng")) return true;
        
        // Misol so'zlardan birini aytganmi?
        return exampleWords.some(exWord => 
          word.includes(exWord.toLowerCase())
        );
      });
      
      let response = '';
      
      if (startsWithLetter) {
        // To'g'ri!
        response = `Ajoyib! 🎉 Siz "${text}" dedingiz. Bu ${letter} harfi bilan boshlanadi!`;
      } else {
        // Noto'g'ri - qanday qilishni tushuntirish
        const randomExample = exampleWords[Math.floor(Math.random() * exampleWords.length)];
        response = `Hmm, "${text}" ${letter} harfi bilan boshlanmaydi. 😊\n\n` +
                  `Keling, ${letter} harfini takrorlaymiz!\n\n` +
                  `Misol: "${randomExample}" - bu ${letter} harfi bilan boshlanadi.\n\n` +
                  `Yana bir bor gapiring: "${randomExample}"`;
      }
      
      setAiMessages((prev) => {
        const newMessages = [...prev, { text: response, type: 'ai' as const }];
        return newMessages.slice(-30);
      });
    }, 500);
  };
  
  const handleNextLetter = () => {
    // O'zbek alifbosi to'g'ri tartibi
    const letters = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'];
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
  
  const handlePreviousLetter = () => {
    // O'zbek alifbosi to'g'ri tartibi
    const letters = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'];
    const currentIndex = letters.indexOf(currentLetter || 'A');
    const prevIndex = currentIndex === 0 ? letters.length - 1 : currentIndex - 1;
    const prevLetter = letters[prevIndex];
    
    setCurrentLetter(prevLetter);
    setExampleWords(getExampleWords(prevLetter));
    setAiMessages((prev) => [
      ...prev,
      {
        text: `Oldingi ${prevLetter} harfini ko'rib chiqamiz!`,
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
      'E': ['Eshik', 'Elak', 'Eshak'],
      'F': ['Futbol', 'Fayl', 'Fen'],
      'G': ['Gul', 'Gap', 'G\'isht'],
      'H': ['Havo', 'Hona', 'Hovli'],
      'I': ['Ish', 'It', 'Ikki'],
      'J': ['Javob', 'Juda', 'Juma'],
      'K': ['Kitob', 'Kuch', 'Kun'],
      'M': ['Mashina', 'Maktab', 'Mushuk'],
      'N': ['Non', 'Nar', 'Nima'],
      'P': ['Poy', 'Pul', 'Pichoq'],
      'Q': ['Qalam', 'Qiz', 'Qush'],
      'R': ['Rang', 'Rasm', 'Ruchka'],
      'S': ['Suv', 'Sichqon', 'Sut'],
      'T': ['Tosh', 'Tovuq', 'Tuz'],
      'U': ['Uy', 'Uch', 'Uzum'],
      'V': ['Voy', 'Vazifa', 'Vilka'],
      'X': ['Xona', 'Xat', 'Xalq'],
      'Y': ['Yoz', 'Yil', 'Yuz'],
      'Z': ['Zar', 'Zamin', 'Zarb'],
      'O\'': ['O\'q', 'O\'t', 'O\'g\'il'],
      'G\'': ['G\'isht', 'G\'oza', 'G\'oyib'],
      'Sh': ['Shahar', 'Shamol', 'Shox'],
      'Ch': ['Choy', 'Chiroq', 'Chiqish'],
      'Ng': ['Nga', 'Ngiz', 'Ngaq'],
    };
    return examples[letter] || ['So\'z 1', 'So\'z 2', 'So\'z 3'];
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
                <Card key={`${currentLetter}-${word}-${idx}`} className="text-center">
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

          {/* Harf navigatsiya tugmalari */}
          <div className="text-center flex gap-4 justify-center items-center">
            {/* A harfida bo'lsa "Oldingi harf" tugmasini yashirish */}
            {currentLetter !== 'A' && (
              <button
                onClick={handlePreviousLetter}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                ← Oldingi harf
              </button>
            )}
            {/* Oxirgi harfda (Ng) bo'lsa "Keyingi harf" tugmasini yashirish */}
            {currentLetter !== 'Ng' && (
              <button
                onClick={handleNextLetter}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                Keyingi harf →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Markazda dumaloq mikrofonga tugma */}
      <RealtimeMicButton
        onTranscript={handleTranscript}
        onStart={() => {
          // Mikrofon bosilganda harfni o'zgartirmaslik
          // Faqat birinchi marta A harfini o'rnatish
          if (!currentLetter) {
            setCurrentLetter('A');
            setExampleWords(['Anor', 'Olma', 'Archa']);
          }
        }}
      />
    </div>
  );
}

