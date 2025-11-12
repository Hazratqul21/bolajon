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
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  
  // O'zbek alifbosi to'g'ri tartibi
  const allLetters = ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'O\'', 'G\'', 'Sh', 'Ch', 'Ng'];

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
    setExampleWords(['Anor', 'Archa', 'Avtobus']);
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
      const words = textLower.split(/\s+/).filter(w => w.length > 0);
      const startsWithLetter = words.some(word => {
        // 1. Misol so'zlardan birini to'liq aytganmi? (eng aniq)
        const exactMatch = exampleWords.some(exWord => {
          const exWordLower = exWord.toLowerCase();
          return word === exWordLower || word.startsWith(exWordLower);
        });
        if (exactMatch) return true;
        
        // 2. To'g'ridan-to'g'ri harf bilan boshlanish (faqat birinchi harf)
        if (word.charAt(0) === letterLower) return true;
        
        // 3. Maxsus harflar uchun (O', G', Sh, Ch, Ng)
        if (letter === "O'" && word.startsWith("o'")) return true;
        if (letter === "G'" && word.startsWith("g'")) return true;
        if (letter === "Sh" && word.startsWith("sh")) return true;
        if (letter === "Ch" && word.startsWith("ch")) return true;
        // Ng harfi so'zning o'rtasida yoki oxirida bo'lishi mumkin
        if (letter === "Ng" && (word.includes("ng") || word.includes("qo'ng") || word.includes("ming"))) return true;
        
        return false;
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
  
  const handleLetterSelect = (letter: string) => {
    setCurrentLetter(letter);
    setExampleWords(getExampleWords(letter));
    setShowLibrary(false);
    setAiMessages((prev) => [
      ...prev,
      {
        text: `Endi ${letter} harfini o'rganamiz!`,
        type: 'ai',
      },
    ]);
  };

  const handleNextLetter = () => {
    const currentIndex = allLetters.indexOf(currentLetter || 'A');
    const nextIndex = (currentIndex + 1) % allLetters.length;
    const nextLetter = allLetters[nextIndex];
    handleLetterSelect(nextLetter);
  };
  
  const handlePreviousLetter = () => {
    const currentIndex = allLetters.indexOf(currentLetter || 'A');
    const prevIndex = currentIndex === 0 ? allLetters.length - 1 : currentIndex - 1;
    const prevLetter = allLetters[prevIndex];
    handleLetterSelect(prevLetter);
  };
  
  const getExampleWords = (letter: string): string[] => {
    const examples: Record<string, string[]> = {
      'A': ['Anor', 'Archa', 'Avtobus'],
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
      'Ng': ['Ming', 'Qo\'ng\'iroq', 'Qo\'ng\'iz'],
    };
    return examples[letter] || ['So\'z 1', 'So\'z 2', 'So\'z 3'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
      {/* Harflar kutubxonasi - chap tomonda */}
      <div className={`${showLibrary ? 'w-72' : 'w-20'} bg-gradient-to-b from-blue-50 to-purple-50 shadow-xl transition-all duration-300 overflow-hidden flex flex-col border-r-2 border-blue-200`}>
        {/* Toggle tugmasi */}
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
        >
          {showLibrary ? (
            <>
              <span className="text-2xl">📚</span>
              <span>Harflar Kutubxonasi</span>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">📚</span>
              <span className="text-xs">Harflar</span>
            </div>
          )}
        </button>

        {/* Harflar ro'yxati */}
        {showLibrary && (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">O'zbek Alifbosi</h3>
            <div className="grid grid-cols-4 gap-2">
              {allLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleLetterSelect(letter)}
                  className={`p-4 rounded-xl font-bold text-xl transition-all transform ${
                    currentLetter === letter
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white scale-110 shadow-xl ring-4 ring-blue-300'
                      : 'bg-white hover:bg-blue-100 text-gray-700 hover:scale-105 shadow-md hover:shadow-lg border-2 border-transparent hover:border-blue-300'
                  }`}
                  title={getExampleWords(letter)[0]}
                >
                  {letter}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 text-center">
                💡 Hohlagan harfni tanlang va mashq qiling!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Asosiy kontent */}
      <div className="flex-1 overflow-y-auto">
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
          <div className="text-center flex gap-4 justify-center items-center mb-24">
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

          {/* Mikrofon tugmasi - tugmalardan pastda */}
          <div className="flex justify-center items-center pb-8">
            <RealtimeMicButton
              onTranscript={handleTranscript}
              onStart={() => {
                // Mikrofon bosilganda harfni o'zgartirmaslik
                // Faqat birinchi marta A harfini o'rnatish
                if (!currentLetter) {
                  setCurrentLetter('A');
                  setExampleWords(['Anor', 'Archa', 'Avtobus']);
                }
              }}
            />
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

