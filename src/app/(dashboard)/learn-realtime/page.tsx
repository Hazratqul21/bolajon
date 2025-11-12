'use client';

import { useState, useEffect, useRef } from 'react';
import { RealtimeMicButton } from '@/components/realtime/RealtimeMicButton';
import { Card, CardContent } from '@/components/ui/card';
import confetti from 'canvas-confetti';
import { textToSpeech } from '@/lib/muxlisa-client';

export default function LearnRealtimePage() {
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<Array<{ text: string; type: 'ai' | 'user' }>>([]);
  const [exampleWords, setExampleWords] = useState<string[]>([]);
  const [exampleImages, setExampleImages] = useState<string[]>([]);
  const [childName, setChildName] = useState<string>('');
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [letterProgress, setLetterProgress] = useState<number>(0); // Progress 0-100
  const [learnedLetters, setLearnedLetters] = useState<Set<string>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
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
    loadImagesForWords(['Anor', 'Archa', 'Avtobus']);
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentLetter) return;
      
      if (e.key === 'ArrowLeft' && currentLetter !== 'A') {
        const currentIndex = allLetters.indexOf(currentLetter);
        const prevIndex = currentIndex === 0 ? allLetters.length - 1 : currentIndex - 1;
        const prevLetter = allLetters[prevIndex];
        handleLetterSelect(prevLetter);
      } else if (e.key === 'ArrowRight' && currentLetter !== 'Ng') {
        const currentIndex = allLetters.indexOf(currentLetter);
        const nextIndex = (currentIndex + 1) % allLetters.length;
        const nextLetter = allLetters[nextIndex];
        handleLetterSelect(nextLetter);
      } else if (e.key === 'Escape') {
        setShowLibrary(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLetter, allLetters]);

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
        // Ng harfi so'zning o'rtasida yoki oxirida bo'lishi mumkin, lekin boshlanishida emas
        if (letter === "Ng") {
          // Faqat misol so'zlardan birini to'liq aytgan bo'lsa
          const ngExamples = ['ming', 'qo\'ng\'iroq', 'qo\'ng\'iz'];
          if (ngExamples.some(ex => word === ex || word.startsWith(ex))) return true;
          // So'zning o'rtasida yoki oxirida "ng" bo'lishi kerak, lekin boshlanishida emas
          const ngIndex = word.indexOf('ng');
          if (ngIndex > 0 && ngIndex < word.length - 2) return true; // O'rtasida
          if (ngIndex === word.length - 2) return true; // Oxirida
        }
        
        return false;
      });
      
      let response = '';
      
      if (startsWithLetter) {
        // To'g'ri! - Confetti animatsiyasi
        triggerConfetti();
        
        // Progress yangilash
        setLetterProgress(prev => Math.min(prev + 10, 100));
        if (letterProgress >= 90) {
          setLearnedLetters(prev => new Set([...prev, letter]));
        }
        
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
    const words = getExampleWords(letter);
    setExampleWords(words);
    loadImagesForWords(words);
    setShowLibrary(false);
    setLetterProgress(learnedLetters.has(letter) ? 100 : 0);
    setAiMessages((prev) => [
      ...prev,
      {
        text: `Endi ${letter} harfini o'rganamiz!`,
        type: 'ai',
      },
    ]);
    // Harfni ovozli aytish
    speakLetter(letter);
  };
  
  // Rasmlarni yuklash (Unsplash API yoki placeholder)
  const loadImagesForWords = async (words: string[]) => {
    const images: string[] = [];
    for (const word of words) {
      try {
        // Unsplash API dan rasmlar olish (free tier)
        // Eslatma: Unsplash API key .env.local faylida NEXT_PUBLIC_UNSPLASH_ACCESS_KEY sifatida saqlanishi kerak
        const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
        if (unsplashKey) {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1&client_id=${unsplashKey}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              images.push(data.results[0].urls.small);
            } else {
              images.push(''); // Fallback
            }
          } else {
            images.push(''); // Fallback
          }
        } else {
          // Unsplash key bo'lmasa, placeholder ishlatish
          images.push(`https://via.placeholder.com/300x200/3b82f6/ffffff?text=${encodeURIComponent(word)}`);
        }
      } catch (error) {
        // Fallback: placeholder image
        images.push(`https://via.placeholder.com/300x200/3b82f6/ffffff?text=${encodeURIComponent(word)}`);
      }
    }
    setExampleImages(images);
  };
  
  // Harfni ovozli aytish (TTS)
  const speakLetter = async (letter: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      const text = `Bu ${letter} harfi`;
      const result = await textToSpeech(text);
      
      if (result.audio_url && result.audio_url !== 'web-speech-api') {
        const audio = new Audio(result.audio_url);
        audio.play().catch(err => console.warn('Audio play error:', err));
      } else {
        // Fallback: Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'uz-UZ';
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.warn('TTS error:', error);
    } finally {
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };
  
  // Misol so'zni ovozli aytish
  const speakWord = async (word: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      const result = await textToSpeech(word);
      
      if (result.audio_url && result.audio_url !== 'web-speech-api') {
        const audio = new Audio(result.audio_url);
        audio.play().catch(err => console.warn('Audio play error:', err));
      } else {
        // Fallback: Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.lang = 'uz-UZ';
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.warn('TTS error:', error);
    } finally {
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };
  
  // Confetti animatsiyasi
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
    });
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
              <p className="text-sm text-gray-700 text-center mb-2">
                💡 Hohlagan harfni tanlang va mashq qiling!
              </p>
              <p className="text-xs text-gray-600 text-center">
                ⌨️ Klaviatura: ← → harflar, Esc yopish
              </p>
            </div>
            
            {/* O'rganilgan harflar */}
            {learnedLetters.size > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-800 text-center mb-2">
                  ✅ O'rganilgan harflar: {learnedLetters.size}/{allLetters.length}
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {Array.from(learnedLetters).map(letter => (
                    <span key={letter} className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-bold">
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Asosiy kontent */}
      <div className="flex-1 overflow-y-auto">
        {currentLetter && (
          <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="text-9xl font-bold text-blue-600 mb-4 animate-bounce">{currentLetter}</div>
            <p className="text-2xl text-gray-700 mb-4">Bu {currentLetter} harfi</p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-gray-700">{letterProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${letterProgress}%` }}
                />
              </div>
            </div>
            
            {/* TTS Tugmasi */}
            <button
              onClick={() => speakLetter(currentLetter)}
              disabled={isSpeaking}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSpeaking ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Ovoz berilmoqda...</span>
                </>
              ) : (
                <>
                  <span>🔊</span>
                  <span>Qayta eshitish</span>
                </>
              )}
            </button>
          </div>

          {/* So'zlar va rasmlar */}
          {exampleWords.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {exampleWords.map((word, idx) => (
                <Card key={`${currentLetter}-${word}-${idx}`} className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => speakWord(word)}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-2">{word}</div>
                    {exampleImages[idx] ? (
                      <img
                        src={exampleImages[idx]}
                        alt={word}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200?text=${word}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(word);
                      }}
                      className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                    >
                      🔊 Eshitish
                    </button>
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

